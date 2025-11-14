import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { StakingCalculator } from './StakingCalculator';
import {
  TrendingUp,
  Users,
  Zap,
  Crown,
  Rocket,
  Lock,
  Unlock,
  Shield,
  Award,
  Gift,
  Wallet,
  ChevronRight,
  Star,
  Target,
  BarChart3
} from 'lucide-react';

export interface StakingStats {
  totalStaked: number;
  currentTier: number;
  monthlyEarnings: number;
  lifetimeEarnings: number;
  nextTierStake: number;
  revenueShare: number;
}

export interface StakingDashboardProps {
  stats: StakingStats;
  onStake?: (amount: number) => void;
  onUnstake?: (amount: number) => void;
}

const tierFeatures = {
  0: {
    icon: <Users className="h-4 w-4" />,
    name: "Basic User",
    features: [
      "Join private rooms (invite only)",
      "Basic participation",
      "View public content",
      "Send tips"
    ],
    color: "from-gray-500 to-gray-600",
    canCreatePublic: false,
    maxRevenueShare: 0
  },
  1: {
    icon: <TrendingUp className="h-4 w-4" />,
    name: "Content Creator",
    features: [
      "Create public podcast rooms",
      "Enable tipping & super chat",
      "Basic analytics dashboard",
      "Community features",
      "Custom room branding"
    ],
    color: "from-blue-500 to-blue-600",
    canCreatePublic: true,
    maxRevenueShare: 70
  },
  2: {
    icon: <Zap className="h-4 w-4" />,
    name: "Streamer",
    features: [
      "Create video streaming rooms",
      "Advanced payment features",
      "Priority bandwidth",
      "Advanced analytics",
      "Multi-room moderation"
    ],
    color: "from-purple-500 to-purple-600",
    canCreatePublic: true,
    maxRevenueShare: 85
  },
  3: {
    icon: <Crown className="h-4 w-4" />,
    name: "Premium Creator",
    features: [
      "Multi-room hosting",
      "API access",
      "Exclusive features",
      "Dedicated support",
      "White-label options"
    ],
    color: "from-yellow-500 to-yellow-600",
    canCreatePublic: true,
    maxRevenueShare: 97
  }
};

export function StakingDashboard({ stats, onStake, onUnstake }: StakingDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const currentTier = tierFeatures[stats.currentTier as keyof typeof tierFeatures];
  const nextTier = tierFeatures[stats.currentTier + 1 as keyof typeof tierFeatures];

  const progressToNext = nextTier
    ? ((stats.totalStaked - (stats.currentTier * 1000)) / 1000) * 100
    : 100;

  const handleUnstake = () => {
    const amount = parseInt(unstakeAmount) || 0;
    if (amount > 0 && amount <= stats.totalStaked && onUnstake) {
      onUnstake(amount);
      setUnstakeAmount("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staked</p>
                <p className="text-2xl font-bold">{stats.totalStaked.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">tokens</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Tier</p>
                <p className="text-2xl font-bold">{currentTier.name}</p>
                <p className="text-xs text-muted-foreground">Level {stats.currentTier}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${currentTier.color} text-white`}>
                {currentTier.icon}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Share</p>
                <p className="text-2xl font-bold text-green-600">{stats.revenueShare}%</p>
                <p className="text-xs text-muted-foreground">of earnings</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                <p className="text-2xl font-bold">${stats.monthlyEarnings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">estimated</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Tier Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Current Tier Benefits
              </CardTitle>
              <CardDescription>
                You have access to {currentTier.features.length} features as a {currentTier.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg bg-gradient-to-r ${currentTier.color} bg-opacity-10`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${currentTier.color} text-white`}>
                      {currentTier.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{currentTier.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {stats.revenueShare}% revenue share
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentTier.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Unlock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Public Room Creation Status */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Public Room Creation</h4>
                  {currentTier.canCreatePublic ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Unlock className="h-4 w-4" />
                      <span className="text-sm">Unlocked - You can create public rooms</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm">
                        Requires staking 1,000 tokens
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress to Next Tier */}
          {nextTier && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progress to Next Tier
                </CardTitle>
                <CardDescription>
                  Stake {(nextTier.level * 1000) - stats.totalStaked} more tokens to reach {nextTier.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{currentTier.name}</span>
                    <span className="text-sm font-medium">{nextTier.name}</span>
                  </div>
                  <Progress value={progressToNext} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stats.totalStaked.toLocaleString()} tokens</span>
                    <span>{(nextTier.level * 1000).toLocaleString()} tokens</span>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Revenue Share Increase:</span>
                      <Badge variant="outline">
                        {nextTier.maxRevenueShare - currentTier.maxRevenueShare}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Staking Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Manage Staking
              </CardTitle>
              <CardDescription>
                Stake or unstake tokens to change your tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stake */}
                <div>
                  <label className="text-sm font-medium mb-2">Stake Tokens</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="flex-1 h-10 px-3"
                      min="1"
                    />
                    <Button onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter amount"]') as HTMLInputElement;
                      const amount = parseInt(input?.value || '0');
                      if (amount > 0 && onStake) {
                        onStake(amount);
                        input.value = '';
                      }
                    }}>
                      Stake
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {[1000, 5000, 10000].map(amount => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (onStake) onStake(amount);
                        }}
                      >
                        {amount >= 1000 ? `${amount / 1000}k` : amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Unstake */}
                <div>
                  <label className="text-sm font-medium mb-2">Unstake Tokens</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="flex-1 h-10 px-3"
                      min="1"
                      max={stats.totalStaked}
                    />
                    <Button
                      variant="outline"
                      onClick={handleUnstake}
                      disabled={!unstakeAmount || parseInt(unstakeAmount) > stats.totalStaked}
                    >
                      Unstake
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available: {stats.totalStaked.toLocaleString()} tokens
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Tiers Overview */}
          <Card>
            <CardHeader>
              <CardTitle>All Staking Tiers</CardTitle>
              <CardDescription>
                Compare benefits across all stake levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(tierFeatures).map(([level, tier]) => (
                  <div
                    key={level}
                    className={`p-4 rounded-lg border ${
                      stats.currentTier >= parseInt(level)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${tier.color} text-white`}>
                          {tier.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{tier.name}</h4>
                            {stats.currentTier >= parseInt(level) && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Level {level} • {(level * 1000).toLocaleString()} tokens min
                          </p>
                        </div>
                      </div>
                      <Badge variant={stats.currentTier >= parseInt(level) ? "default" : "secondary"}>
                        {tier.maxRevenueShare}% revenue
                      </Badge>
                    </div>

                    <div className="mt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {stats.currentTier >= parseInt(level) ? (
                              <Gift className="h-3 w-3 text-green-600" />
                            ) : (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className={stats.currentTier >= parseInt(level) ? "" : "text-muted-foreground"}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <StakingCalculator
            currentStake={stats.totalStaked}
            onStake={onStake}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}