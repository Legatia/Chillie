// Chillie - Minimal Demo Version for Decentralized Video Meeting Platform
// Based exactly on counter-no-graphql example

use linera_sdk::linera_base_types::{ContractAbi, ServiceAbi};
use serde::{Deserialize, Serialize};

pub struct ChillieAbi;

impl ContractAbi for ChillieAbi {
    type Operation = ChillieOperation;
    type Response = u64;
}

impl ServiceAbi for ChillieAbi {
    type Query = ChillieRequest;
    type QueryResponse = u64;
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ChillieRequest {
    Query,
    CreateRoom,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ChillieOperation {
    CreateRoom,
    JoinRoom,
    LeaveRoom,
}