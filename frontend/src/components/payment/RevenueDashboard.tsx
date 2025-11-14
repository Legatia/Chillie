import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  TrendingUp,
  DollarSign,
  Users,
  Heart,
  Crown,
  Star,
  Zap,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';

export interface RoomRevenueBreakdown {
  roomId: string;
  host: string;
  totalTips: number;
  totalAccessFees: number;
  pendingTips: number;
  pendingAccessFees: number;
  totalRevenue: number;
  pendingRevenue: number;
  activeTippers: number;
  qualityTierRevenue: {
    Standard: number;
    High: number;
    Premium: number;
    Ultra: number;
  };
}

interface RevenueDashboardProps {
  revenueData: RoomRevenueBreakdown;
  isLive: boolean;
  onWithdraw: (amount: number) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export function RevenueDashboard({
  revenueData,
  isLive,
  onWithdraw,
  onRefresh,
  isLoading = false
}: RevenueDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await onWithdraw(revenueData.totalRevenue);
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const settledRevenue = revenueData.totalRevenue - revenueData.pendingRevenue;
  const settlementProgress = revenueData.totalRevenue > 0
    ? (settledRevenue / revenueData.totalRevenue) * 100
    : 0;

  const topQualityTier = Object.entries(revenueData.qualityTierRevenue)
    .sort(([,a], [,b]) => b - a)[0];

  const averageTip = revenueData.activeTippers > 0
    ? Math.round(revenueData.totalTips / revenueData.activeTippers)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Dashboard
            </CardTitle>
            <CardDescription>
              {isLive ? 'Live' : 'Offline'} • Room {revenueData.roomId}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge variant="default" className="bg-red-500">
                <Activity className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Main Revenue Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold">{revenueData.totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">units earned</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Total Tips</span>
                </div>
                <div className="text-2xl font-bold">{revenueData.totalTips.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">from {revenueData.activeTippers} tippers</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Quality Fees</span>
                </div>
                <div className="text-2xl font-bold">{revenueData.totalAccessFees.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">quality upgrades</div>
              </Card>
            </div>

            {/* Settlement Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-medium">Settlement Status</span>
                </div>
                <Badge variant={revenueData.pendingRevenue > 0 ? "outline" : "default"}>
                  {revenueData.pendingRevenue > 0 ? 'Pending' : 'Settled'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Settled:</span>
                  <span>{settledRevenue.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span>{revenueData.pendingRevenue.toLocaleString()} units</span>
                </div>
                <Progress value={settlementProgress} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {Math.round(settlementProgress)}% of revenue settled
                </div>
              </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3 w-3" />
                  <span className="text-xs font-medium">Active Tippers</span>
                </div>
                <div className="text-lg font-bold">{revenueData.activeTippers}</div>
                <div className="text-xs text-muted-foreground">
                  Avg: {averageTip} units/tip
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-3 w-3" />
                  <span className="text-xs font-medium">Top Quality</span>
                </div>
                <div className="text-lg font-bold">{topQualityTier?.[0] || 'None'}</div>
                <div className="text-xs text-muted-foreground">
                  {topQualityTier?.[1]?.toLocaleString() || 0} units
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            {/* Quality Tier Revenue */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-4 w-4" />
                <span className="text-sm font-medium">Revenue by Quality Tier</span>
              </div>
              <div className="space-y-3">
                {Object.entries(revenueData.qualityTierRevenue).map(([tier, revenue]) => {
                  const percentage = revenueData.totalAccessFees > 0
                    ? (revenue / revenueData.totalAccessFees) * 100
                    : 0;

                  return (
                    <div key={tier} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            tier === 'Standard' ? 'bg-gray-400' :
                            tier === 'High' ? 'bg-blue-400' :
                            tier === 'Premium' ? 'bg-purple-400' :
                            'bg-yellow-400'
                          }`}></div>
                          {tier}
                        </span>
                        <span>{revenue.toLocaleString()} units ({Math.round(percentage)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Revenue Composition */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Revenue Composition</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Tips:</span>
                  <span>{revenueData.totalTips.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quality Fees:</span>
                  <span>{revenueData.totalAccessFees.toLocaleString()} units</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{revenueData.totalRevenue.toLocaleString()} units</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Tipping Activity</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Tips:</span>
                    <span>{revenueData.totalTips.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Tips:</span>
                    <span>{revenueData.pendingTips.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Tippers:</span>
                    <span>{revenueData.activeTippers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Tip:</span>
                    <span>{averageTip} units</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Quality Upgrades</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Quality Fees:</span>
                    <span>{revenueData.totalAccessFees.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Quality Fees:</span>
                    <span>{revenueData.pendingAccessFees.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Most Popular:</span>
                    <span>{topQualityTier?.[0] || 'None'}</span>
                  </div>
                </div>
              </Card>
            </div>

            {isLive && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Room is Live</span>
                </div>
                <p className="text-xs text-green-700">
                  Revenue data updates in real-time as participants join and tip
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-medium">Available for Withdrawal</span>
              </div>
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-3xl font-bold mb-2">
                    {settledRevenue.toLocaleString()} units
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ready for immediate withdrawal
                  </p>
                </div>

                {revenueData.pendingRevenue > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      <strong>Note:</strong> {revenueData.pendingRevenue.toLocaleString()} units are still pending settlement.
                      These will be available for withdrawal once batch processing completes.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleWithdraw}
                  disabled={settledRevenue === 0 || isWithdrawing}
                  className="w-full"
                  size="lg"
                >
                  {isWithdrawing ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing Withdrawal...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Withdraw {settledRevenue.toLocaleString()} units
                    </div>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Withdrawals are processed instantly to your wallet
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}