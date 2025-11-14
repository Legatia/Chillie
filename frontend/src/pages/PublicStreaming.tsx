import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Video, Mic, Users, TrendingUp, Crown, Zap, Star, Lock, Rocket, Globe, Eye } from "lucide-react";
import { useWalletConnection, useCreateRoom, usePublicRooms } from "@/hooks/useBlockchain";
import { WalletConnector } from "@/components/blockchain/WalletConnector";
import { useToast } from "@/hooks/use-toast";
import { RoomCreator, type RoomData } from "@/components/rooms/RoomCreator";

const PublicStreaming = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, address } = useWalletConnection();
  const { createRoom: createBlockchainRoom } = usePublicRooms();

  // Mock user staking data - in real app, this would come from blockchain
  const [userStake] = useState(2500); // User has 2500 tokens staked (Streamer level)

  // Mock public streaming rooms
  const [publicRooms] = useState([
    {
      id: "public-1",
      name: "Tech Talk: Web3 Development",
      host: "0x1234...5678",
      hostName: "CryptoDev",
      category: "podcast",
      participantCount: 145,
      quality: "720p",
      tipsEnabled: true,
      totalTips: 2500,
      revenueShare: 85,
      isLive: true,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      thumbnail: "/api/placeholder/320/180",
      description: "Weekly discussion about the latest in Web3 development"
    },
    {
      id: "public-2",
      name: "Morning Yoga Session",
      host: "0xabcd...ef12",
      hostName: "WellnessGuru",
      category: "video",
      participantCount: 89,
      quality: "1080p",
      tipsEnabled: true,
      totalTips: 1200,
      revenueShare: 70,
      isLive: true,
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      thumbnail: "/api/placeholder/320/180",
      description: "Start your day with guided meditation and yoga"
    },
    {
      id: "public-3",
      name: "Gaming Stream - Retro Games",
      host: "0x9876...5432",
      hostName: "RetroGamer",
      category: "video",
      participantCount: 234,
      quality: "4K",
      tipsEnabled: true,
      totalTips: 3800,
      revenueShare: 97,
      isLive: true,
      startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      thumbnail: "/api/placeholder/320/180",
      description: "Playing classic retro games and sharing gaming tips"
    },
    {
      id: "public-4",
      name: "Music Production Workshop",
      host: "0xdef0...1234",
      hostName: "BeatMaker",
      category: "podcast",
      participantCount: 67,
      quality: "720p",
      tipsEnabled: false,
      totalTips: 0,
      revenueShare: 70,
      isLive: false,
      scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000),
      thumbnail: "/api/placeholder/320/180",
      description: "Learn music production techniques from professionals"
    }
  ]);

  const handleCreateStream = async (roomData: RoomData) => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a public stream.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has sufficient stake for public streaming
    if (userStake < 1000) {
      toast({
        title: "Staking Required",
        description: "You need to stake at least 1,000 tokens to create public streams. Visit the Staking Portal to unlock this feature.",
        variant: "destructive",
      });
      return;
    }

    try {
      const blockchainRoomData = await createBlockchainRoom({
        room_name: roomData.name,
        is_public: true,
      });

      // Navigate to the created stream
      navigate(`/room/${blockchainRoomData.room_id}`, {
        state: {
          chainId: blockchainRoomData.chain_id,
          appId: blockchainRoomData.app_id,
          isHost: true,
          roomName: roomData.name,
          roomSettings: roomData,
          isPublic: true,
        },
      });

      toast({
        title: "Public Stream Created!",
        description: `Your stream "${roomData.name}" is now live and available to everyone.`,
      });
    } catch (error) {
      console.error('Failed to create public stream:', error);
      toast({
        title: "Failed to Create Stream",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleJoinStream = (room: any) => {
    // Navigate to join stream - anyone can join public streams
    navigate(`/room/${room.id}`, {
      state: {
        isHost: false,
        roomName: room.name,
        isPublic: true,
        streamInfo: room,
      },
    });
  };

  const getUserTier = (stake: number) => {
    if (stake >= 10000) return { name: "Premium Creator", icon: <Crown className="h-4 w-4" />, color: "text-yellow-600" };
    if (stake >= 5000) return { name: "Streamer", icon: <Zap className="h-4 w-4" />, color: "text-purple-600" };
    if (stake >= 1000) return { name: "Content Creator", icon: <TrendingUp className="h-4 w-4" />, color: "text-blue-600" };
    return { name: "Basic User", icon: <Users className="h-4 w-4" />, color: "text-gray-600" };
  };

  const userTier = getUserTier(userStake);

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - startTime.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffInHours > 0) {
      return `${diffInHours}h ${diffInMinutes}m`;
    } else {
      return `${diffInMinutes}m`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Public Streaming
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Broadcast to the world and earn from your content
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Your Tier:</span>
                <div className={`flex items-center gap-1 ${userTier.color}`}>
                  {userTier.icon}
                  <span className="font-medium">{userTier.name}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {userStake.toLocaleString()} tokens staked
              </div>
            </div>
            <WalletConnector />
          </div>
        </div>

        {/* Staking Status Banner */}
        {userStake < 1000 && (
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <Lock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Staking Required:</strong> You need to stake at least 1,000 tokens to create public streams.
              <Button
                variant="link"
                className="p-0 h-auto text-orange-800 underline"
                onClick={() => navigate('/staking')}
              >
                Visit Staking Portal →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create New Stream */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Go Live
                </CardTitle>
                <CardDescription>
                  Start your public stream
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoomCreator
                  userStake={userStake}
                  onCreateRoom={handleCreateStream}
                />
              </CardContent>
            </Card>
          </div>

          {/* Live Streams */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Live Streams</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {publicRooms.filter(room => room.isLive).length} live
              </Badge>
            </div>

            {publicRooms.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Live Streams</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to start broadcasting!
                  </p>
                  <Button onClick={() => document.getElementById('create-stream')?.scrollIntoView()}>
                    Start Streaming
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {publicRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Thumbnail/Preview */}
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          {room.category === 'podcast' ? (
                            <Mic className="h-16 w-16 text-primary/40" />
                          ) : (
                            <Video className="h-16 w-16 text-primary/40" />
                          )}
                        </div>

                        {room.isLive && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-red-600 text-white flex items-center gap-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              LIVE
                            </Badge>
                          </div>
                        )}

                        <div className="absolute top-2 right-2 flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {room.participantCount}
                          </Badge>
                          <Badge variant="outline">
                            {room.quality}
                          </Badge>
                        </div>

                        {room.tipsEnabled && room.totalTips > 0 && (
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-green-600 text-white flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {room.totalTips.toLocaleString()} tips
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Stream Info */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                              {room.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {room.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${userTier.color}`}>
                              {getUserTier(room.revenueShare === 97 ? 10000 : room.revenueShare === 85 ? 5000 : 1000).icon}
                            </div>
                            <span>{room.hostName}</span>
                          </div>
                          <span>•</span>
                          <span>{room.category === 'podcast' ? 'Podcast' : 'Video'}</span>
                          {room.isLive ? (
                            <>
                              <span>•</span>
                              <span>{formatDuration(room.startedAt)}</span>
                            </>
                          ) : (
                            <>
                              <span>•</span>
                              <span>Scheduled</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="text-xs">
                            {room.revenueShare}% creator share
                          </Badge>
                          {room.tipsEnabled && (
                            <Badge variant="outline" className="text-xs">
                              Tips enabled
                            </Badge>
                          )}
                        </div>

                        <Button
                          onClick={() => handleJoinStream(room)}
                          className="w-full"
                          disabled={!room.isLive}
                        >
                          {room.isLive ? 'Watch Stream' : 'Scheduled'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Platform Stats */}
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {publicRooms.filter(room => room.isLive).length}
                </div>
                <p className="text-sm text-muted-foreground">Live Now</p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary mb-1">
                  {publicRooms.reduce((sum, room) => sum + room.participantCount, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Viewers</p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {publicRooms.reduce((sum, room) => sum + room.totalTips, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Tips</p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round(publicRooms.reduce((sum, room) => sum + room.revenueShare, 0) / publicRooms.length)}%
                </div>
                <p className="text-sm text-muted-foreground">Avg. Creator Share</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicStreaming;