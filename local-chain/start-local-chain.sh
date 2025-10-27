#!/bin/bash

# Local Linera Development Chain Setup
# This script sets up a local Linera chain for development

echo "🚀 Setting up local Linera development chain..."

# Set up variables
LINERA_DIR="/Users/tobiasd/Desktop/Chillie/linera-protocol"
LOCAL_CHAIN_DIR="/Users/tobiasd/Desktop/Chillie/local-chain"
WALLET_DIR="$LOCAL_CHAIN_DIR/wallets"

# Create directories
mkdir -p "$WALLET_DIR"
mkdir -p "$LOCAL_CHAIN_DIR/storage"

echo "📁 Directory structure created..."

# Function to generate wallet keys
generate_wallet() {
    local name=$1
    local wallet_file="$WALLET_DIR/${name}.json"

    if [ ! -f "$wallet_file" ]; then
        echo "🔑 Generating wallet: $name"
        linera wallet --output "$wallet_file" generate
    else
        echo "✅ Wallet $name already exists"
    fi
}

# Generate development wallets
echo "🔑 Generating development wallets..."
generate_wallet "validator"
generate_wallet "faucet"
generate_wallet "user1"

# Start the local Linera service
echo "🌐 Starting local Linera service..."

# Check if service is already running
if pgrep -f "linera-service" > /dev/null; then
    echo "⚠️  Linera service is already running. Stopping it first..."
    pkill -f "linera-service"
    sleep 2
fi

# Create storage directory for the service
mkdir -p "$LOCAL_CHAIN_DIR/service-storage"

# Start Linera service with local configuration
cd "$LINERA_DIR"
LINERA_SERVICE_PORT=8080 \
LINERA_STORAGE=rocksdb:"$LOCAL_CHAIN_DIR/service-storage" \
linera-service \
    --port 8080 \
    --host 127.0.0.1 \
    --no-auth \
    --validator-wallet "$WALLET_DIR/validator.json" &

SERVICE_PID=$!
echo "🔄 Linera service started with PID: $SERVICE_PID"

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 5

# Test if service is responding
echo "🧪 Testing service..."
if curl -s http://127.0.0.1:8080 > /dev/null; then
    echo "✅ Local Linera service is running at http://127.0.0.1:8080"
    echo ""
    echo "🎯 Local Chain Configuration:"
    echo "   • Service URL: http://127.0.0.1:8080"
    echo "   • No CORS restrictions"
    echo "   • Development mode enabled"
    echo "   • Validator wallet: $WALLET_DIR/validator.json"
    echo ""
    echo "📝 Frontend Configuration:"
    echo "   Update your .env file with:"
    echo "   VITE_LINERA_RPC_URL=http://127.0.0.1:8080"
    echo "   VITE_CHILLIE_CONTRACT_ID=<will-be-deployed-soon>"
    echo ""
    echo "🔧 To stop the service: kill $SERVICE_PID"
else
    echo "❌ Service failed to start. Check the logs above."
    kill $SERVICE_PID 2>/dev/null
fi

# Save PID for later cleanup
echo $SERVICE_PID > "$LOCAL_CHAIN_DIR/service.pid"