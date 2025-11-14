import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Check, Crown, Star, Zap, Wallet } from 'lucide-react';

export type StreamQuality = 'Standard' | 'High' | 'Premium' | 'Ultra';

export interface QualityTier {
  quality: StreamQuality;
  price: number;
  resolution: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  recommended?: boolean;
}

interface QualitySelectorProps {
  currentQuality: StreamQuality;
  availableTiers: QualityTier[];
  userBalance: number;
  onQualityUpgrade: (quality: StreamQuality, price: number) => void;
  isLoading?: boolean;
}

const defaultTiers: QualityTier[] = [
  {
    quality: 'Standard',
    price: 0,
    resolution: '480p',
    features: ['Mobile optimized', 'Lower data usage', 'Basic quality'],
    icon: <div className="w-4 h-4 bg-gray-400 rounded-full" />,
  },
  {
    quality: 'High',
    price: 200,
    resolution: '720p-1080p',
    features: ['HD quality', 'Better audio', 'Standard experience'],
    icon: <div className="w-4 h-4 bg-blue-400 rounded-full" />,
    popular: true,
  },
  {
    quality: 'Premium',
    price: 500,
    resolution: '1080p+',
    features: ['Full HD', 'Enhanced audio', 'Better bitrate'],
    icon: <Crown className="h-4 w-4 text-purple-500" />,
  },
  {
    quality: 'Ultra',
    price: 2000,
    resolution: '4K',
    features: ['4K quality', 'Best audio', 'Maximum bitrate', 'Priority support'],
    icon: <Star className="h-4 w-4 text-yellow-500" />,
    recommended: true,
  },
];

export function QualitySelector({
  currentQuality,
  availableTiers = defaultTiers,
  userBalance,
  onQualityUpgrade,
  isLoading = false
}: QualitySelectorProps) {
  const [selectedQuality, setSelectedQuality] = useState<StreamQuality>(currentQuality);

  const handleUpgrade = () => {
    const tier = availableTiers.find(t => t.quality === selectedQuality);
    if (tier && tier.price > 0) {
      onQualityUpgrade(selectedQuality, tier.price);
    }
  };

  const currentTier = availableTiers.find(t => t.quality === currentQuality);
  const selectedTier = availableTiers.find(t => t.quality === selectedQuality);
  const upgradeCost = selectedTier ? selectedTier.price - (currentTier?.price || 0) : 0;
  const canAfford = userBalance >= upgradeCost;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Stream Quality
        </CardTitle>
        <CardDescription>
          Choose your preferred video quality for the best experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">Your Balance</span>
          </div>
          <span className="text-lg font-bold">{userBalance.toLocaleString()} units</span>
        </div>

        <RadioGroup
          value={selectedQuality}
          onValueChange={(value) => setSelectedQuality(value as StreamQuality)}
          className="space-y-3"
        >
          {availableTiers.map((tier) => {
            const isCurrent = tier.quality === currentQuality;
            const canSelect = userBalance >= tier.price;

            return (
              <div key={tier.quality} className="relative">
                {tier.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-500 text-xs">
                    Popular
                  </Badge>
                )}
                {tier.recommended && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-xs">
                    Recommended
                  </Badge>
                )}

                <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedQuality === tier.quality
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem
                        value={tier.quality}
                        id={tier.quality}
                        disabled={!canSelect}
                      />
                      <div className="flex items-center gap-2">
                        {tier.icon}
                        <Label htmlFor={tier.quality} className="font-medium cursor-pointer">
                          {tier.quality}
                        </Label>
                        {isCurrent && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {tier.price === 0 ? 'Free' : `${tier.price} units`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tier.resolution}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-1">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {tier.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {!canSelect && tier.price > 0 && (
                    <div className="mt-2 text-xs text-destructive">
                      Insufficient balance (need {tier.price - userBalance} more units)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {selectedQuality !== currentQuality && upgradeCost > 0 && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Upgrade Cost:</span>
              <span className="text-lg font-bold">{upgradeCost} units</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Your Balance:</span>
                <span>{userBalance.toLocaleString()} units</span>
              </div>
              <Progress
                value={canAfford ? 100 : (userBalance / upgradeCost) * 100}
                className="h-2"
              />
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={!canAfford || isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : `Upgrade to ${selectedQuality}`}
            </Button>

            {!canAfford && (
              <p className="text-xs text-muted-foreground text-center">
                Add more units to your wallet to upgrade
              </p>
            )}
          </div>
        )}

        {currentQuality && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Currently Streaming in {currentQuality}
              </span>
            </div>
            <p className="text-xs text-green-700">
              {currentTier?.resolution} quality with all selected features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}