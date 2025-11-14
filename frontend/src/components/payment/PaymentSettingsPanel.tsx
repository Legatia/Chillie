import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Wallet, Settings, Users, Zap } from 'lucide-react';

export interface PaymentSettings {
  minTip: number;
  accessFee: number;
  paymentsEnabled: boolean;
  qualityTiers: {
    Standard: number;
    High: number;
    Premium: number;
    Ultra: number;
  };
}

interface PaymentSettingsPanelProps {
  settings: PaymentSettings;
  onSettingsChange: (settings: PaymentSettings) => void;
  isHost?: boolean;
}

const defaultQualityTiers = {
  Standard: 0,
  High: 200,
  Premium: 500,
  Ultra: 2000,
};

export function PaymentSettingsPanel({
  settings,
  onSettingsChange,
  isHost = false
}: PaymentSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<PaymentSettings>(settings);

  const updateSetting = <K extends keyof PaymentSettings>(
    key: K,
    value: PaymentSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const updateQualityTier = (tier: keyof PaymentSettings['qualityTiers'], value: number) => {
    const newSettings = {
      ...localSettings,
      qualityTiers: {
        ...localSettings.qualityTiers,
        [tier]: value,
      },
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Payment Settings
        </CardTitle>
        <CardDescription>
          Configure payment options for your room
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="quality">Quality Tiers</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow participants to tip and pay for quality upgrades
                </p>
              </div>
              <Switch
                checked={localSettings.paymentsEnabled}
                onCheckedChange={(checked) => updateSetting('paymentsEnabled', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="minTip">Minimum Tip Amount</Label>
              <Input
                id="minTip"
                type="number"
                value={localSettings.minTip}
                onChange={(e) => updateSetting('minTip', parseInt(e.target.value) || 0)}
                disabled={!localSettings.paymentsEnabled}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">
                Minimum amount users can tip (recommended: 50-100 units)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessFee">Room Access Fee</Label>
              <Input
                id="accessFee"
                type="number"
                value={localSettings.accessFee}
                onChange={(e) => updateSetting('accessFee', parseInt(e.target.value) || 0)}
                disabled={!localSettings.paymentsEnabled}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 for free public rooms
              </p>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    Standard Quality (SD)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={localSettings.qualityTiers.Standard}
                      onChange={(e) => updateQualityTier('Standard', parseInt(e.target.value) || 0)}
                      disabled={!localSettings.paymentsEnabled}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">units</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Free tier for mobile/bandwidth-constrained users</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded"></div>
                    High Quality (HD)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={localSettings.qualityTiers.High}
                      onChange={(e) => updateQualityTier('High', parseInt(e.target.value) || 0)}
                      disabled={!localSettings.paymentsEnabled}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">units</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">720p/1080p for most users</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-400 rounded"></div>
                    Premium Quality (FHD)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={localSettings.qualityTiers.Premium}
                      onChange={(e) => updateQualityTier('Premium', parseInt(e.target.value) || 0)}
                      disabled={!localSettings.paymentsEnabled}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">units</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">1080p+ for premium experience</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    Ultra Quality (4K)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={localSettings.qualityTiers.Ultra}
                      onChange={(e) => updateQualityTier('Ultra', parseInt(e.target.value) || 0)}
                      disabled={!localSettings.paymentsEnabled}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">units</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">4K for power users and big screens</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Zap className="h-4 w-4 text-yellow-500" />
              <p className="text-sm">
                <strong>Pro Tip:</strong> Most successful creators use HD as the entry tier with Ultra for super fans
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Payment Preview</h4>

              <div className="grid gap-2">
                <div className="flex justify-between text-sm">
                  <span>Room Access:</span>
                  <Badge variant={localSettings.accessFee === 0 ? "secondary" : "default"}>
                    {localSettings.accessFee === 0 ? "Free" : `${localSettings.accessFee} units`}
                  </Badge>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Minimum Tip:</span>
                  <Badge variant="outline">{localSettings.minTip} units</Badge>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm font-medium">Quality Options:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Standard:</span>
                      <span>{localSettings.qualityTiers.Standard === 0 ? "Free" : `${localSettings.qualityTiers.Standard} units`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High:</span>
                      <span>{localSettings.qualityTiers.High === 0 ? "Free" : `${localSettings.qualityTiers.High} units`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium:</span>
                      <span>{localSettings.qualityTiers.Premium === 0 ? "Free" : `${localSettings.qualityTiers.Premium} units`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ultra:</span>
                      <span>{localSettings.qualityTiers.Ultra === 0 ? "Free" : `${localSettings.qualityTiers.Ultra} units`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isHost && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800">Host Revenue Sharing</p>
                </div>
                <p className="text-xs text-green-700">
                  You'll receive 95% of all tips and quality payments after network fees
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}