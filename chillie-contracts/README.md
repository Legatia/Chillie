# Chillie Smart Contracts

This directory contains the smart contracts for the Chillie decentralized video conferencing platform.

## 📁 Structure

- **`room-manager/`** - Core Chillie smart contract for managing video meeting rooms
- **`CHILLIE_DEPLOYMENT_STATUS.md`** - Deployment status and technical documentation
- **`deploy-chillie.sh`** - Deployment script for Chillie contract

## 🚀 Room Manager Contract

The `room-manager` contract provides:

- ✅ Room initialization with name, host, and privacy settings
- ✅ Participant joining/leaving with validation
- ✅ Room activity management
- ✅ Participant counting and state tracking
- ✅ Real blockchain transactions on Linera network

## 🔗 Integration

The contract is designed to work with:
- **Backend Server**: `/backend-server.js` - Linera CLI integration
- **Frontend**: React application with WebRTC video communication
- **Network**: Linera Conway testnet
- **App ID**: `2bd8caee1c4725c919992631a8af75fe6aa4c67115e710a1406838ec8ed1f89e`

## 📋 Status

✅ **Compilation**: Fixed and working
✅ **Deployment**: Ready for Conway testnet
✅ **Integration**: Connected to backend server
✅ **Features**: All room management functionality implemented