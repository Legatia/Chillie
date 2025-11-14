import { useEffect, useRef, useState } from "react";
import { User, Mic, MicOff, Video, VideoOff, Volume2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isVideoEnabled: boolean;
  isAudioEnabled?: boolean;
}

const VideoGrid = ({
  localStream,
  remoteStreams,
  isVideoEnabled,
  isAudioEnabled = true
}: VideoGridProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

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
    {
      id: "local",
      stream: localStream,
      isLocal: true,
      name: "You",
      isMuted: !isAudioEnabled,
      hasVideo: isVideoEnabled
    },
    ...Array.from(remoteStreams.entries()).map(([id, stream]) => ({
      id,
      stream,
      isLocal: false,
      name: `Participant ${id.slice(0, 6)}`,
      isMuted: false, // Would need to get actual audio state from peer connection
      hasVideo: true
    })),
  ];

  const getGridLayout = () => {
    const count = allStreams.length;
    if (count === 0) return "grid-cols-1";
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  const VideoCard = ({ participant, isExpanded }: {
    participant: typeof allStreams[0];
    isExpanded: boolean;
  }) => (
    <motion.div
      className={`relative group ${
        isExpanded
          ? "fixed inset-4 z-50 bg-background/95 backdrop-blur-md rounded-2xl border-2 border-primary/50"
          : "bg-card rounded-xl overflow-hidden border border-border/50 shadow-lg hover:shadow-2xl"
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: isExpanded ? 1 : 1,
        transition: { duration: 0.3 }
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!isExpanded ? { scale: 1.02 } : {}}
      onHoverStart={() => !isExpanded && setHoveredVideo(participant.id)}
      onHoverEnd={() => !isExpanded && setHoveredVideo(null)}
      style={{ minHeight: isExpanded ? "auto" : "250px" }}
    >
      {/* Video Content */}
      {participant.stream && participant.hasVideo ? (
        <div className="relative w-full h-full">
          <video
            ref={participant.isLocal ? localVideoRef : (el) => {
              if (el) remoteVideoRefs.current.set(participant.id, el);
            }}
            autoPlay
            playsInline
            muted={participant.isLocal}
            className={`w-full h-full object-cover ${
              isExpanded ? "rounded-2xl" : "rounded-xl"
            }`}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${
          isExpanded
            ? "bg-gradient-to-br from-primary/10 to-accent/10"
            : "bg-gradient-to-br from-muted to-muted/50"
        }`}>
          <div className="text-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <User className={`w-${isExpanded ? '32' : '16'} h-${isExpanded ? '32' : '16'} text-muted-foreground`} />
            </motion.div>
            <p className="mt-2 text-sm text-muted-foreground">Camera Off</p>
          </div>
        </div>
      )}

      {/* Participant Info */}
      <div className={`absolute bottom-4 left-4 right-4 flex items-center justify-between`}>
        <motion.div
          className="bg-black/70 backdrop-blur-md px-3 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            {participant.isMuted ? (
              <MicOff className="w-4 h-4 text-red-400" />
            ) : (
              <Mic className="w-4 h-4 text-green-400" />
            )}
            {!participant.hasVideo && (
              <VideoOff className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          <span>{participant.name}</span>
          {participant.isLocal && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </motion.div>

        {/* Control Buttons */}
        <AnimatePresence>
          {hoveredVideo === participant.id && !isExpanded && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <motion.button
                className="bg-black/70 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/80 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setExpandedVideo(participant.id)}
              >
                <Maximize2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close Button for Expanded View */}
      {isExpanded && (
        <motion.button
          className="absolute top-4 right-4 bg-black/70 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/80 transition-colors"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setExpandedVideo(null)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      )}

      {/* Status Indicators */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        {participant.isLocal && (
          <motion.div
            className="bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            You
          </motion.div>
        )}
        {!participant.hasVideo && (
          <motion.div
            className="bg-yellow-500/90 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <VideoOff className="w-3 h-3" />
            Camera Off
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <div className={`flex-1 p-6 grid gap-4 auto-rows-fr ${getGridLayout()}`}>
        <AnimatePresence mode="wait">
          {allStreams.map((participant) => (
            <VideoCard
              key={participant.id}
              participant={participant}
              isExpanded={expandedVideo === participant.id}
            />
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {allStreams.length === 0 && (
          <motion.div
            className="col-span-full flex items-center justify-center min-h-[400px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Video className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                No participants yet
              </h3>
              <p className="text-muted-foreground">
                Waiting for others to join the room...
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Expanded Video Overlay */}
      <AnimatePresence>
        {expandedVideo && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedVideo(null)}
          >
            <motion.div
              className="w-full max-w-6xl max-h-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {allStreams
                .filter(p => p.id === expandedVideo)
                .map(participant => (
                  <VideoCard
                    key={participant.id}
                    participant={participant}
                    isExpanded={true}
                  />
                ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoGrid;
