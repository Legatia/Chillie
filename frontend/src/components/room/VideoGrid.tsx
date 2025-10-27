import { useEffect, useRef } from "react";
import { User } from "lucide-react";

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isVideoEnabled: boolean;
}

const VideoGrid = ({ localStream, remoteStreams, isVideoEnabled }: VideoGridProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    remoteStreams.forEach((stream, peerId) => {
      const videoEl = remoteVideoRefs.current.get(peerId);
      if (videoEl) {
        videoEl.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const allStreams = [
    { id: "local", stream: localStream, isLocal: true },
    ...Array.from(remoteStreams.entries()).map(([id, stream]) => ({
      id,
      stream,
      isLocal: false,
    })),
  ];

  return (
    <div className="flex-1 p-4 grid gap-4 auto-rows-fr" style={{
      gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(allStreams.length))}, 1fr)`,
    }}>
      {allStreams.map(({ id, stream, isLocal }) => (
        <div
          key={id}
          className="relative bg-card rounded-lg overflow-hidden border border-border shadow-lg"
          style={{ minHeight: "200px" }}
        >
          {stream && isVideoEnabled ? (
            <video
              ref={isLocal ? localVideoRef : (el) => {
                if (el) remoteVideoRefs.current.set(id, el);
              }}
              autoPlay
              playsInline
              muted={isLocal}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            {isLocal ? "You" : `Peer ${id.slice(0, 6)}`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
