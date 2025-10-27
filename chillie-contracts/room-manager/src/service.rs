// Chillie Service - Minimal Demo Version
// Based exactly on counter service pattern

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use chillie::{ChillieRequest};
use linera_sdk::{linera_base_types::WithServiceAbi, views::View, Service, ServiceRuntime};

use self::state::ChillieRoomState;

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

    async fn handle_query(&self, request: ChillieRequest) -> u64 {
        match request {
            ChillieRequest::Query => *self.state.value.get(),
            ChillieRequest::CreateRoom => {
                let value = self.state.value.get();
                *value
            }
        }
    }
}