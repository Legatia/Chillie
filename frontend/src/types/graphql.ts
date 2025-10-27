// GraphQL types based on Linera smart contracts

export interface CreateRoomInput {
  room_name: string;
  is_public: boolean;
}

export interface CreateRoomResponse {
  room_id: string;
  chain_id: string;
  app_id: string;
}

export interface JoinRoomInput {
  participant_id: string;
  participant_name: string;
}

export interface Participant {
  id: string;
  name: string;
  joined_at: string;
  is_host: boolean;
}

export interface RoomState {
  id: string;
  name: string;
  host_id: string;
  participants: Participant[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface RoomInfo {
  room_id: string;
  chain_id: string;
  name: string;
  participant_count: number;
  is_public: boolean;
  host_id: string;
}

// GraphQL Queries and Mutations
export const ROOM_REGISTRY_QUERIES = {
  CREATE_ROOM: `
    mutation CreateRoom($input: CreateRoomInput!) {
      createRoom(input: $input) {
        room_id
        chain_id
        app_id
      }
    }
  `,
  GET_ROOMS: `
    query GetRooms {
      rooms {
        room_id
        chain_id
        name
        participant_count
        is_public
        host_id
      }
    }
  `,
  GET_ROOM: `
    query GetRoom($room_id: String!) {
      room(room_id: $room_id) {
        room_id
        chain_id
        name
        participant_count
        is_public
        host_id
      }
    }
  `
};

export const ROOM_MANAGER_QUERIES = {
  JOIN_ROOM: `
    mutation JoinRoom($input: JoinRoomInput!) {
      joinRoom(input: $input) {
        participant_id
        participant_name
        joined_at
      }
    }
  `,
  LEAVE_ROOM: `
    mutation LeaveRoom($participant_id: String!) {
      leaveRoom(participant_id: $participant_id) {
        success
      }
    }
  `,
  GET_ROOM_STATE: `
    query GetRoomState {
      roomState {
        id
        name
        host_id
        participants {
          id
          name
          joined_at
          is_host
        }
        is_public
        created_at
        updated_at
        is_active
      }
    }
  `,
  GET_PARTICIPANTS: `
    query GetParticipants {
      participants {
        id
        name
        joined_at
        is_host
      }
    }
  `
};

export const COMPETITION_QUERIES = {
  CREATE_COMPETITION: `
    mutation CreateCompetition($input: CreateCompetitionInput!) {
      createCompetition(input: $input) {
        competition_id
        name
        description
        voting_start_time
        voting_end_time
      }
    }
  `,
  VOTE: `
    mutation Vote($input: VoteInput!) {
      vote(input: $input) {
        success
        vote_count
      }
    }
  `,
  GET_COMPETITIONS: `
    query GetCompetitions {
      competitions {
        competition_id
        name
        description
        voting_start_time
        voting_end_time
        total_votes
        is_active
      }
    }
  `
};