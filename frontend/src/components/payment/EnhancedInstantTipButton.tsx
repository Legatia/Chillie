import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Zap, Gift, AlertCircle, Send, Sparkles, Heart, Star, Trophy } from 'lucide-react';
import { useVirtualBalance } from '@/hooks/useVirtualBalance';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface EnhancedInstantTipButtonProps {
  userId: string;
  toHostId: string;
  roomId: string;
  hostName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const tipEmojis = [
  { icon: Heart, label: 'Love it!', color: 'text-red-500' },
  { icon: Star, label: 'Amazing!', color: 'text-yellow-500' },
  { icon: Trophy, label: 'Excellent!', color: 'text-purple-500' },
  { icon: Sparkles, label: 'Great job!', color: 'text-blue-500' },
];

export const EnhancedInstantTipButton = ({
  userId,
  toHostId,
  roomId,
  hostName,
  variant = 'default',
  size = 'default'
}: EnhancedInstantTipButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { balance, tipInstant } = useVirtualBalance(userId);

  const quickTips = [
    { value: 1, label: '$1', emoji: '☕' },
    { value: 5, label: '$5', emoji: '🍕' },
    { value: 10, label: '$10', emoji: '🎉' },
    { value: 25, label: '$25', emoji: '🚀' },
    { value: 50, label: '$50', emoji: '⭐' },
    { value: 100, label: '$100', emoji: '🏆' },
  ];

  const handleSendTip = async () => {
    const tipAmount = parseFloat(amount);

    if (isNaN(tipAmount) || tipAmount <= 0) {
      return;
    }

    if (balance && tipAmount > balance.availableBalance) {
      return;
    }

    setIsSending(true);

    const tipMessage = selectedEmoji !== null
      ? `${tipEmojis[selectedEmoji].label} ${message}`
      : message;

    const result = await tipInstant(toHostId, roomId, tipAmount, tipMessage);

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setShowSuccess(false);
        setAmount('');
        setMessage('');
        setSelectedEmoji(null);
      }, 2000);
    }

    setIsSending(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className="gap-2 font-semibold shadow-sm transition-all hover:shadow-md"
      >
        <Zap className="h-4 w-4" />
        Instant Tip
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                <Gift className="h-5 w-5 text-primary-foreground" />
              </div>
              Send Instant Tip
            </DialogTitle>
            <DialogDescription>
              Tip <span className="font-semibold text-foreground">{hostName}</span> instantly from your virtual balance
            </DialogDescription>
          </DialogHeader>

          {showSuccess ? (
            <div className="py-12 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 animate-ping rounded-full bg-primary/20" />
                </div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Tip Sent!</h3>
              <p className="text-muted-foreground">
                ${amount} tip delivered instantly to {hostName}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Balance Display */}
              <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Your Balance</span>
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Instant
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-primary">
                  ${balance?.availableBalance.toFixed(2) || '0.00'}
                </div>
              </div>

              {/* Low Balance Warning */}
              {balance && balance.availableBalance < 5 && (
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-orange-900 dark:text-orange-100">
                    <strong>Low balance.</strong> Consider depositing more funds for future tips.
                  </AlertDescription>
                </Alert>
              )}

              {/* Quick Tip Grid */}
              <div>
                <Label className="mb-3 block text-base">Quick Tip Amounts</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickTips.map(({ value, label, emoji }) => (
                    <Button
                      key={value}
                      variant={amount === value.toString() ? 'default' : 'outline'}
                      onClick={() => setAmount(value.toString())}
                      disabled={isSending || (balance ? value > balance.availableBalance : true)}
                      className="h-auto flex-col gap-1.5 py-4"
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-sm font-bold">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <Label htmlFor="custom-amount" className="text-base">
                  Or Enter Custom Amount
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isSending}
                    min="0"
                    step="0.01"
                    className="h-12 pl-8 text-xl font-semibold"
                  />
                </div>
              </div>

              <Separator />

              {/* Emoji Reactions */}
              <div>
                <Label className="mb-3 block text-base">Add a Reaction (Optional)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {tipEmojis.map((emoji, index) => {
                    const Icon = emoji.icon;
                    return (
                      <Button
                        key={index}
                        variant={selectedEmoji === index ? 'default' : 'outline'}
                        onClick={() => setSelectedEmoji(selectedEmoji === index ? null : index)}
                        disabled={isSending}
                        className="h-auto flex-col gap-2 py-4"
                      >
                        <Icon className={`h-6 w-6 ${selectedEmoji === index ? 'text-primary-foreground' : emoji.color}`} />
                        <span className="text-xs">{emoji.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="tip-message" className="text-base">
                  Personal Message (Optional)
                </Label>
                <Textarea
                  id="tip-message"
                  placeholder="Say something nice..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSending}
                  rows={3}
                  className="mt-2 resize-none"
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {message.length}/200 characters
                </div>
              </div>

              {/* Instant Confirmation Notice */}
              <Alert className="border-primary/20 bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <strong className="text-primary">Instant confirmation!</strong> Your tip will be
                  delivered immediately and settled automatically within the hour.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendTip}
                  disabled={
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    isSending ||
                    (balance ? parseFloat(amount) > balance.availableBalance : true)
                  }
                  className="flex-1 gap-2"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Zap className="h-4 w-4 animate-pulse" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send ${amount || '0'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
