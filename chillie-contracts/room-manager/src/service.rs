// Chillie Service - Room Manager with Staking Tier System

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use chillie::{ChillieRequest, ChillieQueryResponse, UserView, RoomView};
use linera_sdk::{linera_base_types::WithServiceAbi, views::View, Service, ServiceRuntime};

use self::state::{ChillieRoomState, UserState, RoomState};

pub struct ChillieService {
    state: ChillieRoomState,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(ChillieService);

impl WithServiceAbi for ChillieService {
    type Abi = chillie::ChillieAbi;
}

impl Service for ChillieService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = ChillieRoomState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        ChillieService {
            state,
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: ChillieRequest) -> ChillieQueryResponse {
        match request {
            ChillieRequest::GetUserInfo { user_id } => {
                let user_state = self.state.users.get(&user_id).await
                    .expect("Failed to get user state");
                
                ChillieQueryResponse::UserInfo(user_state.map(|u| UserView {
                    stake: u.stake,
                    active_rooms: u.active_rooms,
                }))
            }
            ChillieRequest::GetRoomInfo { room_id } => {
                let room_state = self.state.rooms.get(&room_id).await
                    .expect("Failed to get room state");
                
                ChillieQueryResponse::RoomInfo(room_state.map(|r| RoomView {
                    host: r.host,
                    room_type: r.room_type,
                    is_active: r.is_active,
                }))
            }
        }
    }
}