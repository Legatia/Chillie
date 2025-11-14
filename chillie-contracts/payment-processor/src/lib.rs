// Chillie Payment Processor - Micropayment Framework
// Handles tipping, access fees, and batched settlements for video streaming

use linera_sdk::linera_base_types::{ContractAbi, ServiceAbi};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub mod contract;
pub mod service;
pub mod state;

pub struct PaymentProcessorAbi;

impl ContractAbi for PaymentProcessorAbi {
    type Operation = PaymentOperation;
    type Response = PaymentResult;
}

impl ServiceAbi for PaymentProcessorAbi {
    type Query = PaymentQuery;
    type QueryResponse = PaymentQueryResponse;
}

// Re-export commonly used types
pub use contract::PaymentProcessorContract;
pub use service::PaymentProcessorService;
pub use state::PaymentProcessorState;

/// Query types for payment processor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PaymentQuery {
    GetRoomStats { room_id: RoomId },
    GetUserState { user_id: UserId },
    GetGlobalStats,
    GetPendingTips { room_id: RoomId },
    GetPendingAccessFees { room_id: RoomId },
    GetUserPendingTransactions { user_id: UserId },
    GetQualityTierPricing { room_id: RoomId },
    GetUserPaymentSummary { user_id: UserId, room_id: RoomId },
    GetRoomRevenueBreakdown { room_id: RoomId },
}

/// Query response types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PaymentQueryResponse {
    RoomStats(Option<RoomPaymentPool>),
    UserState(Option<UserPaymentState>),
    GlobalStats(PaymentStats),
    PendingTips(Vec<PendingTip>),
    PendingAccessFees(Vec<PendingAccessFee>),
    UserPendingTransactions(Vec<PendingTransaction>),
    QualityTierPricing(HashMap<StreamQuality, u64>),
    UserPaymentSummary(UserPaymentSummary),
    RoomRevenueBreakdown(RoomRevenueBreakdown),
    Error(PaymentError),
}

/// Payment pool for a specific room
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomPaymentPool {
    /// Room identifier
    pub room_id: RoomId,
    /// Room host (streamer) who receives payments
    pub host: UserId,
    /// Total tips received
    pub total_tips: u128,
    /// Total access fees collected
    pub total_access_fees: u128,
    /// Active tips from users (pending batch settlement)
    pub pending_tips: Vec<PendingTip>,
    /// Active access fees (pending batch settlement)
    pub pending_access_fees: Vec<PendingAccessFee>,
    /// Payment settings for the room
    pub settings: RoomPaymentSettings,
}

/// Payment settings for a room
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomPaymentSettings {
    /// Minimum tip amount
    pub min_tip: u64,
    /// Access fee for private rooms (0 for public)
    pub access_fee: u64,
    /// Quality tier pricing
    pub quality_tiers: HashMap<StreamQuality, u64>,
    /// Whether payments are enabled
    pub payments_enabled: bool,
}

/// Stream quality levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum StreamQuality {
    Standard,
    High,
    Premium,
    Ultra,
}

impl std::fmt::Display for StreamQuality {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StreamQuality::Standard => write!(f, "SD"),
            StreamQuality::High => write!(f, "HD"),
            StreamQuality::Premium => write!(f, "FHD"),
            StreamQuality::Ultra => write!(f, "4K"),
        }
    }
}

/// User payment state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPaymentState {
    /// User identifier
    pub user_id: UserId,
    /// User's current balance
    pub balance: u128,
    /// User's pending batch transactions
    pub pending_transactions: Vec<PendingTransaction>,
    /// User's payment preferences
    pub preferences: UserPaymentPreferences,
}

/// User payment preferences
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPaymentPreferences {
    /// Default tip amount
    pub default_tip: u64,
    /// Auto-settle threshold
    pub auto_settle_threshold: u128,
    /// Maximum pending transactions before auto-settlement
    pub max_pending: usize,
}

/// Pending tip transaction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PendingTip {
    /// Sender user ID
    pub from: UserId,
    /// Tip amount
    pub amount: u64,
    /// Optional message
    pub message: Option<String>,
    /// Timestamp
    pub timestamp: Timestamp,
    /// Whether it's a "super chat" (highlighted)
    pub super_chat: bool,
}

/// Pending access fee transaction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PendingAccessFee {
    /// User paying the fee
    pub user_id: UserId,
    /// Amount paid
    pub amount: u64,
    /// Quality tier purchased
    pub quality_tier: StreamQuality,
    /// Timestamp
    pub timestamp: Timestamp,
}

/// Pending transaction (batchable)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PendingTransaction {
    Tip(PendingTip),
    AccessFee(PendingAccessFee),
}

/// Payment statistics
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PaymentStats {
    /// Total payments processed
    pub total_processed: u128,
    /// Total tips sent
    pub total_tips: u128,
    /// Total access fees collected
    pub total_access_fees: u128,
    /// Number of active users
    pub active_users: u64,
    /// Number of active payment pools
    pub active_rooms: u64,
}

/// Payment operation messages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PaymentOperation {
    /// Send a tip to a room
    SendTip {
        room_id: RoomId,
        amount: u64,
        message: Option<String>,
        super_chat: bool,
    },
    /// Pay access fee for a room
    PayAccessFee {
        room_id: RoomId,
        quality_tier: StreamQuality,
    },
    /// Settle user's pending transactions
    SettlePendingTransactions {
        user_id: UserId,
    },
    /// Create or update room payment settings
    UpdateRoomSettings {
        room_id: RoomId,
        settings: RoomPaymentSettings,
    },
    /// Withdraw funds for room host
    WithdrawFunds {
        room_id: RoomId,
        amount: u128,
    },
}

/// Payment operation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PaymentResult {
    TipSent {
        tip_id: TipId,
        amount: u64,
        pending_settlement: bool,
    },
    AccessFeePaid {
        room_id: RoomId,
        quality_tier: StreamQuality,
        pending_settlement: bool,
    },
    TransactionsSettled {
        user_id: UserId,
        transaction_count: usize,
        total_amount: u128,
        settlement_hash: Hash,
    },
    RoomSettingsUpdated {
        room_id: RoomId,
    },
    FundsWithdrawn {
        room_id: RoomId,
        amount: u128,
        withdrawal_hash: Hash,
    },
    PaymentError {
        error: PaymentError,
    },
}

/// Payment error types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PaymentError {
    InsufficientBalance,
    InvalidAmount,
    RoomNotFound,
    UserNotFound,
    InvalidQualityTier,
    PaymentsDisabled,
    SettlementFailed,
    InvalidRoomSettings,
    Unauthorized,
}

// Type aliases for clarity
pub type RoomId = String;
pub type UserId = String;
pub type TipId = String;
pub type Timestamp = u64;
pub type Hash = [u8; 32];

/// User payment summary for frontend display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPaymentSummary {
    pub user_id: UserId,
    pub room_id: RoomId,
    pub balance: u128,
    pub pending_transactions: usize,
    pub pending_tips: usize,
    pub pending_access_fees: usize,
    pub can_afford_tips: bool,
    pub recommended_tip: u64,
    pub auto_settle_threshold: u128,
}

/// Room revenue breakdown for streamer dashboard
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomRevenueBreakdown {
    pub room_id: RoomId,
    pub host: UserId,
    pub total_tips: u128,
    pub total_access_fees: u128,
    pub pending_tips: u128,
    pub pending_access_fees: u128,
    pub total_revenue: u128,
    pub pending_revenue: u128,
    pub active_tippers: usize,
    pub quality_tier_revenue: HashMap<StreamQuality, u128>,
}


impl Default for RoomPaymentSettings {
    fn default() -> Self {
        let mut quality_tiers = HashMap::new();
        quality_tiers.insert(StreamQuality::Standard, 0);
        quality_tiers.insert(StreamQuality::High, 100);
        quality_tiers.insert(StreamQuality::Premium, 500);
        quality_tiers.insert(StreamQuality::Ultra, 2000);

        Self {
            min_tip: 1,
            access_fee: 0,
            quality_tiers,
            payments_enabled: true,
        }
    }
}

impl Default for UserPaymentPreferences {
    fn default() -> Self {
        Self {
            default_tip: 100,
            auto_settle_threshold: 10000,
            max_pending: 50,
        }
    }
}

