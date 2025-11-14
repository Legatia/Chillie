import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Shield, Wallet, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StakingDashboard, type StakingStats } from '@/components/staking/StakingDashboard';
import { StakingCalculator } from '@/components/staking/StakingCalculator';
import { WalletConnector } from '@/components/blockchain/WalletConnector';
import { useToast } from '@/hooks/use-toast';

const StakingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock staking data - in real app, this would come from blockchain
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    totalStaked: 2500,
    currentTier: 2,
    monthlyEarnings: 450,
    lifetimeEarnings: 2400,
    nextTierStake: 5000,
    revenueShare: 85
  });

  const handleStake = (amount: number) => {
    setStakingStats(prev => ({
      ...prev,
      totalStaked: prev.totalStaked + amount,
      currentTier: prev.totalStaked + amount >= 10000 ? 3 :
                  prev.totalStaked + amount >= 5000 ? 2 :
                  prev.totalStaked + amount >= 1000 ? 1 : 0,
      revenueShare: prev.totalStaked + amount >= 10000 ? 97 :
                   prev.totalStaked + amount >= 5000 ? 85 :
                   prev.totalStaked + amount >= 1000 ? 70 : 0,
      monthlyEarnings: Math.floor((prev.totalStaked + amount) * 0.18),
      lifetimeEarnings: prev.lifetimeEarnings + Math.floor(amount * 0.1)
    }));

    toast({
      title: "Staking Successful!",
      description: `You have successfully staked ${amount.toLocaleString()} tokens.`,
    });
  };

  const handleUnstake = (amount: number) => {
    if (amount > stakingStats.totalStaked) return;

    setStakingStats(prev => ({
      ...prev,
      totalStaked: prev.totalStaked - amount,
      currentTier: prev.totalStaked - amount >= 10000 ? 3 :
                  prev.totalStaked - amount >= 5000 ? 2 :
                  prev.totalStaked - amount >= 1000 ? 1 : 0,
      revenueShare: prev.totalStaked - amount >= 10000 ? 97 :
                   prev.totalStaked - amount >= 5000 ? 85 :
                   prev.totalStaked - amount >= 1000 ? 70 : 0,
      monthlyEarnings: Math.floor((prev.totalStaked - amount) * 0.18),
      lifetimeEarnings: prev.lifetimeEarnings
    }));

    toast({
      title: "Unstaking Successful!",
      description: `You have successfully unstaked ${amount.toLocaleString()} tokens.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Staking Portal
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Unlock premium features and maximize your revenue share
            </p>
          </div>

          <div className="flex items-center gap-4">
            <WalletConnector />
          </div>
        </div>

        {/* Current Status Banner */}
        <Card className="mb-8 border-2 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${
                  stakingStats.currentTier >= 3 ? 'from-yellow-500 to-yellow-600' :
                  stakingStats.currentTier >= 2 ? 'from-purple-500 to-purple-600' :
                  stakingStats.currentTier >= 1 ? 'from-blue-500 to-blue-600' :
                  'from-gray-500 to-gray-600'
                } text-white`}>
                  {stakingStats.currentTier >= 3 ? <Crown className="h-6 w-6" /> :
                   stakingStats.currentTier >= 2 ? <Zap className="h-6 w-6" /> :
                   stakingStats.currentTier >= 1 ? <TrendingUp className="h-6 w-6" /> :
                   <Shield className="h-6 w-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {stakingStats.currentTier >= 3 ? 'Premium Creator' :
                     stakingStats.currentTier >= 2 ? 'Streamer' :
                     stakingStats.currentTier >= 1 ? 'Content Creator' :
                     'Basic User'}
                  </h2>
                  <p className="text-muted-foreground">
                    {stakingStats.totalStaked.toLocaleString()} tokens staked • {stakingStats.revenueShare}% revenue share
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-muted-foreground">Monthly Earnings</div>
                <div className="text-2xl font-bold text-green-600">
                  ${stakingStats.monthlyEarnings.toLocaleString()}
                </div>
                <Badge variant="outline" className="mt-1">
                  Tier {stakingStats.currentTier}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="tiers">All Tiers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StakingDashboard
              stats={stakingStats}
              onStake={handleStake}
              onUnstake={handleUnstake}
            />
          </TabsContent>

          <TabsContent value="calculator">
            <StakingCalculator
              currentStake={stakingStats.totalStaked}
              onStake={handleStake}
            />
          </TabsContent>

          <TabsContent value="rewards">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Share Breakdown
                  </CardTitle>
                  <CardDescription>
                    See how your staking level affects your earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">You Receive</span>
                      <span className="text-xl font-bold text-green-600">{stakingStats.revenueShare}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Platform Fee</span>
                      <span className="text-xl font-bold text-blue-600">{100 - stakingStats.revenueShare}%</span>
                    </div>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Example Calculation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly tips received:</span>
                          <span>$1,000</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Your earnings ({stakingStats.revenueShare}%):</span>
                          <span className="text-green-600">${stakingStats.revenueShare * 10}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Earnings History
                  </CardTitle>
                  <CardDescription>
                    Track your staking rewards over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <div className="text-3xl font-bold text-primary mb-2">
                        ${stakingStats.lifetimeEarnings.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground">Lifetime Earnings</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>This Month:</span>
                        <span className="font-medium">${stakingStats.monthlyEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Month:</span>
                        <span className="font-medium">${Math.floor(stakingStats.monthlyEarnings * 0.9).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>2 Months Ago:</span>
                        <span className="font-medium">${Math.floor(stakingStats.monthlyEarnings * 0.8).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tiers">
            <Card>
              <CardHeader>
                <CardTitle>Complete Tier Comparison</CardTitle>
                <CardDescription>
                  Compare all staking tiers and their benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Basic User',
                      stake: '0',
                      revenue: '0%',
                      color: 'from-gray-500 to-gray-600',
                      features: ['Join private rooms', 'Basic participation', 'View public content', 'Send tips']
                    },
                    {
                      name: 'Content Creator',
                      stake: '1,000',
                      revenue: '70%',
                      color: 'from-blue-500 to-blue-600',
                      features: ['Create public podcast rooms', 'Enable tipping', 'Basic analytics', 'Community features']
                    },
                    {
                      name: 'Streamer',
                      stake: '5,000',
                      revenue: '85%',
                      color: 'from-purple-500 to-purple-600',
                      features: ['Create video streaming rooms', 'Advanced payments', 'Priority bandwidth', 'Advanced analytics']
                    },
                    {
                      name: 'Premium Creator',
                      stake: '10,000+',
                      revenue: '97%',
                      color: 'from-yellow-500 to-yellow-600',
                      features: ['Multi-room hosting', 'API access', 'Exclusive features', 'Dedicated support']
                    }
                  ].map((tier, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        stakingStats.currentTier >= index
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${tier.color} text-white`}>
                            {index === 0 ? <Shield className="h-4 w-4" /> :
                             index === 1 ? <TrendingUp className="h-4 w-4" /> :
                             index === 2 ? <Zap className="h-4 w-4" /> :
                             <Crown className="h-4 w-4" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{tier.name}</h3>
                            <p className="text-sm text-muted-foreground">{tier.stake} tokens minimum</p>
                          </div>
                        </div>
                        <Badge variant={stakingStats.currentTier >= index ? "default" : "secondary"}>
                          {tier.revenue} revenue
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {stakingStats.currentTier >= index ? (
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-muted" />
                            )}
                            <span className={stakingStats.currentTier >= index ? "" : "text-muted-foreground"}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StakingPage;