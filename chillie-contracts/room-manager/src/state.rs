// Chillie - Room Manager State

use chillie::{RoomId, UserId, RoomType, SupportedToken};
use linera_sdk::{
    linera_base_types::Amount,
    views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext},
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserState {
    pub stake: Amount,
    pub active_rooms: Vec<RoomId>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RoomState {
    pub host: UserId,
    pub room_type: RoomType,
    pub participants: Vec<UserId>,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NodeState {
    pub address: String,
    pub last_heartbeat: u64,
    pub reputation: u64,
}

/// The application state for the Chillie Room Manager
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct ChillieRoomState {
    /// Map of user states (staking info)
    pub users: MapView<UserId, UserState>,
    /// Map of room states
    pub rooms: MapView<RoomId, RoomState>,
    /// Map of registered relay nodes
    pub nodes: MapView<UserId, NodeState>,
    /// Configured staking token
    pub staking_token: RegisterView<SupportedToken>,
}