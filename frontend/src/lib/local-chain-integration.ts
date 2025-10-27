// Local Linera Chain Integration
// Simulates local chain operations for development (bypasses CORS)

// Note: Browser cannot execute CLI commands directly
// This simulates the expected behavior for development

export interface LocalChainConfig {
  chainId: string;
  walletAddress: string;
  contractId?: string;
}

export class LocalChainIntegration {
  private static config: LocalChainConfig = {
    chainId: '9b030590d16320a057e68fc39becafff4c5c46ff239ef27031a959cf45d5b48b',
    walletAddress: '0x19dbc4dba46c4919710591d1187090dab04d9a774e70179d8afdd8f9924bb3d8',
    contractId: '2bd8caee1c4725c919992631a8af75fe6aa4c67115e710a1406838ec8ed1f89e'
  };

  // Simulate local chain operations (browser-compatible)
  private static logOperation(operation: string, details: any) {
    console.log('[LOCAL-CHAIN]', operation, {
      ...details,
      chainId: this.config.chainId,
      walletAddress: this.config.walletAddress,
      timestamp: new Date().toISOString()
    });
  }

  // Create room on local chain
  static async createRoom(roomName: string, isPublic: boolean): Promise<any> {
    try {
      this.logOperation('Creating room on local chain', {
        roomName,
        isPublic
      });

      // Simulate room creation on your local chain
      const roomId = `local-room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        room_id: roomId,
        chain_id: this.config.chainId,
        app_id: this.config.contractId,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockHeight: Math.floor(Math.random() * 100000) + 1000,
        success: true,
        message: `Room "${roomName}" created on your local chain (${this.config.chainId})`
      };
    } catch (error) {
      console.error('[LOCAL-CHAIN] Failed to create room:', error);
      throw error;
    }
  }

  // Join room on local chain
  static async joinRoom(roomId: string, participantName: string): Promise<any> {
    try {
      console.log('[LOCAL-CHAIN] Joining room on local chain:', {
        roomId,
        participantName,
        chainId: this.config.chainId
      });

      // Mock successful join for now
      return {
        participant_id: `user-${Date.now()}`,
        participant_name: participantName,
        joined_at: new Date().toISOString(),
        new_value: Math.floor(Math.random() * 10) + 1,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        success: true,
        message: `Successfully joined room "${roomId}"`
      };
    } catch (error) {
      console.error('[LOCAL-CHAIN] Failed to join room:', error);
      throw error;
    }
  }

  // Get public rooms from local chain
  static async getPublicRooms(): Promise<any[]> {
    try {
      console.log('[LOCAL-CHAIN] Fetching public rooms from local chain');

      // Mock public rooms for now
      // In a real implementation, this would query the actual contract state
      return [
        {
          room_id: "local-room-1",
          chain_id: this.config.chainId,
          app_id: this.config.contractId,
          name: "Local Dev Room 1",
          participant_count: Math.floor(Math.random() * 5) + 1,
          is_public: true,
          host_id: this.config.walletAddress,
        },
        {
          room_id: "local-room-2",
          chain_id: this.config.chainId,
          app_id: this.config.contractId,
          name: "Your Chain Room",
          participant_count: Math.floor(Math.random() * 3) + 1,
          is_public: true,
          host_id: this.config.walletAddress,
        }
      ];
    } catch (error) {
      console.error('[LOCAL-CHAIN] Failed to get public rooms:', error);
      return [];
    }
  }

  // Get room state
  static async getRoomState(roomId: string): Promise<any> {
    try {
      console.log('[LOCAL-CHAIN] Getting room state:', { roomId });

      // Mock room state
      return {
        id: roomId,
        name: `Local Room ${roomId}`,
        host_id: this.config.walletAddress,
        participants: [
          {
            id: this.config.walletAddress,
            name: "Host (You)",
            joined_at: new Date().toISOString(),
            is_host: true
          }
        ],
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        value: Math.floor(Math.random() * 50) + 1
      };
    } catch (error) {
      console.error('[LOCAL-CHAIN] Failed to get room state:', error);
      return null;
    }
  }

  // Test local chain connectivity
  static async testConnection(): Promise<boolean> {
    try {
      this.logOperation('Testing local chain connectivity', {});
      console.log('[LOCAL-CHAIN] Local chain simulation ready');
      console.log('[LOCAL-CHAIN] Your chain ID:', this.config.chainId);
      console.log('[LOCAL-CHAIN] Your wallet:', this.config.walletAddress);
      return true;
    } catch (error) {
      console.error('[LOCAL-CHAIN] Connection test failed:', error);
      return false;
    }
  }
}