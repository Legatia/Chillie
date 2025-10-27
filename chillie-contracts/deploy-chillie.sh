#!/bin/bash

# Chillie Linera Testnet Deployment Script
# Simplified deployment for Chillie smart contract to Linera testnet

set -e  # Exit on error

echo "🚀 Chillie Linera Testnet Deployment"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# PREREQUISITES CHECK
# ============================================================================

echo -e "${BLUE}STEP 0: Prerequisites Check${NC}"

# Check if Linera CLI is installed
if ! command -v linera &> /dev/null; then
    echo -e "${RED}Error: Linera CLI not found${NC}"
    echo "Please install Linera CLI: curl -sSL https://get.linera.io | sh"
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}Error: Cargo not found${NC}"
    echo "Please install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Check if wasm32-unknown-unknown target is installed
if ! rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    echo -e "${YELLOW}Installing wasm32-unknown-unknown target...${NC}"
    rustup target add wasm32-unknown-unknown
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# ============================================================================
# WALLET SETUP AND TESTNET CONNECTION
# ============================================================================

echo -e "${BLUE}STEP 1: Testnet Wallet Setup${NC}"

# Initialize wallet if needed
if [ ! -d "$HOME/.linera/wallet" ]; then
    echo -e "${YELLOW}Initializing Linera wallet...${NC}"
    linera wallet init
else
    echo -e "${GREEN}✓ Wallet already initialized${NC}"
fi

# Show wallet information
WALLET_INFO=$(linera wallet show)
echo -e "${CYAN}Wallet info:${NC}"
echo "$WALLET_INFO"
echo ""

# ============================================================================
# BUILD CHILLIE CONTRACT
# ============================================================================

echo -e "${BLUE}STEP 2: Building Chillie Contract${NC}"

cd room-manager

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
cargo clean

# Build for WebAssembly
echo -e "${YELLOW}Building Chillie for WebAssembly...${NC}"
cargo build --release --target wasm32-unknown-unknown

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Chillie built successfully${NC}"
else
    echo -e "${RED}✗ Chillie build failed${NC}"
    exit 1
fi

# Check if WASM file exists
WASM_FILE="target/wasm32-unknown-unknown/release/chillie.wasm"
if [ ! -f "$WASM_FILE" ]; then
    echo -e "${RED}Error: chillie.wasm not found${NC}"
    exit 1
fi

WASM_SIZE=$(stat -f%z "$WASM_FILE" 2>/dev/null || stat -c%s "$WASM_FILE" 2>/dev/null || echo "unknown")
echo -e "${GREEN}✓ WASM file generated: chillie.wasm (${WASM_SIZE} bytes)${NC}"
cd ..
echo ""

# ============================================================================
# DEPLOY TO TESTNET
# ============================================================================

echo -e "${BLUE}STEP 3: Deploying to Testnet${NC}"

cd room-manager

# For Linera, we'll use the chillie.wasm file as both contract and service
# Linera will extract the appropriate parts
CONTRACT_WASM="$WASM_FILE"
SERVICE_WASM="$WASM_FILE"

echo -e "${YELLOW}Deploying Chillie application to testnet...${NC}"

# Create initialization argument for the room
ROOM_NAME="Chillie Demo Room"
HOST_ADDRESS="demo-host"
IS_PUBLIC=true

# Using the simplified Linera deployment command
DEPLOY_OUTPUT=$(linera publish-and-create \
    "$CONTRACT_WASM" \
    "$SERVICE_WASM" \
    --json-argument "{\"room_name\": \"$ROOM_NAME\", \"host_id\": \"$HOST_ADDRESS\", \"is_public\": $IS_PUBLIC}" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Chillie deployed successfully!${NC}"
    echo -e "${CYAN}Deployment output:${NC}"
    echo "$DEPLOY_OUTPUT"

    # Try to extract application ID from the output
    APP_ID=$(echo "$DEPLOY_OUTPUT" | grep -o 'Application ID: [^[:space:]]*' | cut -d' ' -f3 || echo "see-output-above")
    CHAIN_ID=$(echo "$DEPLOY_OUTPUT" | grep -o 'Chain ID: [^[:space:]]*' | cut -d' ' -f3 || echo "see-output-above")

    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          DEPLOYMENT SUMMARY                    ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║ Application ID: $APP_ID║${NC}"
    echo -e "${GREEN}║ Chain ID: $CHAIN_ID║${NC}"
    echo -e "${GREEN}║ Room Name: $ROOM_NAME║${NC}"
    echo -e "${GREEN}║ Host: $HOST_ADDRESS║${NC}"
    echo -e "${GREEN}║ Public: $IS_PUBLIC║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"

    # Save deployment info
    cat > ../.chillie-testnet-deployment.env << EOF
CHILLIE TESTNET DEPLOYMENT
========================
Deployment Date: $(date)
Application ID: $APP_ID
Chain ID: $CHAIN_ID
Room Name: $ROOM_NAME
Host Address: $HOST_ADDRESS
Is Public: $IS_PUBLIC
WASM File: $WASM_FILE
WASM Size: $WASM_SIZE bytes

Frontend Configuration:
VITE_LINERA_GRAPHQL_URL=http://localhost:8080/graphql
VITE_LINERA_CHAIN_ID=$CHAIN_ID
VITE_ROOM_REGISTRY_CONTRACT_ID=$APP_ID
EOF

    echo -e "${GREEN}✓ Deployment info saved to .chillie-testnet-deployment.env${NC}"

else
    echo -e "${RED}✗ Deployment failed${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

cd ..
echo ""

# ============================================================================
# NEXT STEPS
# ============================================================================

echo -e "${BLUE}STEP 4: Next Steps${NC}"
echo ""
echo -e "${YELLOW}To complete the setup:${NC}"
echo -e "${CYAN}1. Update your frontend .env file with the testnet configuration${NC}"
echo -e "${CYAN}2. Copy the values from .chillie-testnet-deployment.env${NC}"
echo -e "${CYAN}3. Replace the mock blockchain service with real Linera SDK calls${NC}"
echo -e "${CYAN}4. Test the host-paid room creation flow${NC}"
echo ""
echo -e "${GREEN}🎉 Chillie is now deployed on Linera testnet!${NC}"
echo -e "${GREEN}🚀 You can start creating rooms with real blockchain transactions!${NC}"