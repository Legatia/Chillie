import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-12345',
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ roomId: 'test-room-123' }),
    useLocation: () => ({
      state: {
        chainId: 'test-chain-123',
        isHost: false,
        roomName: 'Test Room',
      },
    }),
  };
});

// Mock hooks
vi.mock('@/hooks/usePeerConnection', () => ({
  usePeerConnection: () => ({
    localStream: null,
    remoteStreams: [],
    messages: [],
    participants: [],
    localParticipantId: 'test-participant-123',
    localParticipantName: 'Test User',
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    toggleAudio: vi.fn(),
    toggleVideo: vi.fn(),
    toggleScreenShare: vi.fn(),
    sendMessage: vi.fn(),
    leaveRoom: vi.fn(),
  }),
}));

vi.mock('@/hooks/useBlockchain', () => ({
  useJoinRoom: () => ({
    joinRoom: vi.fn(),
  }),
  useRoomState: () => ({
    roomState: null,
    isLoading: false,
  }),
  useParticipants: () => ({
    participants: [],
    isLoading: false,
  }),
  useRoomAuthorization: () => ({
    isHost: false,
    canManageRoom: false,
    canVote: false,
  }),
  useVote: () => ({
    castVote: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));