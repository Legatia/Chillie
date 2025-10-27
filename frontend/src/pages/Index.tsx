import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wallet, Users, Video, MessageSquare, Monitor, Shield, CheckCircle } from "lucide-react";
import { useWalletConnection, useCreateRoom, usePublicRooms } from "@/hooks/useBlockchain";
import { WalletConnector } from "@/components/blockchain/WalletConnector";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [roomName, setRoomName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Blockchain hooks
  const { isConnected, address, connect, disconnect } = useWalletConnection();
  const { createRoom: createBlockchainRoom } = useCreateRoom();
  const { rooms: publicRooms, isLoading: isLoadingRooms } = usePublicRooms();

  const createRoom = async () => {
    console.log('[UI] Create room button clicked', {
      isConnected,
      roomName: roomName.trim(),
      isCreating,
      address,
    });

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a room on the blockchain.",
        variant: "destructive",
      });
      return;
    }

    if (!roomName.trim()) {
      toast({
        title: "Room Name Required",
        description: "Please enter a room name in the input field above.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const roomData = await createBlockchainRoom({
        room_name: roomName.trim(),
        is_public: isPublic,
      });

      // Navigate to the created room with blockchain data
      navigate(`/room/${roomData.room_id}`, {
        state: {
          chainId: roomData.chain_id,
          appId: roomData.app_id,
          isHost: true,
          roomName: roomName.trim(),
        },
      });

      toast({
        title: "Room Created!",
        description: `Your room "${roomName}" has been created on the blockchain.`,
      });
    } catch (error) {
      console.error('Failed to create room:', error);
      toast({
        title: "Failed to Create Room",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      createRoom();
    }
  };

  const joinRoom = (room: any) => {
    // Navigate to join room - participants don't need wallet
    navigate(`/room/${room.room_id}`, {
      state: {
        chainId: room.chain_id,
        appId: room.room_id, // Using room_id as app_id for now
        isHost: false,
        roomName: room.name,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Chillie
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Decentralized video meetings on the Linera blockchain
          </p>

          {/* Wallet Connection Status */}
          <div className="flex justify-center mb-6">
            <WalletConnector />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Create Room Section */}
          <Card className="p-8 border-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Create Room</h2>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Room Name
                </Label>
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="my-awesome-room"
                  className="text-lg"
                  disabled={!isConnected}
                  title={!isConnected ? "Please connect your wallet first" : "Enter room name"}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={!isConnected}
                />
                <Label htmlFor="public">Make room public</Label>
              </div>
              <Button
                onClick={createRoom}
                disabled={!isConnected || isCreating || !roomName.trim()}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating on Blockchain...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Create Room on Blockchain
                  </>
                )}
              </Button>
              {!isConnected && (
                <p className="text-sm text-muted-foreground text-center">
                  Connect your wallet to create rooms
                </p>
              )}
            </div>
          </Card>

          {/* Public Rooms Section */}
          <Card className="p-8 border-2">
            <h2 className="text-2xl font-bold mb-4">Public Rooms</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {isLoadingRooms ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : publicRooms.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No public rooms available
                </p>
              ) : (
                publicRooms.map((room) => (
                  <div
                    key={room.room_id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {room.participant_count} participants
                      </p>
                    </div>
                    <Button
                      onClick={() => joinRoom(room)}
                      size="sm"
                      variant="outline"
                    >
                      Join
                    </Button>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Join rooms instantly - no wallet required!
            </p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 text-center hover:border-primary transition-colors">
            <Shield className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Blockchain-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Rooms on Linera blockchain
            </p>
          </Card>
          <Card className="p-6 text-center hover:border-primary transition-colors">
            <Wallet className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Wallet-less Joining</h3>
            <p className="text-sm text-muted-foreground">
              Join rooms without a wallet
            </p>
          </Card>
          <Card className="p-6 text-center hover:border-primary transition-colors">
            <Video className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">P2P Video</h3>
            <p className="text-sm text-muted-foreground">
              Direct video connections
            </p>
          </Card>
          <Card className="p-6 text-center hover:border-primary transition-colors">
            <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Microchain Architecture</h3>
            <p className="text-sm text-muted-foreground">
              One chain per room
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
