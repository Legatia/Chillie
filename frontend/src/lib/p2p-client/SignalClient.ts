import { CryptoUtils } from './crypto';
import nacl from 'tweetnacl';

export class SignalClient {
    private ws: WebSocket | null = null;
    private signalingUrl: string;
    private roomId: string;
    private peerId: string;
    private keyPair: nacl.BoxKeyPair;
    private peerPublicKeys: Map<string, Uint8Array> = new Map();
    private onMessageCallback: ((senderPubKey: string, payload: any) => void) | null = null;
    private onPeerJoinedCallback: ((peerId: string, publicKey: string) => void) | null = null;

    constructor(signalingUrl: string, roomId: string, peerId: string) {
        this.signalingUrl = signalingUrl;
        this.roomId = roomId;
        this.peerId = peerId;
        this.keyPair = CryptoUtils.generateKeyPair();
    }

    /**
     * Connect to the signaling server (Node Operator)
     */
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.signalingUrl);

            this.ws.onopen = () => {
                console.log('Connected to signaling server');
                this.register();
                resolve();
            };

            this.ws.onerror = (err) => {
                console.error('WebSocket error:', err);
                reject(err);
            };

            this.ws.onmessage = (event) => {
                try {
                    this.handleIncomingMessage(event.data.toString());
                } catch (e) {
                    console.error('Failed to parse message', e);
                }
            };
        });
    }

    /**
     * Register self with the signaling server
     */
    private register() {
        if (!this.ws) return;

        const msg = {
            jsonrpc: '2.0',
            method: 'register',
            params: {
                peer_id: this.peerId,
                room_id: this.roomId,
                public_key: CryptoUtils.toBase64(this.keyPair.publicKey)
            },
            id: Date.now()
        };

        this.ws.send(JSON.stringify(msg));
    }

    /**
     * Send an encrypted signaling message to a peer
     */
    sendSignal(targetPeerId: string, payload: any, targetPublicKeyBase64?: string) {
        if (!this.ws) throw new Error('Not connected');

        let targetPubKey = this.peerPublicKeys.get(targetPeerId);
        if (!targetPubKey && targetPublicKeyBase64) {
            targetPubKey = CryptoUtils.fromBase64(targetPublicKeyBase64);
            this.peerPublicKeys.set(targetPeerId, targetPubKey);
        }

        if (!targetPubKey) {
            console.warn(`No public key for peer ${targetPeerId}, cannot send signal`);
            return;
        }

        const payloadStr = JSON.stringify(payload);
        const { nonce, ciphertext } = CryptoUtils.encryptMessage(payloadStr, targetPubKey, this.keyPair.secretKey);

        const msg = {
            target_peer_id: targetPeerId,
            room_id: this.roomId,
            payload: CryptoUtils.toBase64(ciphertext),
            nonce: CryptoUtils.toBase64(nonce),
            sender_pubkey: CryptoUtils.toBase64(this.keyPair.publicKey)
        };

        const rpcMsg = {
            jsonrpc: '2.0',
            method: 'relay_message',
            params: msg,
            id: Date.now()
        };

        this.ws.send(JSON.stringify(rpcMsg));
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleIncomingMessage(data: string) {
        try {
            const rpcMsg = JSON.parse(data);

            // Handle registration response or other system messages
            if (rpcMsg.result === 'registered') return;

            if (rpcMsg.method === 'peer_joined') {
                const params = rpcMsg.params;
                const peerId = params.peer_id;
                const publicKey = params.public_key;

                // Store the public key
                this.peerPublicKeys.set(peerId, CryptoUtils.fromBase64(publicKey));

                if (this.onPeerJoinedCallback) {
                    this.onPeerJoinedCallback(peerId, publicKey);
                }
            }
            // Handle relayed messages
            else if (rpcMsg.method === 'relay_message') {
                const params = rpcMsg.params;
                this.decryptAndDispatch(params);
            }
        } catch (e) {
            console.error('Failed to parse incoming message', e);
        }
    }

    /**
     * Decrypt message and notify listener
     */
    private decryptAndDispatch(msg: any) {
        const senderPubKey = CryptoUtils.fromBase64(msg.sender_pubkey);
        const nonce = CryptoUtils.fromBase64(msg.nonce);
        const ciphertext = CryptoUtils.fromBase64(msg.payload);

        const plaintext = CryptoUtils.decryptMessage(ciphertext, nonce, senderPubKey, this.keyPair.secretKey);

        if (plaintext && this.onMessageCallback) {
            const payload = JSON.parse(plaintext);
            // We use the sender's public key as their ID for now if peer_id isn't explicit in the outer layer source
            // In a real implementation, the relay should include 'source_peer_id'
            this.onMessageCallback(CryptoUtils.toBase64(senderPubKey), payload);
        }
    }

    /**
     * Set callback for received decrypted messages
     */
    onMessage(callback: (senderPubKey: string, payload: any) => void) {
        this.onMessageCallback = callback;
    }

    /**
     * Set callback for peer joined events
     */
    onPeerJoined(callback: (peerId: string, publicKey: string) => void) {
        this.onPeerJoinedCallback = callback;
    }

    /**
     * Get my public key
     */
    getPublicKey(): string {
        return CryptoUtils.toBase64(this.keyPair.publicKey);
    }
}
