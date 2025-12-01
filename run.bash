#!/usr/bin/env bash

set -eu

eval "$(linera net helper)"
linera_spawn linera net up --with-faucet

export LINERA_FAUCET_URL=http://localhost:8080
linera wallet init --faucet="$LINERA_FAUCET_URL"
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

echo "🚀 Deploying Room Manager Contract..."
# Navigate to contract directory to ensure relative paths work if needed, or run from root
# Running from root as per template expectation
APP_ID=$(linera project publish-and-create chillie-contracts/room-manager)
echo "✅ Room Manager Deployed! App ID: $APP_ID"

echo "📝 Configuring Frontend..."
# Create .env file for frontend
echo "VITE_ROOM_MANAGER_APP_ID=$APP_ID" > frontend/.env
echo "VITE_FAUCET_URL=$LINERA_FAUCET_URL" >> frontend/.env
echo "VITE_CHAIN_ID=$(linera wallet show | head -n 1)" >> frontend/.env

echo "🚀 Starting Backend Server..."
# Start backend server in background
node backend-server.js &

echo "🎨 Starting Frontend..."
cd frontend
npm install
npm run dev -- --host
