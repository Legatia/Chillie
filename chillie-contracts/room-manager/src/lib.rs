// Chillie - Decentralized Video Meeting Platform
// Room Manager with Staking Tier System

use linera_sdk::linera_base_types::{ContractAbi, ServiceAbi, Amount};
use serde::{Deserialize, Serialize};

pub struct ChillieAbi;

impl ContractAbi for ChillieAbi {
    type Operation = ChillieOperation;
    type Response = ChillieResponse;
}

impl ServiceAbi for ChillieAbi {
    type Query = ChillieRequest;
    type QueryResponse = ChillieQueryResponse;
}

/// Unique identifier for a room
pub type RoomId = String;
/// User identifier (owner/host)
pub type UserId = String;
/// Token identifier (ApplicationId)
pub type TokenId = linera_sdk::linera_base_types::ApplicationId;
/// Node network address (e.g., IP:Port or Domain)
pub type NodeAddress = String;

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum SupportedToken {
    #[default]
    Native,
    Custom(TokenId),
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
pub enum StakingTier {
    Basic,      // 0 stake
    Podcast,    // 100 stake
    SoloStream, // 500 stake
    MultiStream,// 2000 stake
    RelayNode,  // 5000 stake
}

impl StakingTier {
    pub fn required_stake(&self) -> Amount {
        match self {
            StakingTier::Basic => Amount::from_tokens(0),
            StakingTier::Podcast => Amount::from_tokens(100),
            StakingTier::SoloStream => Amount::from_tokens(500),
            StakingTier::MultiStream => Amount::from_tokens(2000),
            StakingTier::RelayNode => Amount::from_tokens(5000),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
pub enum RoomType {
    PrivateMeeting, // Requires Basic
    Podcast,        // Requires Podcast
    SoloStream,     // Requires SoloStream
    MultiStream,    // Requires MultiStream
}

impl RoomType {
    pub fn required_tier(&self) -> StakingTier {
        match self {
            RoomType::PrivateMeeting => StakingTier::Basic,
            RoomType::Podcast => StakingTier::Podcast,
            RoomType::SoloStream => StakingTier::SoloStream,
            RoomType::MultiStream => StakingTier::MultiStream,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ChillieOperation {
    Stake { amount: Amount },
    Unstake { amount: Amount },
    CreateRoom { room_id: RoomId, room_type: RoomType },
    CloseRoom { room_id: RoomId },
    RegisterNode { address: NodeAddress },
    UnregisterNode,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ChillieResponse {
    Ok,
    Staked { new_balance: Amount },
    Unstaked { new_balance: Amount },
    RoomCreated { room_id: RoomId },
    RoomClosed { room_id: RoomId },
    NodeRegistered { address: NodeAddress },
    NodeUnregistered,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ChillieRequest {
    GetUserInfo { user_id: UserId },
    GetRoomInfo { room_id: RoomId },
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ChillieQueryResponse {
    UserInfo(Option<UserView>),
    RoomInfo(Option<RoomView>),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserView {
    pub stake: Amount,
    pub active_rooms: Vec<RoomId>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RoomView {
    pub host: UserId,
    pub room_type: RoomType,
    pub is_active: bool,
}