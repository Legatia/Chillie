import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Wallet,
  Plus,
  TrendingUp,
  Activity,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface WalletBalanceProps {
  balance: number;
  pendingTransactions: number;
  onAddFunds: () => void;
  onSettleTransactions: () => Promise<void>;
  isLoading?: boolean;
}

export function WalletBalance({
  balance,
  pendingTransactions,
  onAddFunds,
  onSettleTransactions,
  isLoading = false
}: WalletBalanceProps) {
  const [isSettling, setIsSettling] = useState(false);

  const handleSettleTransactions = async () => {
    if (pendingTransactions === 0) return;

    setIsSettling(true);
    try {
      await onSettleTransactions();
    } catch (error) {
      console.error('Settlement failed:', error);
    } finally {
      setIsSettling(false);
    }
  };

  const shouldShowSettlement = pendingTransactions >= 3; // Auto-settlement threshold
  const settlementSavings = pendingTransactions > 1 ? Math.round((1 - 1/pendingTransactions) * 100) : 0;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Balance Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span className="font-medium">Wallet Balance</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddFunds}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Funds
            </Button>
          </div>

          <div className="text-center py-2">
            <div className="text-3xl font-bold">
              {balance.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              units available
            </div>
          </div>

          {/* Pending Transactions */}
          {pendingTransactions > 0 && (
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Pending Transactions</span>
                </div>
                <Badge variant="outline">{pendingTransactions}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {shouldShowSettlement
                    ? "⚡ Auto-settlement recommended - Save gas fees!"
                    : "Transactions will settle automatically when threshold is reached"}
                </p>

                {settlementSavings > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-700">
                      Save {settlementSavings}% on gas fees with batch settlement
                    </span>
                  </div>
                )}

                {(shouldShowSettlement || pendingTransactions >= 1) && (
                  <Button
                    onClick={handleSettleTransactions}
                    disabled={isSettling || isLoading}
                    className="w-full"
                    variant={shouldShowSettlement ? "default" : "outline"}
                  >
                    {isSettling ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Settling...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Settle {pendingTransactions} Transaction{pendingTransactions > 1 ? 's' : ''}
                        {shouldShowSettlement && ' (Recommended)'}
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={onAddFunds}>
              <Plus className="h-3 w-3 mr-1" />
              Top Up
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              Transactions
            </Button>
          </div>

          {/* Info Note */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Powered by Linera microchain technology</p>
            <p>66% gas savings through batch settlement</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}