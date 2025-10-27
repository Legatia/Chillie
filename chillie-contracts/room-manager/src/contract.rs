// Chillie Contract - Minimal Demo Version
// Based exactly on counter pattern for maximum compatibility

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use chillie::{ChillieAbi, ChillieOperation};
use linera_sdk::{
    linera_base_types::WithContractAbi,
    views::{RootView, View},
    Contract, ContractRuntime,
};

use self::state::ChillieRoomState;

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
    type InstantiationArgument = u64;
    type Parameters = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = ChillieRoomState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        ChillieContract { state, runtime }
    }

    async fn instantiate(&mut self, value: u64) {
        // Validate that the application parameters were configured correctly.
        self.runtime.application_parameters();

        self.state.value.set(value);
    }

    async fn execute_operation(&mut self, operation: ChillieOperation) -> u64 {
        let previous_value = self.state.value.get();
        match operation {
            ChillieOperation::CreateRoom | ChillieOperation::JoinRoom | ChillieOperation::LeaveRoom => {
                let new_value = previous_value + 1;
                self.state.value.set(new_value);
                new_value
            }
        }
    }

    async fn execute_message(&mut self, _message: ()) {
        panic!("Chillie application doesn't support any cross-chain messages");
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}