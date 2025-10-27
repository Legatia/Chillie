# Chillie - CLI Integration with Conway Testnet

This guide shows how to use the Chillie application with real Linera CLI commands on the Conway testnet.

## 🎯 What You Have

✅ **Your Chain Info:**
- **Chain ID**: `9b030590d16320a057e68fc39becafff4c5c46ff239ef27031a959cf45d5b48b`
- **Wallet**: `0x19dbc4dba46c4919710591d1187090dab04d9a774e70179d8afdd8f9924bb3d8`
- **Contract ID**: `2bd8caee1c4725c919992631a8af75fe6aa4c67115e710a1406838ec8ed1f89e`

## 🚀 Setup Options

### Option 1: Local Simulation (Current - Working Now)
The app currently uses local simulation and works immediately.

### Option 2: Real CLI Backend (Advanced)

**1. Install Node.js Dependencies**
```bash
cd /Users/tobiasd/Desktop/Chillie
cp backend-package.json package.json
npm install
```

**2. Start CLI Backend Server**
```bash
node backend-server.js
```

**3. Enable CLI Mode in Frontend**
Create `.env` file in `/Users/tobiasd/Desktop/Chillie/frontend`:
```
VITE_USE_CLI_BACKEND=true
```

**4. Restart Frontend**
```bash
cd frontend && npm run dev
```

## 📋 Available CLI Commands

You can use these commands directly in your terminal:

```bash
# Set environment
export LINERA_DIR="/Users/tobiasd/Desktop/Chillie/linera-protocol"
export LINERA_WALLET="/Users/tobiasd/Desktop/Chillie/cli-wallet/wallet.json"
export LINERA_STORAGE="rocksdb:/Users/tobiasd/Desktop/Chillie/cli-storage"

# Check Linera version
cd $LINERA_DIR && linera --version

# Query your chain balance
linera --wallet $LINERA_WALLET --storage $LINERA_STORAGE local-balance

# Query chain info
linera --wallet $LINERA_WALLET --storage $LINERA_STORAGE chain 9b030590d16320a057e68fc39becafff4c5c46ff239ef27031a959cf45d5b48b

# Show wallet contents
linera --wallet $LINERA_WALLET --storage $LINERA_STORAGE wallet show
```

## 🎮 How It Works

### Current Setup (Local Simulation)
1. ✅ MetaMask connects for wallet identity
2. ✅ Local simulation handles blockchain operations
3. ✅ No CORS restrictions
4. ✅ Works immediately

### CLI Backend Setup (Real Blockchain)
1. ✅ MetaMask connects for wallet identity
2. ✅ Backend server executes real Linera CLI commands
3. ✅ Actual blockchain operations on Conway testnet
4. ✅ Uses your real chain and faucet funds

## 🔧 Frontend Configuration

The frontend supports three modes:

1. **Development Mode (Default)**: Local simulation
2. **CLI Backend Mode**: Real CLI commands via backend server
3. **Production Mode**: Direct RPC calls (with CORS proxy)

## 📱 Testing the App

1. Open `http://localhost:8083/`
2. Connect MetaMask
3. Type a room name
4. Click "Create Room on Blockchain"
5. Check console for operation logs

## 🆘 Troubleshooting

**Input field disabled?**
- Make sure MetaMask is connected
- Check if the wallet shows "Connected" status

**Backend server not working?**
- Ensure Node.js dependencies are installed
- Check if backend is running on port 3001
- Verify Linera CLI is built and accessible

**CLI commands failing?**
- Run the CLI setup script: `./cli-setup.sh`
- Check wallet configuration
- Ensure testnet is accessible

## 🎯 Next Steps

For production deployment:
1. Set up a CORS proxy for Linera validators
2. Deploy the backend server
3. Configure production environment variables
4. Add real WebAssembly contract deployment

---

**Current Status**: ✅ Working with local simulation
**CLI Backend**: 🚀 Ready to use (follow setup steps above)
**Your Chain**: 🔗 Conway testnet with faucet funds available