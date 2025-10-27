// CLI Backend Integration
// Communicates with Node.js backend that executes Linera CLI commands

export interface CLIBackendConfig {
  backendUrl: string;
}

export class CLIBackendIntegration {
  private static config: CLIBackendConfig = {
    backendUrl: 'http://localhost:3001'
  };

  // Make API call to backend server
  private static async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const url = `${this.config.backendUrl}/api${endpoint}`;
      console.log('[CLI-BACKEND] Making API call:', { url, options });

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[CLI-BACKEND] API success:', { endpoint, result });
      return result;
    } catch (error) {
      console.error('[CLI-BACKEND] API call failed:', { endpoint, error });
      throw error;
    }
  }

  // Test backend connection
  static async testConnection(): Promise<boolean> {
    try {
      const result = await this.apiCall('/test');
      console.log('[CLI-BACKEND] Backend connection successful:', result);
      return result.success;
    } catch (error) {
      console.error('[CLI-BACKEND] Backend connection failed:', error);
      return false;
    }
  }

  // Create room via CLI backend
  static async createRoom(roomName: string, isPublic: boolean): Promise<any> {
    try {
      console.log('[CLI-BACKEND] Creating room via CLI:', { roomName, isPublic });

      const result = await this.apiCall('/create-room', {
        method: 'POST',
        body: JSON.stringify({ roomName, isPublic }),
      });

      if (result.success) {
        console.log('[CLI-BACKEND] Room created via CLI:', result);
        return {
          room_id: result.room_id,
          chain_id: result.chain_id,
          app_id: result.app_id,
          transactionHash: result.transactionHash,
          blockHeight: result.blockHeight,
        };
      } else {
        throw new Error(result.error || 'Failed to create room via CLI');
      }
    } catch (error) {
      console.error('[CLI-BACKEND] Failed to create room via CLI:', error);
      throw error;
    }
  }

  // Join room via CLI backend
  static async joinRoom(roomId: string, participantName: string): Promise<any> {
    try {
      console.log('[CLI-BACKEND] Joining room via CLI:', { roomId, participantName });

      const result = await this.apiCall('/join-room', {
        method: 'POST',
        body: JSON.stringify({ roomId, participantName }),
      });

      if (result.success) {
        console.log('[CLI-BACKEND] Room joined via CLI:', result);
        return {
          participant_id: result.participant_id,
          participant_name: result.participant_name,
          joined_at: result.joined_at,
          new_value: result.new_value,
          transactionHash: result.transactionHash,
        };
      } else {
        throw new Error(result.error || 'Failed to join room via CLI');
      }
    } catch (error) {
      console.error('[CLI-BACKEND] Failed to join room via CLI:', error);
      throw error;
    }
  }

  // Get public rooms via CLI backend
  static async getPublicRooms(): Promise<any[]> {
    try {
      console.log('[CLI-BACKEND] Fetching public rooms via CLI');

      const result = await this.apiCall('/rooms');

      if (result.success) {
        console.log('[CLI-BACKEND] Public rooms fetched via CLI:', result.rooms);
        return result.rooms;
      } else {
        throw new Error(result.error || 'Failed to fetch rooms via CLI');
      }
    } catch (error) {
      console.error('[CLI-BACKEND] Failed to fetch rooms via CLI:', error);
      return [];
    }
  }

  // Get room state via CLI backend
  static async getRoomState(roomId: string): Promise<any> {
    try {
      console.log('[CLI-BACKEND] Getting room state via CLI:', { roomId });

      const result = await this.apiCall(`/room/${roomId}/state`);

      if (result.success) {
        console.log('[CLI-BACKEND] Room state fetched via CLI:', result.roomState);
        return result.roomState;
      } else {
        throw new Error(result.error || 'Failed to get room state via CLI');
      }
    } catch (error) {
      console.error('[CLI-BACKEND] Failed to get room state via CLI:', error);
      return null;
    }
  }

  // Get balance via CLI backend
  static async getBalance(): Promise<string> {
    try {
      console.log('[CLI-BACKEND] Getting balance via CLI');

      const result = await this.apiCall('/balance');

      if (result.success) {
        console.log('[CLI-BACKEND] Balance fetched via CLI:', result.balance);
        return result.balance;
      } else {
        throw new Error(result.error || 'Failed to get balance via CLI');
      }
    } catch (error) {
      console.error('[CLI-BACKEND] Failed to get balance via CLI:', error);
      return '0';
    }
  }

  // Query chain info via CLI backend
  static async queryChain(chainId: string): Promise<any> {
    try {
      console.log('[CLI-BACKEND] Querying chain via CLI:', { chainId });

      const result = await this.apiCall(`/chain/${chainId}`);

      if (result.success) {
        console.log('[CLI-BACKEND] Chain info fetched via CLI:', result.chainData);
        return result.chainData;
      } else {
        throw new Error(result.error || 'Failed to query chain via CLI');
      }
    } catch (error) {
      console.error('[CLI-BACKEND] Failed to query chain via CLI:', error);
      return null;
    }
  }
}