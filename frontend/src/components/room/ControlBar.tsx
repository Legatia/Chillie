import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Phone,
  Vote,
} from "lucide-react";

interface ControlBarProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  showVoting?: boolean;
  canVote?: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleVoting?: () => void;
  onLeaveRoom: () => void;
}

const ControlBar = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isChatOpen,
  showVoting = false,
  canVote = true,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleVoting,
  onLeaveRoom,
}: ControlBarProps) => {
  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex items-center justify-center gap-3">
        <Button
          variant={isAudioEnabled ? "secondary" : "destructive"}
          size="icon"
          onClick={onToggleAudio}
          className="h-12 w-12 rounded-full"
        >
          {isAudioEnabled ? (
            <Mic className="h-5 w-5" />
          ) : (
            <MicOff className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant={isVideoEnabled ? "secondary" : "destructive"}
          size="icon"
          onClick={onToggleVideo}
          className="h-12 w-12 rounded-full"
        >
          {isVideoEnabled ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant={isScreenSharing ? "default" : "secondary"}
          size="icon"
          onClick={onToggleScreenShare}
          className="h-12 w-12 rounded-full"
        >
          {isScreenSharing ? (
            <MonitorOff className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant={isChatOpen ? "default" : "secondary"}
          size="icon"
          onClick={onToggleChat}
          className="h-12 w-12 rounded-full"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        {canVote && onToggleVoting && (
          <Button
            variant={showVoting ? "default" : "secondary"}
            size="icon"
            onClick={onToggleVoting}
            className="h-12 w-12 rounded-full"
            title="Voting Panel"
          >
            <Vote className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="destructive"
          size="icon"
          onClick={onLeaveRoom}
          className="h-12 w-12 rounded-full"
        >
          <Phone className="h-5 w-5 rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
};

export default ControlBar;
