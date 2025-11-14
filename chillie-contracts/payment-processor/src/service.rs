// Payment Processor Service - Linera SDK Implementation
// Provides query interface for payment operations

#![cfg_attr(target_arch = "wasm32", no_main)]

use super::state;

use std::sync::Arc;

use crate::{
    PaymentProcessorAbi, PaymentQuery, PaymentQueryResponse, PaymentError,
    RoomId, UserId, UserPaymentSummary, RoomRevenueBreakdown,
};
use linera_sdk::{
    linera_base_types::WithServiceAbi,
    views::View,
    Service, ServiceRuntime,
};

use self::state::PaymentProcessorState;
use std::collections::HashMap;

pub struct PaymentProcessorService {
    state: PaymentProcessorState,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(PaymentProcessorService);

impl WithServiceAbi for PaymentProcessorService {
    type Abi = PaymentProcessorAbi;
}

impl Service for PaymentProcessorService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = PaymentProcessorState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load payment processor state");
        PaymentProcessorService {
            state,
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, query: PaymentQuery) -> PaymentQueryResponse {
        match query {
            PaymentQuery::GetRoomStats { room_id } => {
                match self.query_room_stats(&room_id) {
                    Ok(room) => PaymentQueryResponse::RoomStats(Some(room.clone())),
                    Err(e) => PaymentQueryResponse::Error(e),
                }
            }
            PaymentQuery::GetUserState { user_id } => {
                match self.query_user_state(&user_id) {
                    Ok(user) => PaymentQueryResponse::UserState(Some(user.clone())),
                    Err(e) => PaymentQueryResponse::Error(e),
                }
            }
            PaymentQuery::GetGlobalStats => {
                match self.query_global_stats() {
                    Ok(stats) => PaymentQueryResponse::GlobalStats(stats.clone()),
                    Err(e) => PaymentQueryResponse::Error(e),
                }
            }
            PaymentQuery::GetPendingTips { room_id } => {
                match self.query_pending_tips(&room_id) {
                    Ok(tips) => PaymentQueryResponse::PendingTips(tips.clone()),
                    Err(e) => PaymentQueryResponse::Error(e),
                }
            }
            PaymentQuery::GetPendingAccessFees { room_id } => {
                match self.query_pending_access_fees(&room_id) {
                    Ok(fees) => PaymentQueryResponse::PendingAccessFees(fees.clone()),
                    Err(e) => PaymentQueryResponse::Error(e),
                }
            }
            PaymentQuery::GetUserPendingTransactions { user_id } => {
                match self.query_user_pending_transactions(&user_id) {
                    Ok(transactions) => PaymentQueryResponse::UserPendingTransactions(transactions.clone()),
                    Err(e) => PaymentQueryResponse::Error(e),
                }
            }
            PaymentQuery::GetQualityTierPricing { room_id } => {
                match self.get_quality_tier_pricing(&room_id) {
                    Ok(pricing) => PaymentQueryResponse::QualityTierPricing(pricing),
                    Err(e) => PaymentQueryResponse::Error(e),
                }
            }
            PaymentQuery::GetUserPaymentSummary { user_id, room_id } => {
                match self.get_user_payment_summary(&user_id, &room_id) {
                    Ok(summary) => PaymentQueryResponse::UserPaymentSummary(summary),
                    Err(e) => PaymentQueryResponse::Error(e),
                }
            }
            PaymentQuery::GetRoomRevenueBreakdown { room_id } => {
                match self.get_room_revenue_breakdown(&room_id) {
                    Ok(breakdown) => PaymentQueryResponse::RoomRevenueBreakdown(breakdown),
                    Err(e) => PaymentQueryResponse::Error(e),
                }
            }
        }
    }
}

impl PaymentProcessorService {
    /// Query room payment statistics
    pub fn query_room_stats(
        &self,
        room_id: &RoomId,
    ) -> Result<&crate::RoomPaymentPool, PaymentError> {
        self.state.get_room_stats(room_id)
            .ok_or(PaymentError::RoomNotFound)
    }

    /// Query user payment state
    pub fn query_user_state(
        &self,
        user_id: &UserId,
    ) -> Result<&crate::UserPaymentState, PaymentError> {
        self.state.get_user_state(user_id)
            .ok_or(PaymentError::UserNotFound)
    }

    /// Query global payment statistics
    pub fn query_global_stats(&self) -> Result<&crate::PaymentStats, PaymentError> {
        Ok(self.state.get_global_stats())
    }

    /// Query pending tips for a room
    pub fn query_pending_tips(
        &self,
        room_id: &RoomId,
    ) -> Result<&Vec<crate::PendingTip>, PaymentError> {
        let room = self.state.get_room_stats(room_id)
            .ok_or(PaymentError::RoomNotFound)?;
        Ok(&room.pending_tips)
    }

    /// Query pending access fees for a room
    pub fn query_pending_access_fees(
        &self,
        room_id: &RoomId,
    ) -> Result<&Vec<crate::PendingAccessFee>, PaymentError> {
        let room = self.state.get_room_stats(room_id)
            .ok_or(PaymentError::RoomNotFound)?;
        Ok(&room.pending_access_fees)
    }

    /// Query user's pending transactions
    pub fn query_user_pending_transactions(
        &self,
        user_id: &UserId,
    ) -> Result<&Vec<crate::PendingTransaction>, PaymentError> {
        let user_state = self.state.get_user_state(user_id)
            .ok_or(PaymentError::UserNotFound)?;
        Ok(&user_state.pending_transactions)
    }

    /// Calculate recommended tip amount based on user history
    pub fn calculate_recommended_tip(
        &self,
        user_id: &UserId,
        room_id: &RoomId,
    ) -> Result<u64, PaymentError> {
        let user_state = self.state.get_user_state(user_id)
            .ok_or(PaymentError::UserNotFound)?;

        let room_stats = self.state.get_room_stats(room_id)
            .ok_or(PaymentError::RoomNotFound)?;

        // Calculate recommendation based on user default and room minimum
        let base_recommendation = user_state.preferences.default_tip;
        let min_tip = room_stats.settings.min_tip;

        Ok(base_recommendation.max(min_tip))
    }

    /// Get quality tier pricing for a room
    pub fn get_quality_tier_pricing(
        &self,
        room_id: &RoomId,
    ) -> Result<HashMap<crate::StreamQuality, u64>, PaymentError> {
        let room_stats = self.state.get_room_stats(room_id)
            .ok_or(PaymentError::RoomNotFound)?;

        Ok(room_stats.settings.quality_tiers.clone())
    }

    /// Check if user can afford a specific quality tier
    pub fn can_afford_quality_tier(
        &self,
        user_id: &UserId,
        room_id: &RoomId,
        quality_tier: &crate::StreamQuality,
    ) -> Result<bool, PaymentError> {
        let user_state = self.state.get_user_state(user_id)
            .ok_or(PaymentError::UserNotFound)?;

        let room_stats = self.state.get_room_stats(room_id)
            .ok_or(PaymentError::RoomNotFound)?;

        let cost = room_stats.settings.quality_tiers.get(quality_tier)
            .ok_or(PaymentError::InvalidQualityTier)?;

        Ok(user_state.balance >= *cost as u128)
    }

    /// Get payment summary for a user in a room
    pub fn get_user_payment_summary(
        &self,
        user_id: &UserId,
        room_id: &RoomId,
    ) -> Result<UserPaymentSummary, PaymentError> {
        let user_state = self.state.get_user_state(user_id)
            .ok_or(PaymentError::UserNotFound)?;

        let room_stats = self.state.get_room_stats(room_id)
            .ok_or(PaymentError::RoomNotFound)?;

        // Count user's pending transactions in this room
        let pending_tips_count = room_stats.pending_tips.iter()
            .filter(|tip| tip.from == *user_id)
            .count();

        let pending_access_fees_count = room_stats.pending_access_fees.iter()
            .filter(|fee| fee.user_id == *user_id)
            .count();

        Ok(UserPaymentSummary {
            user_id: user_id.clone(),
            room_id: room_id.clone(),
            balance: user_state.balance,
            pending_transactions: user_state.pending_transactions.len(),
            pending_tips: pending_tips_count,
            pending_access_fees: pending_access_fees_count,
            can_afford_tips: user_state.balance > room_stats.settings.min_tip as u128,
            recommended_tip: user_state.preferences.default_tip,
            auto_settle_threshold: user_state.preferences.auto_settle_threshold,
        })
    }

    /// Check if user should auto-settle transactions
    pub fn should_auto_settle(&self, user_id: &UserId) -> Result<bool, PaymentError> {
        let user_state = self.state.get_user_state(user_id)
            .ok_or(PaymentError::UserNotFound)?;

        let pending_count = user_state.pending_transactions.len();
        let threshold_reached = user_state.balance >= user_state.preferences.auto_settle_threshold;
        let max_pending_reached = pending_count >= user_state.preferences.max_pending;

        Ok(threshold_reached || max_pending_reached)
    }

    /// Get room revenue breakdown
    pub fn get_room_revenue_breakdown(
        &self,
        room_id: &RoomId,
    ) -> Result<RoomRevenueBreakdown, PaymentError> {
        let room_stats = self.state.get_room_stats(room_id)
            .ok_or(PaymentError::RoomNotFound)?;

        let total_pending_tips: u128 = room_stats.pending_tips.iter()
            .map(|tip| tip.amount as u128)
            .sum();

        let total_pending_access_fees: u128 = room_stats.pending_access_fees.iter()
            .map(|fee| fee.amount as u128)
            .sum();

        Ok(RoomRevenueBreakdown {
            room_id: room_id.clone(),
            host: room_stats.host.clone(),
            total_tips: room_stats.total_tips,
            total_access_fees: room_stats.total_access_fees,
            pending_tips: total_pending_tips,
            pending_access_fees: total_pending_access_fees,
            total_revenue: room_stats.total_tips + room_stats.total_access_fees,
            pending_revenue: total_pending_tips + total_pending_access_fees,
            active_tippers: room_stats.pending_tips.iter()
                .map(|tip| tip.from.clone())
                .collect::<std::collections::HashSet<_>>()
                .len(),
            quality_tier_revenue: self.calculate_quality_tier_revenue(&room_stats),
        })
    }

    /// Calculate revenue breakdown by quality tier
    fn calculate_quality_tier_revenue(
        &self,
        room_stats: &crate::RoomPaymentPool,
    ) -> HashMap<crate::StreamQuality, u128> {
        let mut revenue_by_tier = HashMap::new();

        for access_fee in &room_stats.pending_access_fees {
            *revenue_by_tier.entry(access_fee.quality_tier).or_insert(0) += access_fee.amount as u128;
        }

        revenue_by_tier
    }
}