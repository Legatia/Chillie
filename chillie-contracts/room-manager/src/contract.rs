// Chillie Contract - Room Manager with Staking Tier System

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use chillie::{
    ChillieAbi, ChillieOperation, ChillieResponse, RoomId, RoomType, UserId, SupportedToken,
};
use linera_sdk::{
    linera_base_types::{WithContractAbi, Amount},
    views::{RootView, View},
    Contract, ContractRuntime,
};

use self::state::{ChillieRoomState, UserState, RoomState, NodeState};

pub struct ChillieContract {
    state: ChillieRoomState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(ChillieContract);

impl WithContractAbi for ChillieContract {
    type Abi = ChillieAbi;
}

impl Contract for ChillieContract {
    type Message = ();
    type InstantiationArgument = ();
    type Parameters = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = ChillieRoomState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        ChillieContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: ()) {
        // Validate that the application parameters were configured correctly.
        self.runtime.application_parameters();
        
        // Initialize with Native token by default
        self.state.staking_token.set(SupportedToken::Native);
    }

    async fn execute_operation(&mut self, operation: ChillieOperation) -> ChillieResponse {
        match operation {
            ChillieOperation::Stake { amount } => self.do_stake(amount).await,
            ChillieOperation::Unstake { amount } => self.do_unstake(amount).await,
            ChillieOperation::CreateRoom { room_id, room_type } => self.do_create_room(room_id, room_type).await,
            ChillieOperation::CloseRoom { room_id } => self.do_close_room(room_id).await,
            ChillieOperation::RegisterNode { address } => self.do_register_node(address).await,
            ChillieOperation::UnregisterNode => self.do_unregister_node().await,
        }
    }

    async fn execute_message(&mut self, _message: ()) {
        panic!("Chillie application doesn't support any cross-chain messages");
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl ChillieContract {
    async fn do_stake(&mut self, amount: Amount) -> ChillieResponse {
        let user_id = self.runtime.authenticated_signer()
            .expect("Authentication required")
            .to_string();

        let token_type = self.state.staking_token.get();
        
        // In a real implementation, we would transfer tokens here based on token_type
        match token_type {
            SupportedToken::Native => {
                // Native token transfer logic would go here
                // For now, we assume the transfer is handled by the system or a separate mechanism
            }
            SupportedToken::Custom(_token_id) => {
                // Custom token transfer logic (e.g., cross-application call)
            }
        }

        let mut user_state = self.state.users.get(&user_id).await
            .expect("Failed to get user state")
            .unwrap_or(UserState {
                stake: Amount::ZERO,
                active_rooms: Vec::new(),
            });

        user_state.stake = user_state.stake.saturating_add(amount);
        self.state.users.insert(&user_id, user_state.clone())
            .expect("Failed to update user state");

        ChillieResponse::Staked { new_balance: user_state.stake }
    }

    async fn do_unstake(&mut self, amount: Amount) -> ChillieResponse {
        let user_id = self.runtime.authenticated_signer()
            .expect("Authentication required")
            .to_string();

        let mut user_state = self.state.users.get(&user_id).await
            .expect("Failed to get user state")
            .expect("User not found");

        // Check if remaining stake is sufficient for active rooms
        let new_balance = user_state.stake.saturating_sub(amount);
        
        for room_id in &user_state.active_rooms {
            let room = self.state.rooms.get(room_id).await
                .expect("Failed to get room")
                .expect("Room not found");
            
            let required = room.room_type.required_tier().required_stake();
            if new_balance < required {
                panic!("Cannot unstake: Remaining balance insufficient for active room {}", room_id);
            }
        }

        user_state.stake = new_balance;
        self.state.users.insert(&user_id, user_state.clone())
            .expect("Failed to update user state");

        // In a real implementation, we would transfer tokens back to the user here

        ChillieResponse::Unstaked { new_balance }
    }

    async fn do_create_room(&mut self, room_id: RoomId, room_type: RoomType) -> ChillieResponse {
        let user_id = self.runtime.authenticated_signer()
            .expect("Authentication required")
            .to_string();

        // Check if room already exists
        if self.state.rooms.get(&room_id).await.expect("Failed to check room").is_some() {
            panic!("Room already exists");
        }

        let mut user_state = self.state.users.get(&user_id).await
            .expect("Failed to get user state")
            .unwrap_or(UserState {
                stake: Amount::ZERO,
                active_rooms: Vec::new(),
            });

        // Check stake requirement
        let required_stake = room_type.required_tier().required_stake();
        if user_state.stake < required_stake {
            panic!("Insufficient stake for this room type. Required: {:?}", required_stake);
        }

        // Create room
        let room_state = RoomState {
            host: user_id.clone(),
            room_type,
            participants: Vec::new(),
            is_active: true,
        };

        self.state.rooms.insert(&room_id, room_state)
            .expect("Failed to create room");

        // Update user active rooms
        user_state.active_rooms.push(room_id.clone());
        self.state.users.insert(&user_id, user_state)
            .expect("Failed to update user state");

        ChillieResponse::RoomCreated { room_id }
    }

    async fn do_close_room(&mut self, room_id: RoomId) -> ChillieResponse {
        let user_id = self.runtime.authenticated_signer()
            .expect("Authentication required")
            .to_string();

        let mut room = self.state.rooms.get(&room_id).await
            .expect("Failed to get room")
            .expect("Room not found");

        if room.host != user_id {
            panic!("Only host can close the room");
        }

        room.is_active = false;
        self.state.rooms.insert(&room_id, room)
            .expect("Failed to update room");

        // Remove from user active rooms
        let mut user_state = self.state.users.get(&user_id).await
            .expect("Failed to get user state")
            .expect("User not found");

        user_state.active_rooms.retain(|id| id != &room_id);
        self.state.users.insert(&user_id, user_state)
            .expect("Failed to update user state");

        ChillieResponse::RoomClosed { room_id }
    }

    async fn do_register_node(&mut self, address: String) -> ChillieResponse {
        let user_id = self.runtime.authenticated_signer()
            .expect("Authentication required")
            .to_string();

        let user_state = self.state.users.get(&user_id).await
            .expect("Failed to get user state")
            .unwrap_or(UserState {
                stake: Amount::ZERO,
                active_rooms: Vec::new(),
            });

        // Check stake requirement for RelayNode
        let required_stake = chillie::StakingTier::RelayNode.required_stake();
        if user_state.stake < required_stake {
            panic!("Insufficient stake to register as a node. Required: {:?}", required_stake);
        }

        let node_state = NodeState {
            address: address.clone(),
            last_heartbeat: self.runtime.system_time().micros() as u64,
            reputation: 100, // Initial reputation
        };

        self.state.nodes.insert(&user_id, node_state)
            .expect("Failed to register node");

        ChillieResponse::NodeRegistered { address }
    }

    async fn do_unregister_node(&mut self) -> ChillieResponse {
        let user_id = self.runtime.authenticated_signer()
            .expect("Authentication required")
            .to_string();

        if self.state.nodes.get(&user_id).await.expect("Failed to get node").is_none() {
            panic!("Node not registered");
        }

        self.state.nodes.remove(&user_id)
            .expect("Failed to unregister node");

        ChillieResponse::NodeUnregistered
    }
}