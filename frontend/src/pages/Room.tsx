import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users, AlertCircle, CheckCircle } from "lucide-react";
import VideoGrid from "@/components/room/VideoGrid";
import ChatPanel from "@/components/room/ChatPanel";
import ControlBar from "@/components/room/ControlBar";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { useJoinRoom, useRoomState, useParticipants, useRoomAuthorization, useVote } from "@/hooks/useBlockchain";
import { useToast } from "@/hooks/use-toast";
import { VotingPanel } from "@/components/competition/VotingPanel";
import { v4 as uuidv4 } from 'uuid';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showVoting, setShowVoting] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantId, setParticipantId] = useState("");

  // Get blockchain data from navigation state
  const blockchainState = location.state as {
    chainId?: string;
    appId?: string;
    isHost?: boolean;
    roomName?: string;
  } || {};

  // Blockchain hooks
  const { joinRoom } = useJoinRoom();
  const { roomState, isLoading: isLoadingRoomState } = useRoomState(blockchainState.chainId);
  const { participants, isLoading: isLoadingParticipants } = useParticipants(blockchainState.chainId);
  const { isHost, canManageRoom, canVote } = useRoomAuthorization(blockchainState.chainId, participantId);
  const { castVote } = useVote(blockchainState.chainId);

  // Competition data would come from blockchain in a full implementation
  // For now, competitions are not implemented

  const {
    localStream,
    remoteStreams,
    messages,
    participants: peerParticipants,
    localParticipantId,
    localParticipantName,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    sendMessage,
    leaveRoom,
  } = usePeerConnection(
    roomId || "",
    participantId,
    participantName,
    blockchainState.chainId
  );

  // Handle joining the room on blockchain
  const handleJoinRoom = async () => {
    if (!participantName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to join the room.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const newParticipantId = uuidv4();

      // Always attempt to join room on blockchain if not host
      // The mock service will handle cases where chainId is missing
      if (!blockchainState.isHost) {
        await joinRoom({
          participant_id: newParticipantId,
          participant_name: participantName.trim(),
        });
      }

      setParticipantId(newParticipantId);
      setHasJoined(true);

      toast({
        title: "Joined Room!",
        description: `You have joined "${blockchainState.roomName || roomId}"`,
      });
    } catch (error) {
      console.error('Failed to join room:', error);
      toast({
        title: "Failed to Join Room",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Auto-join for hosts
  useEffect(() => {
    if (blockchainState.isHost && roomId && !hasJoined) {
      const hostId = uuidv4();
      const hostName = blockchainState.roomName ? `Host (${blockchainState.roomName})` : "Host";
      setParticipantId(hostId);
      setParticipantName(hostName);
      setHasJoined(true);
    }
  }, [blockchainState.isHost, blockchainState.roomName, roomId, hasJoined]);

  // Voting functionality disabled - requires blockchain implementation
  // const handleVote = async (optionId: string) => {
  //   try {
  //     await castVote(competitionId, optionId);
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  // Show join form if haven't joined yet (and not auto-joined host)
  if (!hasJoined && !blockchainState.isHost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 border-2">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Join Room</h1>
              <p className="text-muted-foreground">
                {blockchainState.roomName || roomId}
              </p>
              <Badge variant="secondary" className="mt-2">
                Wallet-less Joining ✨
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Your Name
                </Label>
                <Input
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your name"
                  className="text-lg"
                  disabled={isJoining}
                  onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                />
              </div>

              {blockchainState.chainId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This room is powered by blockchain technology. Your participation will be recorded on-chain.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleJoinRoom}
                disabled={!participantName.trim() || isJoining}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Join Room
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
                disabled={isJoining}
              >
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">
                {blockchainState.roomName || "Chillie Room"}
              </h1>
              {blockchainState.isHost && (
                <Badge variant="default">Host</Badge>
              )}
              {blockchainState.chainId && (
                <Badge variant="secondary" className="text-xs">
                  🔗 Blockchain
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Room ID: {roomId} • You: {localParticipantName || participantName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {participants.length + peerParticipants.length} Participants
              </p>
              {blockchainState.chainId && (
                <p className="text-xs text-muted-foreground">
                  Chain: {blockchainState.chainId.slice(0, 10)}...
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
          />
          <ControlBar
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={isScreenSharing}
            isChatOpen={isChatOpen}
            showVoting={showVoting}
            canVote={canVote}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            onToggleVoting={() => setShowVoting(!showVoting)}
            onLeaveRoom={leaveRoom}
          />
        </div>

        <div className="w-80 border-l border-border bg-card flex flex-col">
          {isChatOpen && (
            <div className={`flex-1 ${showVoting ? 'border-b border-border' : ''}`}>
              <ChatPanel messages={messages} onSendMessage={sendMessage} />
            </div>
          )}
          {showVoting && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-semibold mb-2">Voting Not Implemented</h3>
                <p className="text-sm">Voting functionality requires blockchain smart contract implementation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Room;
