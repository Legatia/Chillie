import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, AlertCircle, CheckCircle, Settings, DollarSign, Heart } from "lucide-react";
import VideoGrid from "@/components/room/VideoGrid";
import ChatPanel from "@/components/room/ChatPanel";
import ControlBar from "@/components/room/ControlBar";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { useJoinRoom, useRoomState, useParticipants, useRoomAuthorization, useVote } from "@/hooks/useBlockchain";
import { useToast } from "@/hooks/use-toast";
import { VotingPanel } from "@/components/competition/VotingPanel";
import {
  PaymentSettingsPanel,
  QualitySelector,
  TippingPanel,
  RevenueDashboard,
  WalletBalance,
  PaymentNotifications,
  type PaymentSettings,
  type RoomRevenueBreakdown,
  type PaymentNotification
} from "@/components/payment";
import { v4 as uuidv4 } from 'uuid';

const EnhancedRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Basic room state
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showVoting, setShowVoting] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantId, setParticipantId] = useState("");

  // Payment state
  const [userBalance, setUserBalance] = useState(5000); // Default balance for demo
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    minTip: 50,
    accessFee: 0,
    paymentsEnabled: true,
    qualityTiers: {
      Standard: 0,
      High: 200,
      Premium: 500,
      Ultra: 2000,
    },
  });
  const [currentQuality, setCurrentQuality] = useState<'Standard' | 'High' | 'Premium' | 'Ultra'>('Standard');
  const [pendingTransactions, setPendingTransactions] = useState(0);
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);

  // Mock revenue data for host
  const [revenueData, setRevenueData] = useState<RoomRevenueBreakdown>({
    roomId: roomId || '',
    host: participantId,
    totalTips: 1250,
    totalAccessFees: 3400,
    pendingTips: 150,
    pendingAccessFees: 200,
    totalRevenue: 4650,
    pendingRevenue: 350,
    activeTippers: 8,
    qualityTierRevenue: {
      Standard: 0,
      High: 1200,
      Premium: 1800,
      Ultra: 400,
    },
  });

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

  // WebRTC hooks
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

  // Add notification
  const addNotification = (notification: Omit<PaymentNotification, 'id' | 'timestamp'>) => {
    const newNotification: PaymentNotification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Handle quality upgrade
  const handleQualityUpgrade = async (quality: string, price: number) => {
    setIsPaymentsLoading(true);
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCurrentQuality(quality as any);
      setUserBalance(prev => prev - price);
      setPendingTransactions(prev => prev + 1);

      // Add notification
      addNotification({
        type: 'quality_upgrade',
        userId: participantId,
        userName: participantName,
        amount: price,
        quality,
      });

      // Simulate tip notifications from other users
      if (Math.random() > 0.5) {
        setTimeout(() => {
          addNotification({
            type: 'tip',
            userId: 'user123',
            userName: 'Generous Viewer',
            amount: Math.floor(Math.random() * 500) + 50,
            message: 'Great content!',
          });
        }, 3000);
      }

      toast({
        title: "Quality Upgraded!",
        description: `You are now streaming in ${quality} quality`,
      });
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Failed to process quality upgrade",
        variant: "destructive",
      });
    } finally {
      setIsPaymentsLoading(false);
    }
  };

  // Handle sending tip
  const handleSendTip = async (amount: number, message: string, superChat: boolean) => {
    setIsPaymentsLoading(true);
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));

      const finalAmount = superChat ? amount * 2 : amount;
      setUserBalance(prev => prev - finalAmount);
      setPendingTransactions(prev => prev + 1);

      // Add notification to room
      addNotification({
        type: superChat ? 'super_chat' : 'tip',
        userId: participantId,
        userName: participantName,
        amount: finalAmount,
        message,
      });

      // Update host revenue (mock)
      if (!isHost) {
        setRevenueData(prev => ({
          ...prev,
          totalTips: prev.totalTips + finalAmount,
          totalRevenue: prev.totalRevenue + finalAmount,
          activeTippers: prev.activeTippers + 1,
        }));
      }

      toast({
        title: superChat ? "Super Chat Sent!" : "Tip Sent!",
        description: `Thank you for your support!`,
      });
    } catch (error) {
      toast({
        title: "Tip Failed",
        description: "Failed to send tip",
        variant: "destructive",
      });
    } finally {
      setIsPaymentsLoading(false);
    }
  };

  // Handle settlement
  const handleSettleTransactions = async () => {
    setIsPaymentsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const settledAmount = pendingTransactions * 100; // Mock settlement amount
      setPendingTransactions(0);

      // Add settlement notification
      addNotification({
        type: 'batch_settlement',
        userId: 'system',
        userName: 'System',
        amount: settledAmount,
        metadata: { transactionCount: pendingTransactions },
      });

      // Update revenue data
      setRevenueData(prev => ({
        ...prev,
        pendingTips: 0,
        pendingAccessFees: 0,
        pendingRevenue: 0,
        totalRevenue: prev.totalRevenue + settledAmount,
      }));

      toast({
        title: "Transactions Settled!",
        description: `${pendingTransactions} transactions settled to room microchain`,
      });
    } catch (error) {
      toast({
        title: "Settlement Failed",
        description: "Failed to settle transactions",
        variant: "destructive",
      });
    } finally {
      setIsPaymentsLoading(false);
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async (amount: number) => {
    setIsPaymentsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Withdrawal Successful!",
        description: `${amount} units transferred to your wallet`,
      });
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsPaymentsLoading(false);
    }
  };

  // Handle add funds
  const handleAddFunds = () => {
    const amount = prompt("Enter amount to add (units):");
    if (amount && !isNaN(parseInt(amount))) {
      setUserBalance(prev => prev + parseInt(amount));
      toast({
        title: "Funds Added!",
        description: `${amount} units added to your wallet`,
      });
    }
  };

  // Dismiss notification
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Handle joining the room
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
                🔗 Blockchain-Powered Room
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

              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  This room supports tipping and quality upgrades. You'll receive 5000 free units to start!
                </AlertDescription>
              </Alert>

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
      {/* Payment Notifications */}
      <PaymentNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
        onClearAll={clearAllNotifications}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        position="top-right"
        maxVisible={3}
      />

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
              <Badge variant="secondary" className="text-xs">
                💰 Payments Enabled
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Room ID: {roomId} • You: {localParticipantName || participantName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={showPayments ? "default" : "outline"}
              onClick={() => setShowPayments(!showPayments)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {showPayments ? 'Hide' : 'Show'} Payments
            </Button>
            <div className="text-right">
              <p className="text-sm font-medium">
                {participants.length + peerParticipants.length} Participants
              </p>
              <p className="text-xs text-muted-foreground">
                Balance: {userBalance.toLocaleString()} units
              </p>
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

        {/* Main Sidebar */}
        <div className={`w-80 border-l border-border bg-card flex flex-col ${showPayments ? '' : 'hidden'}`}>
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tip">Tip</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              {isHost && <TabsTrigger value="revenue">Revenue</TabsTrigger>}
            </TabsList>

            <TabsContent value="chat" className="flex-1 m-0">
              <ChatPanel messages={messages} onSendMessage={sendMessage} />
            </TabsContent>

            <TabsContent value="tip" className="flex-1 m-0 overflow-y-auto p-4">
              <TippingPanel
                minTipAmount={paymentSettings.minTip}
                userBalance={userBalance}
                roomStats={{
                  totalTips: revenueData.totalTips,
                  activeTippers: revenueData.activeTippers,
                  recentTips: [
                    { amount: 150, message: "Great content!", timestamp: new Date(Date.now() - 60000) },
                    { amount: 200, message: "Love the quality", timestamp: new Date(Date.now() - 120000) },
                  ],
                }}
                onSendTip={handleSendTip}
                isLoading={isPaymentsLoading}
              />
            </TabsContent>

            <TabsContent value="quality" className="flex-1 m-0 overflow-y-auto p-4">
              <QualitySelector
                currentQuality={currentQuality}
                userBalance={userBalance}
                onQualityUpgrade={handleQualityUpgrade}
                isLoading={isPaymentsLoading}
              />
            </TabsContent>

            {isHost && (
              <TabsContent value="revenue" className="flex-1 m-0 overflow-y-auto p-4">
                <RevenueDashboard
                  revenueData={revenueData}
                  isLive={true}
                  onWithdraw={handleWithdrawal}
                  onRefresh={async () => {
                    // Mock refresh
                    toast({ title: "Revenue data refreshed" });
                  }}
                  isLoading={isPaymentsLoading}
                />
              </TabsContent>
            )}
          </Tabs>

          {/* Wallet Balance */}
          <div className="p-4 border-t">
            <WalletBalance
              balance={userBalance}
              pendingTransactions={pendingTransactions}
              onAddFunds={handleAddFunds}
              onSettleTransactions={handleSettleTransactions}
              isLoading={isPaymentsLoading}
            />
          </div>
        </div>

        {/* Regular Chat Panel (when payments are hidden) */}
        {!showPayments && (
          <div className="w-80 border-l border-border bg-card flex flex-col">
            {isChatOpen && (
              <div className="flex-1 border-b border-border">
                <ChatPanel messages={messages} onSendMessage={sendMessage} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRoom;