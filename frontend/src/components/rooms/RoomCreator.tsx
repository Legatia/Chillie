import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Users,
  Video,
  Mic,
  Lock,
  Unlock,
  Info,
  Zap,
  Crown,
  Rocket,
  AlertTriangle
} from 'lucide-react';

export interface RoomCreatorProps {
  userStake?: number;
  onCreateRoom?: (roomData: RoomData) => void;
}

export interface RoomData {
  name: string;
  description: string;
  type: 'private' | 'public';
  category: 'podcast' | 'video';
  maxParticipants: number;
  quality: 'auto' | '480p' | '720p' | '1080p' | '4K';
  requireApproval: boolean;
  paymentSettings?: {
    tipsEnabled: boolean;
    minTip: number;
    accessFee: number;
  };
}

const roomTypes = [
  { value: 'private', label: 'Private Meeting', icon: <Users className="h-4 w-4" />, description: 'Invite-only, perfect for team meetings' },
  { value: 'public', label: 'Public Stream', icon: <Rocket className="h-4 w-4" />, description: 'Open to everyone, great for content creators' }
];

const roomCategories = [
  { value: 'podcast', label: 'Podcast (Voice + Screen)', icon: <Mic className="h-4 w-4" />, description: 'Audio-focused, lower bandwidth' },
  { value: 'video', label: 'Video Stream (Camera + Screen)', icon: <Video className="h-4 w-4" />, description: 'Full video experience' }
];

const qualityOptions = [
  { value: 'auto', label: 'Auto', description: 'Optimized automatically' },
  { value: '480p', label: 'SD (480p)', description: 'Standard definition' },
  { value: '720p', label: 'HD (720p)', description: 'High definition' },
  { value: '1080p', label: 'FHD (1080p)', description: 'Full HD' },
  { value: '4K', label: '4K Ultra', description: 'Ultra high definition' }
];

export function RoomCreator({ userStake = 0, onCreateRoom }: RoomCreatorProps) {
  const [roomData, setRoomData] = useState<RoomData>({
    name: '',
    description: '',
    type: 'private',
    category: 'podcast',
    maxParticipants: 10,
    quality: 'auto',
    requireApproval: false,
    paymentSettings: {
      tipsEnabled: false,
      minTip: 50,
      accessFee: 0
    }
  });

  const [isCreating, setIsCreating] = useState(false);

  // Check staking requirements
  const getStakingStatus = () => {
    if (roomData.type === 'private') return { canCreate: true, required: 0, message: '' };

    if (userStake >= 1000) {
      return { canCreate: true, required: 1000, message: '' };
    }

    return {
      canCreate: false,
      required: 1000,
      message: 'You need to stake at least 1,000 tokens to create public rooms. Stake tokens to unlock content creator features and higher revenue sharing.'
    };
  };

  const stakingStatus = getStakingStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stakingStatus.canCreate) {
      return;
    }

    setIsCreating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onCreateRoom) {
        onCreateRoom(roomData);
      }

      // Reset form
      setRoomData({
        name: '',
        description: '',
        type: 'private',
        category: 'podcast',
        maxParticipants: 10,
        quality: 'auto',
        requireApproval: false,
        paymentSettings: {
          tipsEnabled: false,
          minTip: 50,
          accessFee: 0
        }
      });
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const updateRoomData = <K extends keyof RoomData>(key: K, value: RoomData[K]) => {
    setRoomData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Create New Room
        </CardTitle>
        <CardDescription>
          Set up your room preferences and invite participants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Staking Status Alert */}
          {!stakingStatus.canCreate && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Staking Required:</strong> {stakingStatus.message}</p>
                  <p>Stake {stakingStatus.required.toLocaleString()} tokens to unlock public room creation.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      // Navigate to staking page
                      window.location.hash = '#staking';
                    }}
                  >
                    Stake Tokens
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Room Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Room Type</Label>
            <div className="grid gap-3">
              {roomTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    roomData.type === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => updateRoomData('type', type.value as 'private' | 'public')}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      roomData.type === type.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{type.label}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Category */}
          {roomData.type === 'public' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Stream Category</Label>
              <div className="grid gap-3">
                {roomCategories.map((category) => (
                  <div
                    key={category.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      roomData.category === category.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updateRoomData('category', category.value as 'podcast' | 'video')}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        roomData.category === category.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{category.label}</h3>
                        <p className="text-sm text-muted-">{category.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bandwidth Notice */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {roomData.category === 'podcast'
                    ? 'Podcast rooms use less bandwidth and are perfect for audio shows, interviews, and voice-only content.'
                    : 'Video streaming rooms require more bandwidth but provide a richer visual experience.'
                  }
                </AlertDescription>
              </Alert>
            </div>
          )}

          <Separator />

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                value={roomData.name}
                onChange={(e) => updateRoomData('name', e.target.value)}
                placeholder="Enter room name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                value={roomData.description}
                onChange={(e) => updateRoomData('description', e.target.value)}
                placeholder="Describe your room content"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-participants">Max Participants</Label>
              <Input
                id="max-participants"
                type="number"
                value={roomData.maxParticipants}
                onChange={(e) => updateRoomData('maxParticipants', parseInt(e.target.value) || 10)}
                min="2"
                max="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Video Quality</Label>
              <Select
                value={roomData.quality}
                onValueChange={(value) => updateRoomData('quality', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  {qualityOptions.map((quality) => (
                    <SelectItem key={quality.value} value={quality.value}>
                      <div className="flex items-center gap-2">
                        <span>{quality.label}</span>
                        <span className="text-xs text-muted-foreground">({quality.description})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Approval Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-approval">Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                Manually approve join requests
              </p>
            </div>
            <Switch
              id="require-approval"
              checked={roomData.requireApproval}
              onCheckedChange={(checked) => updateRoomData('requireApproval', checked)}
            />
          </div>

          {/* Payment Settings for Public Rooms */}
          {roomData.type === 'public' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="tips-enabled">Enable Tips</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow viewers to send tips
                    </p>
                  </div>
                  <Switch
                    id="tips-enabled"
                    checked={roomData.paymentSettings?.tipsEnabled}
                    onCheckedChange={(checked) =>
                      updateRoomData('paymentSettings', {
                        ...roomData.paymentSettings!,
                        tipsEnabled: checked
                      })
                    }
                  />
                </div>

                {roomData.paymentSettings?.tipsEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-tip">Minimum Tip</Label>
                      <Input
                        id="min-tip"
                        type="number"
                        value={roomData.paymentSettings?.minTip}
                        onChange={(e) =>
                          updateRoomData('paymentSettings', {
                            ...roomData.paymentSettings!,
                            minTip: parseInt(e.target.value) || 50
                          })
                        }
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="access-fee">Access Fee</Label>
                      <Input
                        id="access-fee"
                        type="number"
                        value={roomData.paymentSettings?.accessFee}
                        onChange={(e) =>
                          updateRoomData('paymentSettings', {
                            ...roomData.paymentSettings!,
                            accessFee: parseInt(e.target.value) || 0
                          })
                        }
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={!stakingStatus.canCreate || isCreating || !roomData.name.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}