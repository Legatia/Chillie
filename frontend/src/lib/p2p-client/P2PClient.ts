import { SignalClient } from './SignalClient';

export interface P2PConfig {
    signalingUrl: string;
    roomId: string;
    peerId: string;
    turnServers: RTCIceServer[];
    privacyMode: boolean;
}

export class P2PClient {
    private config: P2PConfig;
    private peerConnections: Map<string, RTCPeerConnection> = new Map();
    private dataChannels: Map<string, RTCDataChannel> = new Map();
    private localStream: MediaStream | null = null;
    public signalClient: SignalClient;

    // Callbacks
    public onTrack: ((stream: MediaStream, peerId: string) => void) | null = null;
    public onData: ((data: any, peerId: string) => void) | null = null;
    public onPeerJoined: ((peerId: string) => void) | null = null;
    public onPeerLeft: ((peerId: string) => void) | null = null;

    constructor(config: P2PConfig) {
        this.config = config;
        this.signalClient = new SignalClient(config.signalingUrl, config.roomId, config.peerId);

        this.signalClient.onMessage(this.handleSignalMessage.bind(this));
        this.signalClient.onPeerJoined(this.handlePeerJoined.bind(this));
    }

    async start(stream: MediaStream | null) {
        this.localStream = stream;
        await this.signalClient.connect();
    }

    private async handlePeerJoined(peerId: string, publicKey: string) {
        // When a peer joins, we (the existing peer) initiate the connection
        // But we need to decide who initiates to avoid glare.
        // Simple rule: lexicographical comparison of peerIds?
        // Or just let the new peer initiate?
        // In the reference implementation, it seems the new peer registers, then gets notified of existing peers.
        // The existing peers get notified of the new peer.

        // Let's stick to: if my ID > their ID, I initiate.
        // Actually, the reference SignalClient logic implies we just get 'peer_joined'.

        // For simplicity: We will initiate connection to the new peer.
        // To avoid glare, we can use the "polite peer" pattern or just simple ID comparison.
        // Let's assume the one who receives 'peer_joined' (existing peer) initiates.

        console.log(`Peer joined: ${peerId}`);
        if (this.onPeerJoined) this.onPeerJoined(peerId);

        await this.connectToPeer(peerId, publicKey);
    }

    /**
     * Connect to a peer
     */
    async connectToPeer(targetPeerId: string, targetPubKey: string) {
        if (this.peerConnections.has(targetPeerId)) return;

        const pc = this.createPeerConnection(targetPeerId, targetPubKey);

        // Create Data Channel
        const dc = pc.createDataChannel("chat");
        this.setupDataChannel(dc, targetPeerId);

        // Add tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream!);
            });
        }

        // Create Offer
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.signalClient.sendSignal(targetPeerId, { type: 'offer', sdp: offer.sdp }, targetPubKey);
        } catch (e) {
            console.error("Error creating offer:", e);
        }
    }

    private createPeerConnection(targetPeerId: string, targetPubKey: string): RTCPeerConnection {
        const iceTransportPolicy = this.config.privacyMode ? 'relay' : 'all';
        const pc = new RTCPeerConnection({
            iceServers: this.config.turnServers,
            iceTransportPolicy: iceTransportPolicy as RTCIceTransportPolicy
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.signalClient.sendSignal(targetPeerId, { type: 'candidate', candidate: event.candidate }, targetPubKey);
            }
        };

        pc.ontrack = (event) => {
            if (this.onTrack && event.streams[0]) {
                this.onTrack(event.streams[0], targetPeerId);
            }
        };

        pc.ondatachannel = (event) => {
            this.setupDataChannel(event.channel, targetPeerId);
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                this.cleanupPeer(targetPeerId);
            }
        };

        this.peerConnections.set(targetPeerId, pc);
        return pc;
    }

    private setupDataChannel(dc: RTCDataChannel, peerId: string) {
        dc.onopen = () => {
            this.dataChannels.set(peerId, dc);
        };
        dc.onmessage = (event) => {
            if (this.onData) {
                try {
                    const data = JSON.parse(event.data);
                    this.onData(data, peerId);
                } catch (e) {
                    console.error("Failed to parse data channel message", e);
                }
            }
        };
        dc.onclose = () => {
            this.dataChannels.delete(peerId);
        };
    }

    private async handleSignalMessage(senderPubKey: string, payload: any) {
        // Use senderPubKey as peerId for now (or map it if we had the map)
        // In SignalClient we pass senderPubKey as the first arg to callback
        const peerId = senderPubKey;

        let pc = this.peerConnections.get(peerId);

        if (!pc) {
            // If we receive an offer from an unknown peer, we accept it
            if (payload.type === 'offer') {
                pc = this.createPeerConnection(peerId, senderPubKey);
            } else {
                console.warn("Received non-offer signal from unknown peer", payload.type);
                return;
            }
        }

        try {
            if (payload.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: payload.sdp }));

                // Add our tracks to the answer
                if (this.localStream) {
                    this.localStream.getTracks().forEach(track => {
                        // Check if track already added? addTrack throws if already added? 
                        // Actually addTrack is fine, but we should check senders.
                        const senders = pc!.getSenders();
                        const hasTrack = senders.some(s => s.track === track);
                        if (!hasTrack) {
                            pc!.addTrack(track, this.localStream!);
                        }
                    });
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                this.signalClient.sendSignal(peerId, { type: 'answer', sdp: answer.sdp }, senderPubKey);

                // Notify that we found a peer (if we didn't initiate)
                if (this.onPeerJoined) this.onPeerJoined(peerId);

            } else if (payload.type === 'answer') {
                await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: payload.sdp }));
            } else if (payload.type === 'candidate') {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            }
        } catch (e) {
            console.error("Error handling signal message:", e);
        }
    }

    sendData(data: any) {
        const msg = JSON.stringify(data);
        this.dataChannels.forEach(dc => {
            if (dc.readyState === 'open') {
                dc.send(msg);
            }
        });
    }

    private cleanupPeer(peerId: string) {
        const pc = this.peerConnections.get(peerId);
        if (pc) {
            pc.close();
            this.peerConnections.delete(peerId);
        }
        this.dataChannels.delete(peerId);
        if (this.onPeerLeft) this.onPeerLeft(peerId);
    }

    destroy() {
        this.localStream?.getTracks().forEach(track => track.stop());
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        this.dataChannels.clear();
        // Close websocket? SignalClient doesn't expose close yet, but it's fine.
    }
}
