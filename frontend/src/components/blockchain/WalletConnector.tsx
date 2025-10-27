import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, ExternalLink, AlertCircle, Terminal } from 'lucide-react';
import { useWalletConnection } from '@/hooks/useBlockchain';
import { useToast } from '@/hooks/use-toast';

export const WalletConnector = () => {
  const { isConnected, address, connect, disconnect } = useWalletConnection();
  const { toast } = useToast();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [walletBalance, setWalletBalance] = useState<string>('');

  useEffect(() => {
    // Check backend server status
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/balance');
        if (response.ok) {
          const data = await response.json();
          setBackendStatus('online');
          if (data.success) {
            setWalletBalance(data.balance);
          }
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "CLI Wallet Connected!",
        description: "Successfully connected to Linera CLI wallet",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "CLI Wallet Disconnected",
      description: "You have been disconnected from your Linera CLI wallet",
    });
  };

  if (backendStatus === 'offline') {
    return (
      <Alert className="max-w-2xl border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-2">
            <p className="font-semibold">Backend Server Required</p>
            <p className="text-sm">
              Chillie requires the backend server to connect to the Linera CLI wallet.
              Please start the backend server first.
            </p>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono mt-2">
              <code>cd /Users/tobiasd/Desktop/Chillie && node backend-server.js</code>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-2"
              variant="outline"
              size="sm"
            >
              Refresh Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (backendStatus === 'checking') {
    return (
      <Alert className="max-w-md border-blue-200 bg-blue-50">
        <Terminal className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p className="font-medium">Connecting to CLI Wallet...</p>
            <p className="text-sm">
              Checking Linera CLI wallet status...
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnected && address) {
    return (
      <Alert className="max-w-md border-green-200 bg-green-50">
        <Wallet className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">CLI Wallet Connected</div>
                <div className="text-sm opacity-90">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                {walletBalance && (
                  <div className="text-xs opacity-75">
                    Balance: {walletBalance} LINERA
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="ml-2 text-xs"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="max-w-md border-orange-200 bg-orange-50">
      <Terminal className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="space-y-2">
          <p className="font-medium">Connect Linera CLI Wallet</p>
          <p className="text-sm">
            Connect to your Linera CLI wallet to create rooms on the blockchain
          </p>
          {walletBalance && (
            <div className="text-xs opacity-75">
              Available Balance: {walletBalance} LINERA
            </div>
          )}
          <Button onClick={handleConnect} size="sm" className="mt-1">
            Connect CLI Wallet
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};