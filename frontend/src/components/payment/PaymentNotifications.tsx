import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Heart,
  Star,
  Crown,
  Zap,
  TrendingUp,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

export interface PaymentNotification {
  id: string;
  type: 'tip' | 'super_chat' | 'quality_upgrade' | 'batch_settlement';
  userId: string;
  userName: string;
  amount: number;
  message?: string;
  quality?: string;
  timestamp: Date;
  metadata?: any;
}

interface PaymentNotificationsProps {
  notifications: PaymentNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
}

export function PaymentNotifications({
  notifications,
  onDismiss,
  onClearAll,
  soundEnabled,
  onToggleSound,
  position = 'top-right',
  maxVisible = 5
}: PaymentNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<PaymentNotification[]>([]);

  useEffect(() => {
    // Keep only the most recent notifications
    const sorted = [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setVisibleNotifications(sorted.slice(0, maxVisible));
  }, [notifications, maxVisible]);

  useEffect(() => {
    // Auto-dismiss notifications after 10 seconds
    const timers = visibleNotifications.map(notification => {
      if (notification.type === 'super_chat') {
        return; // Super chats stay visible longer
      }

      return setTimeout(() => {
        onDismiss(notification.id);
      }, 10000);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleNotifications, onDismiss]);

  const getPositionClasses = () => {
    const base = "fixed z-50 p-4 space-y-2 max-w-sm";
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
    };
    return `${base} ${positions[position]}`;
  };

  const renderNotification = (notification: PaymentNotification) => {
    const isSuperChat = notification.type === 'super_chat';
    const isTip = notification.type === 'tip';
    const isQualityUpgrade = notification.type === 'quality_upgrade';
    const isBatchSettlement = notification.type === 'batch_settlement';

    if (isSuperChat) {
      return (
        <SuperChatNotification
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      );
    }

    if (isTip) {
      return (
        <TipNotification
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      );
    }

    if (isQualityUpgrade) {
      return (
        <QualityUpgradeNotification
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      );
    }

    if (isBatchSettlement) {
      return (
        <BatchSettlementNotification
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      );
    }

    return null;
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={getPositionClasses()}>
      {/* Clear All Button */}
      {visibleNotifications.length > 1 && (
        <div className="flex justify-between items-center p-2 bg-background/95 backdrop-blur-sm border rounded-lg">
          <span className="text-xs text-muted-foreground">
            {visibleNotifications.length} notifications
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSound}
              className="h-6 px-2"
            >
              {soundEnabled ? (
                <Volume2 className="h-3 w-3" />
              ) : (
                <VolumeX className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {visibleNotifications.map(renderNotification)}
    </div>
  );
}

// Super Chat Notification (Prominent, stays longer)
function SuperChatNotification({ notification, onDismiss }: { notification: PaymentNotification, onDismiss: () => void }) {
  return (
    <Card className="w-full bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 shadow-lg animate-in slide-in-from-right">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <Badge className="bg-yellow-500 text-white">SUPER CHAT</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.userName}</span>
            <span className="font-bold text-lg text-yellow-700">
              {notification.amount.toLocaleString()} units
            </span>
          </div>

          {notification.message && (
            <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-sm">{notification.message}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Regular Tip Notification
function TipNotification({ notification, onDismiss }: { notification: PaymentNotification, onDismiss: () => void }) {
  return (
    <Card className="w-full bg-red-50 border-red-200 animate-in slide-in-from-right">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <div>
              <span className="font-medium text-sm">{notification.userName}</span>
              <div className="text-xs text-muted-foreground">
                tipped {notification.amount.toLocaleString()} units
              </div>
              {notification.message && (
                <div className="text-xs mt-1 text-muted-foreground">
                  "{notification.message}"
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {notification.amount} units
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quality Upgrade Notification
function QualityUpgradeNotification({ notification, onDismiss }: { notification: PaymentNotification, onDismiss: () => void }) {
  return (
    <Card className="w-full bg-blue-50 border-blue-200 animate-in slide-in-from-right">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-blue-500" />
            <div>
              <span className="font-medium text-sm">{notification.userName}</span>
              <div className="text-xs text-muted-foreground">
                upgraded to {notification.quality} quality
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {notification.amount} units
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Batch Settlement Notification
function BatchSettlementNotification({ notification, onDismiss }: { notification: PaymentNotification, onDismiss: () => void }) {
  return (
    <Card className="w-full bg-green-50 border-green-200 animate-in slide-in-from-right">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-500" />
            <div>
              <span className="font-medium text-sm">Batch Settlement</span>
              <div className="text-xs text-muted-foreground">
                {notification.metadata?.transactionCount || 1} transactions settled
              </div>
              <div className="text-xs text-green-600 font-medium">
                Saved ~66% on gas fees!
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}