import { EnhancedVirtualBalanceDisplay } from '@/components/payment/EnhancedVirtualBalanceDisplay';
import { EnhancedInstantTipButton } from '@/components/payment/EnhancedInstantTipButton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Payment Dashboard Demo Page
 *
 * This page demonstrates the enhanced payment components with beautiful shadcn/ui design.
 *
 * Features:
 * - Enhanced virtual balance display with charts
 * - Instant tip button with emoji reactions
 * - Pending transactions tracking
 * - Auto-settlement status
 *
 * Usage:
 * <Route path="/payment-dashboard" element={<PaymentDashboard />} />
 */

interface PaymentDashboardProps {
  userId?: string;
  hostId?: string;
  roomId?: string;
  hostName?: string;
}

export const PaymentDashboard = ({
  userId = 'demo-user-123',
  hostId = 'demo-host-456',
  roomId = 'demo-room-789',
  hostName = 'Alice (Demo Host)'
}: PaymentDashboardProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Payment Dashboard
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Manage your virtual balance and send instant tips
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Virtual Balance Section */}
          <EnhancedVirtualBalanceDisplay userId={userId} />

          {/* Demo Actions */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <EnhancedInstantTipButton
                userId={userId}
                toHostId={hostId}
                roomId={roomId}
                hostName={hostName}
                size="lg"
              />
              <Button variant="outline" size="lg">
                View Transaction History
              </Button>
              <Button variant="outline" size="lg">
                Download Receipt
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6">
              <div className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                Instant Tipping
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Send tips in under 100ms with no blockchain delays after your initial deposit.
              </p>
            </div>

            <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6">
              <div className="mb-2 text-sm font-medium text-green-900 dark:text-green-100">
                Auto-Settlement
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Tips are automatically settled every hour or when $100 threshold is reached.
              </p>
            </div>

            <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6">
              <div className="mb-2 text-sm font-medium text-purple-900 dark:text-purple-100">
                Revenue Sharing
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Creators earn 70-97% based on their staking tier. Platform fee as low as 3%.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">How It Works</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  1
                </div>
                <h3 className="font-semibold">Deposit Once</h3>
                <p className="text-sm text-muted-foreground">
                  Make a one-time deposit to your virtual balance via CLI wallet (30-60 seconds).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  2
                </div>
                <h3 className="font-semibold">Tip Instantly</h3>
                <p className="text-sm text-muted-foreground">
                  Send unlimited tips instantly without any blockchain delays (< 100ms each).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  3
                </div>
                <h3 className="font-semibold">Auto-Settle</h3>
                <p className="text-sm text-muted-foreground">
                  Tips are batched and settled automatically every hour to creators' wallets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
