// Mock blockchain service for demonstration purposes
// In production, this would connect to actual Linera blockchain

export interface MockRoom {
  room_id: string;
  chain_id: string;
  app_id: string;
  name: string;
  participant_count: number;
  is_public: boolean;
  host_id: string;
}

export interface MockRoomState {
  id: string;
  name: string;
  host_id: string;
  participants: Array<{
    id: string;
    name: string;
    joined_at: string;
    is_host: boolean;
  }>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const mockRooms: MockRoom[] = [
  {
    room_id: "demo-room-1",
    chain_id: "0x1234567890abcdef",
    app_id: "demo-room-1",
    name: "Demo Room 1",
    participant_count: 3,
    is_public: true,
    host_id: "0xabcdef1234567890",
  },
  {
    room_id: "demo-room-2",
    chain_id: "0xabcdef1234567890",
    app_id: "demo-room-2",
    name: "Blockchain Meetup",
    participant_count: 5,
    is_public: true,
    host_id: "0x1234567890abcdef",
  },
];

let mockRoomStates: Record<string, MockRoomState> = {
  "demo-room-1": {
    id: "demo-room-1",
    name: "Demo Room 1",
    host_id: "0xabcdef1234567890",
    participants: [
      {
        id: "host-1",
        name: "Host (Demo Room 1)",
        joined_at: new Date().toISOString(),
        is_host: true,
      },
    ],
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
  },
  "demo-room-2": {
    id: "demo-room-2",
    name: "Blockchain Meetup",
    host_id: "0x1234567890abcdef",
    participants: [
      {
        id: "host-2",
        name: "Host (Blockchain Meetup)",
        joined_at: new Date().toISOString(),
        is_host: true,
      },
    ],
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
  },
};

export class MockBlockchainService {
  static async createRoom(roomName: string, isPublic: boolean, hostAddress: string) {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const roomId = `room-${Date.now()}`;
    const chainId = `0x${Math.random().toString(16).substr(2, 40)}`;

    const newRoom: MockRoom = {
      room_id: roomId,
      chain_id: chainId,
      app_id: roomId,
      name: roomName,
      participant_count: 1,
      is_public: isPublic,
      host_id: hostAddress,
    };

    const newRoomState: MockRoomState = {
      id: roomId,
      name: roomName,
      host_id: hostAddress,
      participants: [
        {
          id: hostAddress,
          name: `Host (${roomName})`,
          joined_at: new Date().toISOString(),
          is_host: true,
        },
      ],
      is_public: isPublic,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };

    mockRooms.push(newRoom);
    mockRoomStates[roomId] = newRoomState;

    return {
      room_id: roomId,
      chain_id: chainId,
      app_id: roomId,
    };
  }

  static async joinRoom(roomId: string, participantId: string, participantName: string) {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let roomState = mockRoomStates[roomId];

    // If room not found, try to find it in the public rooms list and create a default state
    if (!roomState) {
      const publicRoom = mockRooms.find(room => room.room_id === roomId);
      if (publicRoom) {
        // Create a default room state for public rooms
        roomState = {
          id: publicRoom.room_id,
          name: publicRoom.name,
          host_id: publicRoom.host_id,
          participants: [
            {
              id: publicRoom.host_id,
              name: `Host (${publicRoom.name})`,
              joined_at: new Date().toISOString(),
              is_host: true,
            },
          ],
          is_public: publicRoom.is_public,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        };
        mockRoomStates[roomId] = roomState;
      } else {
        // Create a temporary room for demo purposes
        roomState = {
          id: roomId,
          name: `Room ${roomId}`,
          host_id: "temp-host",
          participants: [],
          is_public: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        };
        mockRoomStates[roomId] = roomState;
      }
    }

    // Check if participant already exists
    const existingParticipant = roomState.participants.find(p => p.id === participantId);
    if (existingParticipant) {
      throw new Error("Participant already in room");
    }

    const newParticipant = {
      id: participantId,
      name: participantName,
      joined_at: new Date().toISOString(),
      is_host: false,
    };

    roomState.participants.push(newParticipant);
    roomState.updated_at = new Date().toISOString();

    // Update participant count in rooms list
    const room = mockRooms.find(r => r.room_id === roomId);
    if (room) {
      room.participant_count = roomState.participants.length;
    }

    return {
      participant_id: participantId,
      participant_name: participantName,
      joined_at: newParticipant.joined_at,
    };
  }

  static async getRooms(): Promise<MockRoom[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRooms.filter(room => room.is_public);
  }

  static async getRoomState(roomId: string): Promise<MockRoomState | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let roomState = mockRoomStates[roomId];

    // If room not found, try to create a default state
    if (!roomState) {
      const publicRoom = mockRooms.find(room => room.room_id === roomId);
      if (publicRoom) {
        // Create a default room state for public rooms
        roomState = {
          id: publicRoom.room_id,
          name: publicRoom.name,
          host_id: publicRoom.host_id,
          participants: [
            {
              id: publicRoom.host_id,
              name: `Host (${publicRoom.name})`,
              joined_at: new Date().toISOString(),
              is_host: true,
            },
          ],
          is_public: publicRoom.is_public,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        };
        mockRoomStates[roomId] = roomState;
      }
    }

    return roomState || null;
  }

  static async getParticipants(roomId: string) {
    let roomState = mockRoomStates[roomId];

    // If room not found, try to create a default state first
    if (!roomState) {
      const publicRoom = mockRooms.find(room => room.room_id === roomId);
      if (publicRoom) {
        // Create a default room state for public rooms
        roomState = {
          id: publicRoom.room_id,
          name: publicRoom.name,
          host_id: publicRoom.host_id,
          participants: [
            {
              id: publicRoom.host_id,
              name: `Host (${publicRoom.name})`,
              joined_at: new Date().toISOString(),
              is_host: true,
            },
          ],
          is_public: publicRoom.is_public,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        };
        mockRoomStates[roomId] = roomState;
      } else {
        // Return empty participants list for unknown rooms
        return [];
      }
    }

    return roomState.participants;
  }

  static async castVote(competitionId: string, optionId: string, voterAddress: string) {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock voting implementation
    return {
      success: true,
      vote_count: Math.floor(Math.random() * 100) + 1,
    };
  }
}