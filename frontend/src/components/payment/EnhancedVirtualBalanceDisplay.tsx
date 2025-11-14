import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Wallet, TrendingUp, Clock, AlertCircle, RefreshCw, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { useVirtualBalance } from '@/hooks/useVirtualBalance';
import { useState } from 'react';
import { DepositModal } from './DepositModal';
import { WithdrawalModal } from './WithdrawalModal';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

interface EnhancedVirtualBalanceDisplayProps {
  userId: string;
  compact?: boolean;
}

// Mock transaction history data (in production, fetch from backend)
const generateMockHistory = (balance: number) => [
  { date: 'Mon', balance: balance * 0.7, deposits: balance * 0.3, tips: balance * 0.1 },
  { date: 'Tue', balance: balance * 0.75, deposits: balance * 0.05, tips: balance * 0.15 },
  { date: 'Wed', balance: balance * 0.8, deposits: 0, tips: balance * 0.05 },
  { date: 'Thu', balance: balance * 0.85, deposits: balance * 0.1, tips: balance * 0.05 },
  { date: 'Fri', balance: balance * 0.9, deposits: 0, tips: balance * 0.05 },
  { date: 'Sat', balance: balance * 0.95, deposits: balance * 0.05, tips: balance * 0.1 },
  { date: 'Today', balance, deposits: balance * 0.05, tips: 0 },
];

const chartConfig = {
  balance: {
    label: 'Balance',
    color: 'hsl(var(--chart-1))',
  },
  deposits: {
    label: 'Deposits',
    color: 'hsl(var(--chart-2))',
  },
  tips: {
    label: 'Tips Sent',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export const EnhancedVirtualBalanceDisplay = ({ userId, compact = false }: EnhancedVirtualBalanceDisplayProps) => {
  const { balance, isLoading, settle, refetch } = useVirtualBalance(userId);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const chartData = balance ? generateMockHistory(balance.availableBalance) : [];

  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Virtual Balance</div>
              <div className="text-2xl font-bold">
                ${balance?.availableBalance.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              onClick={() => setShowDepositModal(true)}
              className="gap-1"
            >
              <ArrowDownRight className="h-3 w-3" />
              Add
            </Button>
            {balance && balance.pendingTransactions > 0 && (
              <Badge variant="outline" className="justify-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {balance.pendingTransactions}
              </Badge>
            )}
          </div>
        </div>

        {showDepositModal && (
          <DepositModal userId={userId} onClose={() => setShowDepositModal(false)} />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Balance Card */}
        <Card className="overflow-hidden border-2 lg:col-span-2">
          <CardHeader className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Virtual Balance</CardTitle>
                  <CardDescription>Instant payments enabled</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Balance Display */}
            <div className="text-center">
              <div className="mb-1 text-sm text-muted-foreground">Available Balance</div>
              <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-5xl font-bold text-transparent">
                ${balance?.availableBalance.toFixed(2) || '0.00'}
              </div>
              <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3 text-green-600" />
                  Total Deposited: ${balance?.depositedBalance.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="mb-2 text-xs font-medium text-muted-foreground">7-Day Activity</div>
              <ChartContainer config={chartConfig} className="h-[120px] w-full">
                <AreaChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Area
                    dataKey="balance"
                    type="natural"
                    fill="var(--color-balance)"
                    fillOpacity={0.4}
                    stroke="var(--color-balance)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowDepositModal(true)}
                className="gap-2"
                size="lg"
              >
                <ArrowDownRight className="h-4 w-4" />
                Deposit
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(true)}
                disabled={!balance?.canWithdraw}
                className="gap-2"
                size="lg"
              >
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Transactions Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Pending Settlement
            </CardTitle>
            <CardDescription>Auto-settles hourly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {balance && balance.pendingTransactions > 0 ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div className="text-sm text-muted-foreground">Transactions</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{balance.pendingTransactions}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="font-semibold">${balance.totalPending.toFixed(2)}</div>
                  </div>
                </div>

                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:bg-orange-950/20">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-100">
                    <Zap className="h-4 w-4" />
                    Settlement Status
                  </div>
                  <p className="mb-3 text-xs text-orange-700 dark:text-orange-300">
                    Your transactions will be automatically settled within the hour. Or settle now:
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => settle()}
                  >
                    Settle Now
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-sm font-medium">All Settled!</div>
                <div className="text-xs text-muted-foreground">No pending transactions</div>
              </div>
            )}

            {/* Info Section */}
            <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Deposit:</span>
                <span className="font-medium">
                  {balance?.lastDeposit
                    ? new Date(balance.lastDeposit).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Settlement:</span>
                <span className="font-medium">
                  {balance?.lastSettlement
                    ? new Date(balance.lastSettlement).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Balance Warning */}
      {balance && balance.availableBalance < 10 && (
        <Card className="mt-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <div className="font-medium text-yellow-900 dark:text-yellow-100">
                Low Balance Alert
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                Your balance is running low. Deposit more to continue tipping instantly.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDepositModal(true)}
              className="border-yellow-300 bg-yellow-100 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900 dark:hover:bg-yellow-800"
            >
              Add Funds
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showDepositModal && (
        <DepositModal userId={userId} onClose={() => setShowDepositModal(false)} />
      )}

      {showWithdrawModal && (
        <WithdrawalModal
          userId={userId}
          currentBalance={balance?.availableBalance || 0}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
    </>
  );
};
