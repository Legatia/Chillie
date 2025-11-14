import { useState } from "react";
import { useWalletConnection } from "@/hooks/useBlockchain";
import { MainNavigation } from "@/components/navigation/MainNavigation";

const Index = () => {
  // Mock user staking data - in real app, this would come from blockchain or state management
  const [userStake] = useState(2500); // Example: User has 2500 tokens staked

  // Blockchain hooks
  const { isConnected } = useWalletConnection();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <MainNavigation
        userStake={userStake}
        isConnected={isConnected}
      />
    </div>
  );
};

export default Index;
