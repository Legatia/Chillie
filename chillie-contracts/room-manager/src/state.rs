// Chillie - Minimal Demo Version State
// Based exactly on counter state pattern

use linera_sdk::views::{linera_views, RegisterView, RootView, ViewStorageContext};

/// The application state for a minimal Chillie room
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct ChillieRoomState {
    /// Simple counter for demo
    pub value: RegisterView<u64>,
}