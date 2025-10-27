# Room Manager Smart Contract

A Linera blockchain application for managing decentralized video meeting rooms.

## Features

- Create public or private meeting rooms
- Track participants joining/leaving
- Toggle room visibility
- Room lifecycle management
- Cross-chain messaging for room events

## Structure

```
room-manager/
├── src/
│   ├── lib.rs       # ABI definitions and operations
│   ├── state.rs     # State management and Room data
│   ├── contract.rs  # Contract implementation (state mutations)
│   └── service.rs   # Service implementation (GraphQL queries)
├── Cargo.toml
└── README.md
```

## Operations

### CreateRoom
Create a new meeting room with a unique ID.

**Parameters:**
- `room_id: String` - Unique identifier for the room
- `room_name: String` - Human-readable name
- `is_public: bool` - Public visibility flag
- `host_id: String` - User ID of the room creator

**Returns:** `RoomCreated(String)` with the room ID

### JoinRoom
Join an existing active room.

**Parameters:**
- `room_id: String` - Room to join
- `participant_id: String` - User joining

**Returns:** `Success` or `Error`

### LeaveRoom
Leave a room. If last participant, room becomes inactive.

**Parameters:**
- `room_id: String` - Room to leave
- `participant_id: String` - User leaving

**Returns:** `Success` or `Error`

### UpdateRoomVisibility
Change room from public to private or vice versa.

**Parameters:**
- `room_id: String` - Room to update
- `is_public: bool` - New visibility

**Returns:** `Success` or `Error`

### CloseRoom
Deactivate a room.

**Parameters:**
- `room_id: String` - Room to close

**Returns:** `Success` or `Error`

## GraphQL API

### Queries

```graphql
# Get all public rooms
query {
  publicRooms {
    roomId
    roomName
    hostId
    isPublic
    participants
    createdAt
    isActive
  }
}

# Get specific room
query {
  room(roomId: "room-123") {
    roomId
    roomName
    participants
  }
}

# Get statistics
query {
  totalRoomsCount
  activeRoomsCount
}
```

### Mutations

```graphql
# Create room
mutation {
  createRoom(
    roomId: "room-123"
    roomName: "Team Meeting"
    isPublic: true
    hostId: "alice"
  )
}

# Join room
mutation {
  joinRoom(roomId: "room-123", participantId: "bob")
}

# Leave room
mutation {
  leaveRoom(roomId: "room-123", participantId: "bob")
}

# Update visibility
mutation {
  updateRoomVisibility(roomId: "room-123", isPublic: false)
}

# Close room
mutation {
  closeRoom(roomId: "room-123")
}
```

## State Schema

```rust
pub struct Room {
    pub room_id: String,
    pub room_name: String,
    pub host_id: String,
    pub is_public: bool,
    pub created_at: u64,
    pub participants: Vec<String>,
    pub is_active: bool,
}

pub struct RoomManagerState {
    pub rooms: MapView<String, Room>,
    pub total_rooms: RegisterView<u64>,
    pub active_rooms: RegisterView<u64>,
}
```

## Build

```bash
cargo build --release --target wasm32-unknown-unknown
```

## Deploy

```bash
linera publish-and-create \
  target/wasm32-unknown-unknown/release/room_manager_{contract,service}.wasm
```

## Test

```bash
cargo test
```

## Error Handling

- `RoomAlreadyExists` - Room ID already in use
- `RoomNotFound` - Room doesn't exist
- `Unauthorized` - Action requires host permission
- `RoomNotActive` - Room is closed
- `ParticipantAlreadyInRoom` - User already joined
- `ParticipantNotInRoom` - User not in room
