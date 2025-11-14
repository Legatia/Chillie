import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Heart, MessageCircle, Star, Zap, Wallet, Gift, TrendingUp } from 'lucide-react';

export interface TipAmount {
  amount: number;
  label: string;
  icon?: React.ReactNode;
  popular?: boolean;
}

interface TippingPanelProps {
  minTipAmount: number;
  userBalance: number;
  roomStats: {
    totalTips: number;
    activeTippers: number;
    recentTips: Array<{ amount: number; message: string; timestamp: Date }>;
  };
  onSendTip: (amount: number, message: string, superChat: boolean) => Promise<void>;
  isLoading?: boolean;
}

const defaultTipAmounts: TipAmount[] = [
  { amount: 50, label: 'Small', icon: <Heart className="h-3 w-3" /> },
  { amount: 100, label: 'Medium', icon: <Gift className="h-3 w-3" />, popular: true },
  { amount: 200, label: 'Large', icon: <Star className="h-3 w-3" /> },
  { amount: 500, label: 'XL', icon: <Zap className="h-3 w-3" /> },
];

export function TippingPanel({
  minTipAmount,
  userBalance,
  roomStats,
  onSendTip,
  isLoading = false
}: TippingPanelProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(minTipAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [superChat, setSuperChat] = useState<boolean>(false);
  const [showRecent, setShowRecent] = useState<boolean>(true);

  const tipAmounts = [
    ...defaultTipAmounts,
    { amount: 1000, label: 'Mega', icon: <TrendingUp className="h-3 w-3" /> },
  ];

  const getSuperChatMultiplier = () => superChat ? 2 : 1;
  const getTotalCost = () => selectedAmount * getSuperChatMultiplier();
  const canAffordTip = userBalance >= getTotalCost();

  const handleSendTip = async () => {
    if (!canAffordTip || selectedAmount < minTipAmount) return;

    try {
      await onSendTip(selectedAmount, message, superChat);
      setMessage('');
      setCustomAmount('');
    } catch (error) {
      console.error('Failed to send tip:', error);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseInt(value) || 0;
    if (amount >= minTipAmount) {
      setSelectedAmount(amount);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Support the Creator
        </CardTitle>
        <CardDescription>
          Send a tip to show your appreciation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Balance Display */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">Your Balance</span>
          </div>
          <span className="text-lg font-bold">{userBalance.toLocaleString()} units</span>
        </div>

        {/* Tip Amount Selection */}
        <div className="space-y-3">
          <Label>Select Tip Amount</Label>
          <div className="grid grid-cols-2 gap-2">
            {tipAmounts.map((tip) => (
              <Button
                key={tip.amount}
                variant={selectedAmount === tip.amount ? "default" : "outline"}
                className="relative"
                onClick={() => handleAmountSelect(tip.amount)}
                disabled={!canAffordTip || userBalance < tip.amount}
              >
                {tip.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-500 text-xs px-1">
                    Popular
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  {tip.icon}
                  <div className="text-left">
                    <div className="font-bold">{tip.amount}</div>
                    <div className="text-xs">{tip.label}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="space-y-2">
          <Label htmlFor="customAmount">Custom Amount</Label>
          <Input
            id="customAmount"
            type="number"
            placeholder={`Min: ${minTipAmount} units`}
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            min={minTipAmount}
          />
        </div>

        {/* Super Chat Option */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Super Chat
            </Label>
            <p className="text-xs text-muted-foreground">
              Highlight your message and get noticed (2x cost)
            </p>
          </div>
          <Switch
            checked={superChat}
            onCheckedChange={setSuperChat}
          />
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <Label htmlFor="message">
            Message {superChat && <span className="text-yellow-500">(Will be highlighted)</span>}
          </Label>
          <Textarea
            id="message"
            placeholder="Say something nice..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={superChat ? 200 : 100}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Optional</span>
            <span>{message.length}/{superChat ? 200 : 100}</span>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="space-y-2 p-3 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Tip Amount:</span>
            <span>{selectedAmount} units</span>
          </div>
          {superChat && (
            <div className="flex justify-between text-sm">
              <span>Super Chat Multiplier:</span>
              <span>x2</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total Cost:</span>
            <span>{getTotalCost()} units</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Your Balance:</span>
              <span>{userBalance.toLocaleString()} units</span>
            </div>
            <Progress
              value={canAffordTip ? 100 : (userBalance / getTotalCost()) * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Send Tip Button */}
        <Button
          onClick={handleSendTip}
          disabled={!canAffordTip || selectedAmount < minTipAmount || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Processing...' : (
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Send Tip ({getTotalCost()} units)
              {superChat && <Star className="h-4 w-4 text-yellow-500" />}
            </div>
          )}
        </Button>

        {!canAffordTip && (
          <p className="text-xs text-destructive text-center">
            Insufficient balance. Add more units to send this tip.
          </p>
        )}

        {/* Room Stats */}
        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Room Activity</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecent(!showRecent)}
            >
              {showRecent ? 'Hide' : 'Show'} Recent
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="h-3 w-3 text-red-500" />
              <span>Total Tips:</span>
              <Badge variant="outline">{roomStats.totalTips}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-3 w-3 text-blue-500" />
              <span>Active Tippers:</span>
              <Badge variant="outline">{roomStats.activeTippers}</Badge>
            </div>
          </div>

          {showRecent && roomStats.recentTips.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Recent Tips:</p>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {roomStats.recentTips.slice(0, 3).map((tip, idx) => (
                  <div key={idx} className="text-xs p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="font-medium">{tip.amount} units</span>
                      <span className="text-muted-foreground">
                        {new Date(tip.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {tip.message && (
                      <p className="text-muted-foreground mt-1 truncate">
                        "{tip.message}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}