import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LineraBlockchainService } from '../lib/linera-blockchain';

interface MetaMaskInpageProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, handler: (...args: any[]) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}
import {
  CreateRoomInput,
  JoinRoomInput,
  RoomState,
  RoomInfo,
  Participant
} from '../types/graphql';

export interface WalletConnection {
  isConnected: boolean;
  address?: string;
  chainId?: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletConnection = (): WalletConnection => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>();
  const [chainId, setChainId] = useState<string>('9b030590d16320a057e68fc39becafff4c5c46ff239ef27031a959cf45d5b48b');

  const connect = async () => {
    try {
      // Connect to Linera CLI wallet via backend
      const response = await fetch('http://localhost:3001/api/balance');

      if (!response.ok) {
        throw new Error('Failed to connect to Linera CLI wallet. Please ensure backend server is running.');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Linera CLI wallet not available. Please check wallet configuration.');
      }

      // Use the known Linera CLI wallet address
      const cliAddress = '0x19dbc4dba46c4919710591d1187090dab04d9a774e70179d8afdd8f9924bb3d8';
      const lineraChainId = '9b030590d16320a057e68fc39becafff4c5c46ff239ef27031a959cf45d5b48b';

      setAddress(cliAddress);
      setChainId(lineraChainId);
      setIsConnected(true);

      // Save to localStorage for persistence
      localStorage.setItem('chillie_wallet_address', cliAddress);
      localStorage.setItem('chillie_wallet_chain_id', lineraChainId);

      console.log('Connected to Linera CLI Wallet:', {
        address: cliAddress,
        chainId: lineraChainId,
        balance: data.balance,
      });
    } catch (error) {
      console.error('Failed to connect CLI wallet:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to connect')) {
          throw new Error('Backend server is not running. Please start the backend server first.');
        } else if (error.message.includes('wallet not available')) {
          throw new Error('Linera CLI wallet not configured. Please set up your wallet first.');
        }
      }
      throw new Error('Failed to connect to Linera CLI wallet');
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(undefined);
    setChainId('9b030590d16320a057e68fc39becafff4c5c46ff239ef27031a959cf45d5b48b');
    localStorage.removeItem('chillie_wallet_address');
    localStorage.removeItem('chillie_wallet_chain_id');
  };

  useEffect(() => {
    // Check for existing wallet connection on mount
    const savedAddress = localStorage.getItem('chillie_wallet_address');
    const savedChainId = localStorage.getItem('chillie_wallet_chain_id');

    if (savedAddress && savedChainId) {
      setAddress(savedAddress);
      setChainId(savedChainId);
      setIsConnected(true);
    } else {
      // Auto-connect to CLI wallet on mount
      connect().catch(() => {
        console.log('Auto-connect failed, user needs to connect manually');
      });
    }
  }, []);

  return {
    isConnected,
    address,
    chainId,
    connect,
    disconnect,
  };
};

export const useCreateRoom = () => {
  const { address } = useWalletConnection();

  const createRoom = async (input: CreateRoomInput) => {
    if (!address) {
      throw new Error('Wallet must be connected to create a room');
    }

    try {
      const result = await LineraBlockchainService.createRoom(
        input.room_name,
        input.is_public,
        address
      );

      return result;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  };

  return { createRoom };
};

export const useJoinRoom = () => {
  const joinRoom = async (input: JoinRoomInput) => {
    try {
      // Get room ID from current URL
      const roomId = window.location.pathname.split('/').pop();
      const result = await LineraBlockchainService.joinRoom(roomId, input.participant_id, input.participant_name);
      return result;
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  };

  return { joinRoom };
};

export const useRoomState = (chainId?: string) => {
  const [roomState, setRoomState] = useState<RoomState | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoomState = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const roomId = window.location.pathname.split('/').pop();
      const state = await LineraBlockchainService.getRoomState(roomId);

      if (state) {
        setRoomState(state as RoomState);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch room state'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch room state regardless of chainId
    // This allows participants to see room state even without blockchain connection
    fetchRoomState();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchRoomState, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    roomState,
    isLoading,
    error,
    refetch: fetchRoomState,
  };
};

export const usePublicRooms = () => {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRooms = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rooms = await LineraBlockchainService.getRooms();
      setRooms(rooms as RoomInfo[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rooms'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    isLoading,
    error,
    refetch: fetchRooms,
  };
};

export const useParticipants = (chainId?: string) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchParticipants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const roomId = window.location.pathname.split('/').pop();
      const participants = await LineraBlockchainService.getParticipants(roomId);
      setParticipants(participants as Participant[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch participants'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch participants regardless of chainId
    // This allows participants to see room state even without blockchain connection
    fetchParticipants();
    // Poll every 3 seconds for participant updates
    const interval = setInterval(fetchParticipants, 3000);
    return () => clearInterval(interval);
  }, []);

  return {
    participants,
    isLoading,
    error,
    refetch: fetchParticipants,
  };
};

// Authorization hook for room management
export const useRoomAuthorization = (chainId?: string, participantId?: string) => {
  const { roomState, isLoading: isLoadingRoomState } = useRoomState(chainId);
  const { address } = useWalletConnection();

  const isHost = roomState?.host_id === participantId || roomState?.host_id === address;
  const canManageRoom = isHost;
  const canVote = true; // All participants can vote
  const canCloseRoom = isHost;

  return {
    isHost,
    canManageRoom,
    canVote,
    canCloseRoom,
    isLoading: isLoadingRoomState,
  };
};

// Competition voting hooks
export const useVote = (chainId?: string) => {
  const { address } = useWalletConnection();

  const castVote = async (competitionId: string, optionId: string) => {
    try {
      const result = await LineraBlockchainService.castVote(
        competitionId,
        optionId,
        address || 'anonymous'
      );

      return result;
    } catch (error) {
      console.error('Failed to cast vote:', error);
      throw error;
    }
  };

  return { castVote };
};