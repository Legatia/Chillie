import { useEffect, useState, useRef } from "react";
import Peer, { DataConnection } from "peerjs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Participant } from '../types/graphql';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
}

export interface RoomParticipant {
  id: string;
  name: string;
  peerId: string;
  isHost: boolean;
  joinedAt: string;
}

export const usePeerConnection = (
  roomId: string,
  participantId?: string,
  participantName?: string,
  chainId?: string
) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [connections, setConnections] = useState<Map<string, DataConnection>>(new Map());
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const screenStreamRef = useRef<MediaStream | null>(null);
  const localParticipantId = useRef(participantId || uuidv4());
  const localParticipantName = useRef(participantName || `User-${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {
    const initPeer = async () => {
      const newPeer = new Peer(roomId, {
        host: import.meta.env.VITE_PEERJS_HOST || "0.peerjs.com",
        port: Number(import.meta.env.VITE_PEERJS_PORT) || 443,
        secure: import.meta.env.VITE_PEERJS_SECURE === "true",
      });

      // Add local participant to participants list
      setParticipants([{
        id: localParticipantId.current,
        name: localParticipantName.current,
        peerId: roomId,
        isHost: false, // This would be determined from blockchain state
        joinedAt: new Date().toISOString(),
      }]);

      newPeer.on("open", (id) => {
        console.log("Peer connected with ID:", id);
        toast({
          title: "Connected to room",
          description: `${localParticipantName.current} joined the room`,
        });

        // Announce participant join
        broadcastParticipantJoin(localParticipantId.current, localParticipantName.current);
      });

      newPeer.on("connection", (conn) => {
        setupConnection(conn);
      });

      newPeer.on("disconnected", () => {
        console.log("Peer disconnected from room");
        toast({
          title: "Disconnected",
          description: "You have been disconnected from the room",
          variant: "destructive",
        });
      });

      newPeer.on("call", (call) => {
        if (localStream) {
          call.answer(localStream);
          call.on("stream", (remoteStream) => {
            setRemoteStreams((prev) => new Map(prev).set(call.peer, remoteStream));
          });
        }
      });

      setPeer(newPeer);

      // Get user media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: "Camera/Mic access denied",
          description: "Please allow access to use video chat",
          variant: "destructive",
        });
      }
    };

    initPeer();

    return () => {
      peer?.destroy();
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId]);

  const setupConnection = (conn: DataConnection) => {
    conn.on("open", () => {
      setConnections((prev) => new Map(prev).set(conn.peer, conn));
    });

    conn.on("data", (data: any) => {
      switch (data.type) {
        case "message":
          setMessages((prev) => [...prev, data.message]);
          break;
        case "participant_join":
          setParticipants((prev) => [
            ...prev,
            {
              id: data.participantId,
              name: data.participantName,
              peerId: conn.peer,
              isHost: false,
              joinedAt: new Date().toISOString(),
            }
          ]);
          toast({
            title: "New participant",
            description: `${data.participantName} joined the room`,
          });
          break;
        case "participant_leave":
          setParticipants((prev) => prev.filter(p => p.id !== data.participantId));
          toast({
            title: "Participant left",
            description: `${data.participantName} left the room`,
          });
          break;
      }
    });

    conn.on("close", () => {
      setConnections((prev) => {
        const newConns = new Map(prev);
        newConns.delete(conn.peer);
        return newConns;
      });
      setRemoteStreams((prev) => {
        const newStreams = new Map(prev);
        newStreams.delete(conn.peer);
        return newStreams;
      });
    });
  };

  const broadcastParticipantJoin = (participantId: string, participantName: string) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send({
          type: "participant_join",
          participantId,
          participantName,
        });
      }
    });
  };

  const broadcastParticipantLeave = (participantId: string, participantName: string) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send({
          type: "participant_leave",
          participantId,
          participantName,
        });
      }
    });
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      
      // Resume camera
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);

        // Pause camera while screen sharing
        if (localStream) {
          localStream.getVideoTracks().forEach((track) => {
            track.enabled = false;
          });
        }

        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
        toast({
          title: "Screen share failed",
          description: "Could not start screen sharing",
          variant: "destructive",
        });
      }
    }
  };

  const sendMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      senderId: localParticipantId.current,
      senderName: localParticipantName.current,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, message]);

    connections.forEach((conn) => {
      conn.send({ type: "message", message });
    });
  };

  const leaveRoom = () => {
    // Broadcast leave to other participants
    broadcastParticipantLeave(localParticipantId.current, localParticipantName.current);

    peer?.destroy();
    localStream?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    navigate("/");
  };

  return {
    localStream: isScreenSharing ? screenStreamRef.current : localStream,
    remoteStreams,
    messages,
    participants,
    localParticipantId: localParticipantId.current,
    localParticipantName: localParticipantName.current,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    sendMessage,
    leaveRoom,
  };
};
