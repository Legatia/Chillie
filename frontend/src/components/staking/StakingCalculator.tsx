import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import {
  TrendingUp,
  Users,
  Zap,
  Crown,
  Rocket,
  DollarSign,
  Info,
  ChevronRight,
  Check,
  Lock
} from 'lucide-react';

export interface StakingTier {
  level: number;
  name: string;
  minStake: number;
  revenueShare: number;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

export interface StakingCalculatorProps {
  currentStake?: number;
  onStakeChange?: (amount: number) => void;
  onStake?: (amount: number) => void;
}

const stakingTiers: StakingTier[] = [
  {
    level: 0,
    name: 'Basic User',
    minStake: 0,
    revenueShare: 0,
    badge: 'Free',
    badgeColor: 'bg-gray-100 text-gray-700',
    icon: <Users className="h-5 w-5" />,
    features: [
      'Join private rooms',
      'Basic participation',
      'View public content'
    ],
    color: 'from-gray-500 to-gray-600'
  },
  {
    level: 1,
    name: 'Content Creator',
    minStake: 1000,
    revenueShare: 70,
    badge: 'Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: <TrendingUp className="h-5 w-5" />,
    features: [
      'Create public podcast rooms',
      'Enable tipping & super chat',
      'Basic analytics dashboard',
      'Community features',
      'Custom room branding'
    ],
    color: 'from-blue-500 to-blue-600'
  },
  {
    level: 2,
    name: 'Streamer',
    minStake: 5000,
    revenueShare: 85,
    badge: 'Recommended',
    badgeColor: 'bg-purple-100 text-purple-700',
    icon: <Zap className="h-5 w-5" />,
    features: [
      'Create video streaming rooms',
      'Advanced payment features',
      'Priority bandwidth',
      'Advanced analytics',
      'Multi-room moderation'
    ],
    color: 'from-purple-500 to-purple-600'
  },
  {
    level: 3,
    name: 'Premium Creator',
    minStake: 10000,
    revenueShare: 97,
    badge: 'Premium',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    icon: <Crown className="h-5 w-5" />,
    features: [
      'Multi-room hosting',
      'API access',
      'Exclusive features',
      'Dedicated support',
      'White-label options'
    ],
    color: 'from-yellow-500 to-yellow-600'
  }
];

export function StakingCalculator({
  currentStake = 0,
  onStakeChange,
  onStake
}: StakingCalculatorProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [monthlyTips, setMonthlyTips] = useState(1000);

  const getCurrentTier = (stake: number): StakingTier => {
    for (let i = stakingTiers.length - 1; i >= 0; i--) {
      if (stake >= stakingTiers[i].minStake) {
        return stakingTiers[i];
      }
    }
    return stakingTiers[0];
  };

  const currentTier = getCurrentTier(currentStake);
  const nextTier = stakingTiers.find(tier => tier.level > currentTier.level);
  const progressToNext = nextTier
    ? ((currentStake - currentTier.minStake) / (nextTier.minStake - currentTier.minStake)) * 100
    : 100;

  const calculateEarnings = (tips: number, tier: StakingTier) => {
    return {
      creator: (tips * tier.revenueShare) / 100,
      platform: tips - ((tips * tier.revenueShare) / 100),
      creatorMonthly: ((tips * tier.revenueShare) / 100) * 12,
      platformMonthly: (tips - ((tips * tier.revenueShare) / 100)) * 12
    };
  };

  const earnings = calculateEarnings(monthlyTips, currentTier);

  const handleStake = () => {
    const amount = parseInt(customAmount) || 0;
    if (amount > 0 && onStake) {
      onStake(amount);
      setCustomAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${currentTier.color} opacity-10`}></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${currentTier.color} text-white`}>
                {currentTier.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{currentTier.name}</CardTitle>
                <CardDescription>
                  {currentStake.toLocaleString()} tokens staked
                </CardDescription>
              </div>
            </div>
            <Badge className={currentTier.badgeColor}>
              {currentTier.badge}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-4">
            {/* Revenue Share */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {currentTier.revenueShare}%
              </div>
              <p className="text-sm text-muted-foreground">
                of all tips and microtransactions
              </p>
            </div>

            {/* Progress to Next Tier */}
            {nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to {nextTier.name}</span>
                  <span>{Math.round(progressToNext)}%</span>
                </div>
                <Progress value={progressToNext} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Stake {(nextTier.minStake - currentStake).toLocaleString()} more tokens to unlock
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Earnings Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Calculator
          </CardTitle>
          <CardDescription>
            See how much you'll earn at different revenue levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Monthly Tips:</label>
              <input
                type="number"
                value={monthlyTips}
                onChange={(e) => setMonthlyTips(parseInt(e.target.value) || 0)}
                className="flex-1 h-8 px-2 text-sm"
                min="0"
                step="100"
              />
              <span className="text-sm text-muted-foreground">units</span>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-muted-foreground mb-1">Your Monthly</div>
                <div className="text-xl font-bold text-green-700">
                  ${earnings.creatorMonthly.toLocaleString()}
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-muted-foreground mb-1">Platform Monthly</div>
                <div className="text-xl font-bold text-blue-700">
                  ${earnings.platformMonthly.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Revenue Split</div>
              <div className="flex justify-center items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {currentTier.revenueShare}%
                  </div>
                  <div className="text-xs text-muted-foreground">You</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {100 - currentTier.revenueShare}%
                  </div>
                  <div className="text-xs text-muted-foreground">Platform</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staking Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Increase Your Stake
          </CardTitle>
          <CardDescription>
            Stake more tokens to unlock higher revenue sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 h-10 px-3"
                min="0"
              />
              <Button onClick={handleStake} disabled={!customAmount || parseInt(customAmount) <= 0}>
                Stake Tokens
              </Button>
            </div>

            {/* Quick Stake Options */}
            <div className="grid grid-cols-3 gap-2">
              {[1000, 2500, 5000, 10000, 25000, 50000].map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCustomAmount(amount.toString());
                    if (onStake) onStake(amount);
                  }}
                  className="text-xs"
                >
                  {amount >= 1000 ? `${amount / 1000}k` : amount}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Tiers Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            All Staking Tiers
          </CardTitle>
          <CardDescription>
            Compare benefits across all stake levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stakingTiers.map((tier) => (
              <div
                key={tier.level}
                className={`p-4 rounded-lg border ${
                  currentTier.level >= tier.level
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${tier.color} text-white`}>
                      {tier.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{tier.name}</h3>
                        {currentTier.level >= tier.level && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                        {currentTier.level < tier.level && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tier.minStake.toLocaleString()} tokens minimum
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={tier.badgeColor}>
                      {tier.revenueShare}% revenue
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-1">
                  {tier.features.map((feature, index) => (
                    <div
                      key={index}
                      className={`text-xs ${
                        currentTier.level >= tier.level
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      • {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}