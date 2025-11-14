import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Wallet, ArrowDownCircle, Clock, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { useVirtualBalance } from '@/hooks/useVirtualBalance';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

interface EnhancedDepositModalProps {
  userId: string;
  onClose: () => void;
}

export const EnhancedDepositModal = ({ userId, onClose }: EnhancedDepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const { deposit } = useVirtualBalance(userId);

  const quickAmounts = [
    { value: 10, label: '$10', popular: false },
    { value: 25, label: '$25', popular: true },
    { value: 50, label: '$50', popular: false },
    { value: 100, label: '$100', popular: true },
    { value: 250, label: '$250', popular: false },
    { value: 500, label: '$500', popular: false },
  ];

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return;
    }

    setIsProcessing(true);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    const result = await deposit(depositAmount);

    clearInterval(progressInterval);
    setProgress(100);

    if (result.success) {
      setDepositSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }

    setIsProcessing(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            Deposit to Virtual Balance
          </DialogTitle>
          <DialogDescription>
            One-time deposit for instant tipping without delays
          </DialogDescription>
        </DialogHeader>

        {depositSuccess ? (
          <div className="py-12 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 animate-ping rounded-full bg-green-400 opacity-20" />
              </div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 mx-auto">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Deposit Successful!</h3>
            <p className="text-muted-foreground">
              ${amount} has been added to your virtual balance
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
              <Sparkles className="h-4 w-4" />
              You can now tip instantly!
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <Label htmlFor="amount" className="text-base">
                Deposit Amount
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isProcessing}
                  min="0"
                  step="0.01"
                  className="h-14 pl-8 text-2xl font-semibold"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <Label className="mb-3 block text-sm text-muted-foreground">
                Quick Select
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map(({ value, label, popular }) => (
                  <Button
                    key={value}
                    variant={amount === value.toString() ? 'default' : 'outline'}
                    onClick={() => setAmount(value.toString())}
                    disabled={isProcessing}
                    className="relative h-auto flex-col gap-1 py-3"
                  >
                    {popular && (
                      <Badge
                        variant="secondary"
                        className="absolute -right-1 -top-1 h-5 px-1.5 text-xs"
                      >
                        Popular
                      </Badge>
                    )}
                    <span className="text-lg font-bold">{label}</span>
                    {value >= 100 && (
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(value / 5)} tips
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing deposit...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Info Cards */}
            <div className="grid gap-3">
              <div className="flex items-start gap-3 rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Instant Tipping Enabled</div>
                  <p className="text-sm text-muted-foreground">
                    After deposit, send tips instantly without blockchain delays
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium">One-Time Setup</div>
                  <p className="text-sm text-muted-foreground">
                    This deposit takes 30-60 seconds for blockchain confirmation
                  </p>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                How It Works
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>1. CLI wallet transfers to payment contract</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>2. Virtual balance updates on blockchain</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                  <span>3. Tip creators instantly anytime!</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeposit}
                disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                className="flex-1"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Deposit ${amount || '0'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
