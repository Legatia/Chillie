// Payment Processor Contract - Linera SDK Implementation
// Handles tipping, access fees, and batched settlements for video streaming

#![cfg_attr(target_arch = "wasm32", no_main)]

use super::state;

use crate::{
    PaymentProcessorAbi, PaymentOperation, PaymentResult, PaymentError,
    RoomId, UserId, TipId, Timestamp, Hash, PendingTransaction, PendingTip, PendingAccessFee,
    RoomPaymentSettings, UserPaymentPreferences, StreamQuality, PaymentStats,
};
use linera_sdk::{
    linera_base_types::WithContractAbi,
    views::{View, ViewStorageContext, RootView},
    Contract, ContractRuntime,
};

use self::state::PaymentProcessorState;
use std::collections::HashMap;

pub struct PaymentProcessorContract {
    state: PaymentProcessorState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(PaymentProcessorContract);

impl WithContractAbi for PaymentProcessorContract {
    type Abi = PaymentProcessorAbi;
}

impl Contract for PaymentProcessorContract {
    type Message = ();
    type InstantiationArgument = ();
    type Parameters = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = PaymentProcessorState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load payment processor state");
        PaymentProcessorContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: ()) {
        // Validate that the application parameters were configured correctly.
        self.runtime.application_parameters();

        // Initialize with default state
        let default_stats = PaymentStats::default();
        self.state.update_stats(default_stats);
    }

    async fn execute_operation(&mut self, operation: PaymentOperation) -> PaymentResult {
        match operation {
            PaymentOperation::SendTip { room_id, amount, message, super_chat } => {
                self.process_tip(room_id, amount, message, super_chat)
            }
            PaymentOperation::PayAccessFee { room_id, quality_tier } => {
                self.process_access_fee(room_id, quality_tier)
            }
            PaymentOperation::SettlePendingTransactions { user_id } => {
                self.settle_user_transactions(user_id)
            }
            PaymentOperation::UpdateRoomSettings { room_id, settings } => {
                self.update_room_settings(room_id, settings)
            }
            PaymentOperation::WithdrawFunds { room_id, amount } => {
                self.withdraw_funds(room_id, amount)
            }
        }
    }

    async fn execute_message(&mut self, _message: ()) {
        panic!("Payment processor doesn't support any cross-chain messages");
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save payment processor state");
    }
}

impl PaymentProcessorContract {
    /// Process a tip to a room
    fn process_tip(&mut self, room_id: RoomId, amount: u64, message: Option<String>, super_chat: bool) -> PaymentResult {
        // SECURITY FIX: Validate input parameters
        if amount == 0 {
            return PaymentResult::PaymentError { error: PaymentError::InvalidAmount };
        }

        // Get authenticated user
        let user_id = match self.runtime.authenticated_signer() {
            Some(signer) => signer.to_string(),
            None => return PaymentResult::PaymentError { error: PaymentError::Unauthorized },
        };

        // SECURITY FIX: Use proper timestamp
        let timestamp = self.runtime.system_time().micros_since_epoch();

        // Validate message length to prevent DoS
        if let Some(ref msg) = message {
            if msg.len() > 500 {
                return PaymentResult::PaymentError { error: PaymentError::InvalidAmount };
            }
        }

        // SECURITY FIX: Check user balance before processing tip
        let user_balance = match self.state.get_user_state(&user_id) {
            Some(user_state) => user_state.balance,
            None => return PaymentResult::PaymentError { error: PaymentError::UserNotFound },
        };

        if user_balance < amount as u128 {
            return PaymentResult::PaymentError { error: PaymentError::InsufficientBalance };
        }

        // Create tip
        let tip = PendingTip {
            from: user_id.clone(),
            amount,
            message,
            timestamp,
            super_chat,
        };

        let tip_id = format!("tip-{}-{}-{}", room_id, timestamp, amount);

        // Add to room's pending tips
        if let Some(mut room) = self.state.get_room_stats(&room_id).cloned() {
            // SECURITY FIX: Add overflow protection
            match room.total_tips.checked_add(amount as u128) {
                Some(new_total) => room.total_tips = new_total,
                None => return PaymentResult::PaymentError { error: PaymentError::InvalidAmount },
            }

            room.pending_tips.push(tip.clone());
            self.state.insert_room(room_id.clone(), room);
        } else {
            return PaymentResult::PaymentError { error: PaymentError::RoomNotFound };
        }

        // Update user's pending transactions
        if let Some(mut user_state) = self.state.get_user_state(&user_id).cloned() {
            // SECURITY FIX: Safe balance subtraction
            user_state.balance = user_state.balance.saturating_sub(amount as u128);
            user_state.pending_transactions.push(PendingTransaction::Tip(tip.clone()));
            self.state.insert_user(user_id.clone(), user_state);
        } else {
            return PaymentResult::PaymentError { error: PaymentError::UserNotFound };
        }

        // Check if user should auto-settle
        if self.should_auto_settle(&user_id) {
            self.settle_user_transactions(user_id);
        }

        PaymentResult::TipSent {
            tip_id,
            amount,
            pending_settlement: true,
        }
    }

    /// Process an access fee payment
    fn process_access_fee(&mut self, room_id: RoomId, quality_tier: StreamQuality) -> PaymentResult {
        // SECURITY FIX: Proper authentication
        let user_id = match self.runtime.authenticated_signer() {
            Some(signer) => signer.to_string(),
            None => return PaymentResult::PaymentError { error: PaymentError::Unauthorized },
        };

        // Get room to find pricing for quality tier
        let room = match self.state.get_room_stats(&room_id).cloned() {
            Some(room) => room,
            None => return PaymentResult::PaymentError { error: PaymentError::RoomNotFound },
        };

        // SECURITY FIX: Check if payments are enabled for the room
        if !room.settings.payments_enabled {
            return PaymentResult::PaymentError { error: PaymentError::PaymentsDisabled };
        }

        let amount = match room.settings.quality_tiers.get(&quality_tier) {
            Some(cost) => *cost,
            None => return PaymentResult::PaymentError { error: PaymentError::InvalidQualityTier },
        };

        // SECURITY FIX: Use proper timestamp
        let timestamp = self.runtime.system_time().micros_since_epoch();

        // SECURITY FIX: Check user balance before processing
        let user_balance = match self.state.get_user_state(&user_id) {
            Some(user_state) => user_state.balance,
            None => return PaymentResult::PaymentError { error: PaymentError::UserNotFound },
        };

        if user_balance < amount as u128 {
            return PaymentResult::PaymentError { error: PaymentError::InsufficientBalance };
        }

        let access_fee = PendingAccessFee {
            user_id: user_id.clone(),
            amount,
            quality_tier,
            timestamp,
        };

        // Add to room's pending access fees
        if let Some(mut room) = self.state.get_room_stats(&room_id).cloned() {
            // SECURITY FIX: Add overflow protection
            match room.total_access_fees.checked_add(amount as u128) {
                Some(new_total) => room.total_access_fees = new_total,
                None => return PaymentResult::PaymentError { error: PaymentError::InvalidAmount },
            }

            room.pending_access_fees.push(access_fee.clone());
            self.state.insert_room(room_id.clone(), room);
        }

        // Update user's pending transactions
        if let Some(mut user_state) = self.state.get_user_state(&user_id).cloned() {
            user_state.pending_transactions.push(PendingTransaction::AccessFee(access_fee.clone()));
            user_state.balance = user_state.balance.saturating_sub(amount as u128);
            self.state.insert_user(user_id, user_state);
        } else {
            return PaymentResult::PaymentError { error: PaymentError::UserNotFound };
        }

        PaymentResult::AccessFeePaid {
            room_id,
            quality_tier,
            pending_settlement: true,
        }
    }

    /// Settle user's pending transactions
    fn settle_user_transactions(&mut self, user_id: UserId) -> PaymentResult {
        let user_state = match self.state.get_user_state(&user_id).cloned() {
            Some(state) => state,
            None => return PaymentResult::PaymentError { error: PaymentError::UserNotFound },
        };

        let transaction_count = user_state.pending_transactions.len();
        let total_amount: u128 = user_state.pending_transactions.iter()
            .map(|tx| match tx {
                PendingTransaction::Tip(tip) => tip.amount as u128,
                PendingTransaction::AccessFee(fee) => fee.amount as u128,
            })
            .sum();

        // Create settlement hash (simplified)
        let settlement_hash = [0u8; 32]; // In real implementation, create actual hash

        // Clear user's pending transactions
        if let Some(mut user_state) = self.state.get_user_state(&user_id).cloned() {
            user_state.pending_transactions.clear();
            self.state.insert_user(user_id.clone(), user_state);
        }

        PaymentResult::TransactionsSettled {
            user_id,
            transaction_count,
            total_amount,
            settlement_hash,
        }
    }

    /// Update room payment settings
    fn update_room_settings(&mut self, room_id: RoomId, settings: RoomPaymentSettings) -> PaymentResult {
        // SECURITY FIX: Check authentication
        let user_id = match self.runtime.authenticated_signer() {
            Some(signer) => signer.to_string(),
            None => return PaymentResult::PaymentError { error: PaymentError::Unauthorized },
        };

        if let Some(mut room) = self.state.get_room_stats(&room_id).cloned() {
            // SECURITY FIX: Only room host can update settings
            if room.host != user_id {
                return PaymentResult::PaymentError { error: PaymentError::Unauthorized };
            }

            // Validate settings
            if settings.min_tip == 0 {
                return PaymentResult::PaymentError { error: PaymentError::InvalidRoomSettings };
            }

            room.settings = settings;
            self.state.insert_room(room_id.clone(), room);
            PaymentResult::RoomSettingsUpdated { room_id }
        } else {
            PaymentResult::PaymentError { error: PaymentError::RoomNotFound }
        }
    }

    /// Withdraw funds for room host
    fn withdraw_funds(&mut self, room_id: RoomId, amount: u128) -> PaymentResult {
        // SECURITY FIX: Check authentication
        let user_id = match self.runtime.authenticated_signer() {
            Some(signer) => signer.to_string(),
            None => return PaymentResult::PaymentError { error: PaymentError::Unauthorized },
        };

        if let Some(room) = self.state.get_room_stats(&room_id) {
            // SECURITY FIX: Only room host can withdraw funds
            if room.host != user_id {
                return PaymentResult::PaymentError { error: PaymentError::Unauthorized };
            }

            // Validate amount
            if amount == 0 {
                return PaymentResult::PaymentError { error: PaymentError::InvalidAmount };
            }

            let available_funds = room.total_tips + room.total_access_fees;
            if amount <= available_funds {
                // SECURITY FIX: Use proper hash for withdrawal
                let timestamp = self.runtime.system_time().micros_since_epoch();
                let withdrawal_data = format!("{}:{}:{}", room_id, amount, timestamp);
                let withdrawal_hash = linera_sdk::base::crypto::Hash::new(withdrawal_data.as_bytes()).0;

                PaymentResult::FundsWithdrawn { room_id, amount, withdrawal_hash }
            } else {
                PaymentResult::PaymentError { error: PaymentError::InsufficientBalance }
            }
        } else {
            PaymentResult::PaymentError { error: PaymentError::RoomNotFound }
        }
    }

    /// Check if user should auto-settle transactions
    fn should_auto_settle(&self, user_id: &UserId) -> bool {
        if let Some(user_state) = self.state.get_user_state(user_id) {
            let pending_count = user_state.pending_transactions.len();
            let threshold_reached = user_state.balance >= user_state.preferences.auto_settle_threshold;
            let max_pending_reached = pending_count >= user_state.preferences.max_pending;
            threshold_reached || max_pending_reached
        } else {
            false
        }
    }
}