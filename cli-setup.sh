#!/bin/bash

# CLI Integration with Conway Testnet
# This script sets up Linera CLI to work with the Conway testnet

echo "🔧 Setting up Linera CLI for Conway testnet..."

# Variables
LINERA_DIR="/Users/tobiasd/Desktop/Chillie/linera-protocol"
WALLET_DIR="/Users/tobiasd/Desktop/Chillie/cli-wallet"
STORAGE_DIR="/Users/tobiasd/Desktop/Chillie/cli-storage"

# Create directories
mkdir -p "$WALLET_DIR"
mkdir -p "$STORAGE_DIR"

# Set environment variables
export LINERA_WALLET="$WALLET_DIR/wallet.json"
export LINERA_STORAGE="rocksdb:$STORAGE_DIR"

echo "📁 Wallet directory: $WALLET_DIR"
echo "💾 Storage directory: $STORAGE_DIR"

# Check if wallet exists, if not create it
if [ ! -f "$LINERA_WALLET" ]; then
    echo "🔑 Creating new wallet..."
    cd "$LINERA_DIR"

    # Create a new wallet
    linera wallet init \
        --genesis-config https://raw.githubusercontent.com/linera-io/linera-protocol/main/examples/conway-testnet/genesis.json \
        --with-faucet https://faucet.testnet-conway.linera.net \
        --validators https://validator-1.testnet-conway.linera.net,https://validator-2.testnet-conway.linera.net,https://validator-3.testnet-conway.linera.net

    echo "✅ Wallet created successfully!"
else
    echo "✅ Wallet already exists"
fi

# Show wallet contents
echo "💼 Wallet contents:"
cd "$LINERA_DIR"
linera --wallet "$LINERA_WALLET" --storage "$LINERA_STORAGE" wallet show

echo ""
echo "🎯 Ready to use CLI with Conway testnet!"
echo ""
echo "📝 Available commands:"
echo "  • Query balance: linera wallet --wallet $LINERA_WALLET --storage $LINERA_STORAGE local-balance"
echo "  • Create room: linera wallet --wallet $LINERA_WALLET --storage $LINERA_STORAGE publish-and-create <wasm-file>"
echo "  • Query chain: linera --wallet $LINERA_WALLET --storage $LINERA_STORAGE chain <chain-id>"
echo ""
echo "🔗 Your chain info:"
echo "  • Chain ID: 9b030590d16320a057e68fc39becafff4c5c46ff239ef27031a959cf45d5b48b"
echo "  • Wallet: 0x19dbc4dba46c4919710591d1187090dab04d9a774e70179d8afdd8f9924bb3d8"