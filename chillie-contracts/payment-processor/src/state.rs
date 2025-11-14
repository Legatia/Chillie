// Payment Processor State - Linera Views Implementation
// Uses Linera's view system for persistent storage

use linera_sdk::views::{
    linera_views, MapView, RegisterView, RootView, ViewStorageContext,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap as StdHashMap;

use super::*;

/// The application state for payment processor
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct PaymentProcessorState {
    /// Room-specific payment pools (using MapView for efficiency)
    pub rooms: MapView<RoomId, RoomPaymentPool>,
    /// User balances and pending settlements (using MapView for efficiency)
    pub users: MapView<UserId, UserPaymentState>,
    /// Global payment statistics
    pub stats: RegisterView<PaymentStats>,
}


impl PaymentProcessorState {
    /// Get room statistics (optimized with MapView)
    pub async fn get_room_stats(&self, room_id: &RoomId) -> Result<Option<RoomPaymentPool>, linera_sdk::views::ViewError> {
        self.rooms.get(room_id).await
    }

    /// Get user state (optimized with MapView)
    pub async fn get_user_state(&self, user_id: &UserId) -> Result<Option<UserPaymentState>, linera_sdk::views::ViewError> {
        self.users.get(user_id).await
    }

    /// Get global statistics
    pub fn get_global_stats(&self) -> &PaymentStats {
        self.stats.get()
    }

    /// Insert or update room payment pool (optimized with MapView)
    pub async fn insert_room(&mut self, room_id: RoomId, pool: RoomPaymentPool) -> Result<(), linera_sdk::views::ViewError> {
        self.rooms.insert(&room_id, pool).await
    }

    /// Insert or update user state (optimized with MapView)
    pub async fn insert_user(&mut self, user_id: UserId, state: UserPaymentState) -> Result<(), linera_sdk::views::ViewError> {
        self.users.insert(&user_id, state).await
    }

    /// Update global statistics
    pub fn update_stats(&mut self, stats: PaymentStats) {
        self.stats.set(stats);
    }

    /// Check if room exists
    pub async fn has_room(&self, room_id: &RoomId) -> Result<bool, linera_sdk::views::ViewError> {
        Ok(self.rooms.get(room_id).await?.is_some())
    }

    /// Check if user exists
    pub async fn has_user(&self, user_id: &UserId) -> Result<bool, linera_sdk::views::ViewError> {
        Ok(self.users.get(user_id).await?.is_some())
    }

    /// Remove room
    pub async fn remove_room(&mut self, room_id: &RoomId) -> Result<(), linera_sdk::views::ViewError> {
        self.rooms.remove(room_id).await
    }

    /// Remove user
    pub async fn remove_user(&mut self, user_id: &UserId) -> Result<(), linera_sdk::views::ViewError> {
        self.users.remove(user_id).await
    }
}