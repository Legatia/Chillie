import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Users, Shield, Lock, Video, Clock, Calendar, Plus } from "lucide-react";
import { useWalletConnection, useCreateRoom } from "@/hooks/useBlockchain";
import { WalletConnector } from "@/components/blockchain/WalletConnector";
import { useToast } from "@/hooks/use-toast";
import { RoomCreator, type RoomData } from "@/components/rooms/RoomCreator";

const PrivateMeetings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, address } = useWalletConnection();
  const { createRoom: createBlockchainRoom } = useCreateRoom();

  // Mock private rooms data - in real app, this would come from your backend
  const [privateRooms] = useState([
    {
      id: "private-1",
      name: "Team Standup",
      host: "0x1234...5678",
      participantCount: 4,
      maxParticipants: 8,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      requiresApproval: true,
      isPasswordProtected: true,
    },
    {
      id: "private-2",
      name: "Client Presentation",
      host: "0xabcd...ef12",
      participantCount: 3,
      maxParticipants: 5,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      requiresApproval: false,
      isPasswordProtected: true,
    },
    {
      id: "private-3",
      name: "Design Review",
      host: "0x9876...5432",
      participantCount: 2,
      maxParticipants: 6,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      requiresApproval: true,
      isPasswordProtected: false,
    }
  ]);

  const handleCreateRoom = async (roomData: RoomData) => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a private meeting room.",
        variant: "destructive",
      });
      return;
    }

    try {
      const blockchainRoomData = await createBlockchainRoom({
        room_name: roomData.name,
        is_public: false, // Always private for this page
      });

      // Navigate to the created room
      navigate(`/room/${blockchainRoomData.room_id}`, {
        state: {
          chainId: blockchainRoomData.chain_id,
          appId: blockchainRoomData.app_id,
          isHost: true,
          roomName: roomData.name,
          roomSettings: roomData,
        },
      });

      toast({
        title: "Private Meeting Created!",
        description: `Your private meeting "${roomData.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Failed to create private room:', error);
      toast({
        title: "Failed to Create Meeting",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = (room: any) => {
    // Navigate to join room - participants don't need wallet for private meetings if they have invite
    navigate(`/room/${room.id}`, {
      state: {
        isHost: false,
        roomName: room.name,
        isPrivate: true,
      },
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
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
                Private Meetings
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Secure, invite-only video meetings for your team
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <WalletConnector />
          </div>
        </div>

        {/* Info Banner */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Lock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Private meetings are secure and invite-only.</strong> Only participants with the room link or explicit invitation can join. No staking required.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create New Meeting */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Meeting
                </CardTitle>
                <CardDescription>
                  Set up a new private meeting room
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoomCreator
                  userStake={0} // Private meetings don't require staking
                  onCreateRoom={handleCreateRoom}
                />
              </CardContent>
            </Card>
          </div>

          {/* Existing Private Rooms */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Private Meetings</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {privateRooms.length} rooms
              </Badge>
            </div>

            {privateRooms.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Private Meetings Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first private meeting room to get started
                  </p>
                  <Button onClick={() => document.getElementById('create-room')?.scrollIntoView()}>
                    Create Meeting
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {privateRooms.map((room) => (
                  <Card key={room.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{room.name}</h3>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Private
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{room.participantCount}/{room.maxParticipants}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTimeAgo(room.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              <span>Host: {room.host.slice(0, 6)}...{room.host.slice(-4)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {room.requiresApproval && (
                              <Badge variant="outline" className="text-xs">
                                Approval Required
                              </Badge>
                            )}
                            {room.isPasswordProtected && (
                              <Badge variant="outline" className="text-xs">
                                Password Protected
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleJoinRoom(room)}
                          size="sm"
                          disabled={room.participantCount >= room.maxParticipants}
                        >
                          {room.participantCount >= room.maxParticipants ? 'Full' : 'Join'}
                        </Button>
                      </div>

                      {/* Progress bar for participants */}
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(room.participantCount / room.maxParticipants) * 100}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary mb-1">
                  {privateRooms.reduce((sum, room) => sum + room.participantCount, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {privateRooms.filter(room => room.participantCount > 0).length}
                </div>
                <p className="text-sm text-muted-foreground">Active Rooms</p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {privateRooms.reduce((sum, room) => sum + room.maxParticipants, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateMeetings;