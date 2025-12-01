use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::Mutex;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::Message;

#[derive(Debug, Clone)]
struct Peer {
    room_id: String,
    peer_id: String,
    public_key: String,
    tx: futures::channel::mpsc::UnboundedSender<Message>,
}

type PeerMap = Arc<Mutex<HashMap<String, Peer>>>;

#[derive(Serialize, Deserialize, Debug)]
struct JsonRpcRequest {
    jsonrpc: String,
    method: String,
    params: Value,
    #[serde(default)]
    id: Option<u64>,
}

#[derive(Serialize, Deserialize, Debug)]
struct JsonRpcResponse {
    jsonrpc: String,
    result: Option<Value>,
    error: Option<Value>,
    #[serde(default)]
    id: Option<u64>,
}

pub async fn start_signaling_server(port: u16) {
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
    println!("Signaling server listening on: {}", addr);

    let peers: PeerMap = Arc::new(Mutex::new(HashMap::new()));

    while let Ok((stream, _)) = listener.accept().await {
        let peers = peers.clone();
        tokio::spawn(handle_connection(peers, stream));
    }
}

async fn handle_connection(peers: PeerMap, stream: TcpStream) {
    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("Error during the websocket handshake: {}", e);
            return;
        }
    };

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let (tx, mut rx) = futures::channel::mpsc::unbounded();

    let mut my_peer_id: Option<String> = None;

    // Task to send messages from the channel to the websocket
    let send_task = tokio::spawn(async move {
        while let Some(message) = rx.next().await {
            if ws_sender.send(message).await.is_err() {
                break;
            }
        }
    });

    while let Some(msg) = ws_receiver.next().await {
        let msg = match msg {
            Ok(msg) => msg,
            Err(_) => break,
        };

        if msg.is_text() {
            if let Ok(text) = msg.to_text() {
                if let Ok(req) = serde_json::from_str::<JsonRpcRequest>(text) {
                    match req.method.as_str() {
                        "register" => {
                            let peer_id = req.params["peer_id"].as_str().unwrap_or_default().to_string();
                            let room_id = req.params["room_id"].as_str().unwrap_or_default().to_string();
                            let public_key = req.params["public_key"].as_str().unwrap_or_default().to_string();

                            if !peer_id.is_empty() && !room_id.is_empty() {
                                my_peer_id = Some(peer_id.clone());
                                let peer = Peer {
                                    room_id: room_id.clone(),
                                    peer_id: peer_id.clone(),
                                    public_key: public_key.clone(),
                                    tx: tx.clone(),
                                };

                                let mut peers_lock = peers.lock().await;
                                peers_lock.insert(peer_id.clone(), peer);
                                
                                // Send response
                                let response = JsonRpcResponse {
                                    jsonrpc: "2.0".to_string(),
                                    result: Some(Value::String("registered".to_string())),
                                    error: None,
                                    id: req.id,
                                };
                                let _ = tx.unbounded_send(Message::Text(serde_json::to_string(&response).unwrap()));
                                println!("Peer {} joined room {}", peer_id, room_id);

                                // Notify existing peers about new peer
                                for (id, p) in peers_lock.iter() {
                                    if p.room_id == room_id && id != &peer_id {
                                        // Notify existing peer about new peer
                                        let notify = serde_json::json!({
                                            "jsonrpc": "2.0",
                                            "method": "peer_joined",
                                            "params": {
                                                "peer_id": peer_id,
                                                "public_key": public_key
                                            }
                                        });
                                        let _ = p.tx.unbounded_send(Message::Text(notify.to_string()));

                                        // Notify new peer about existing peer
                                        let notify_new = serde_json::json!({
                                            "jsonrpc": "2.0",
                                            "method": "peer_joined",
                                            "params": {
                                                "peer_id": p.peer_id,
                                                "public_key": p.public_key
                                            }
                                        });
                                        let _ = tx.unbounded_send(Message::Text(notify_new.to_string()));
                                    }
                                }
                            }
                        }
                        "relay_message" => {
                            let target_peer_id = req.params["target_peer_id"].as_str().unwrap_or_default();
                            let peers_lock = peers.lock().await;
                            
                            if let Some(target_peer) = peers_lock.get(target_peer_id) {
                                let forward_msg = serde_json::json!({
                                    "jsonrpc": "2.0",
                                    "method": "relay_message",
                                    "params": req.params
                                });
                                let _ = target_peer.tx.unbounded_send(Message::Text(forward_msg.to_string()));
                            }
                        }
                        _ => {}
                    }
                }
            }
        } else if msg.is_close() {
            break;
        }
    }

    if let Some(peer_id) = my_peer_id {
        peers.lock().await.remove(&peer_id);
        println!("Peer {} disconnected", peer_id);
    }
    
    // Ensure send_task is aborted if it's still running
    send_task.abort();
}
