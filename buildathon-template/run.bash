#!/usr/bin/env bash

set -eu

eval "$(linera net helper)"
linera_spawn linera net up --with-faucet

export LINERA_FAUCET_URL=http://localhost:8080
linera wallet init --faucet="$LINERA_FAUCET_URL"
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

# Build and publish Chillie backend
echo "🔨 Building Chillie smart contracts..."
cd /build/linera-protocol/examples
cargo build --release --target wasm32-unknown-unknown

echo "🚀 Deploying Chillie application..."
APP_ID=$(linera project publish-and-create examples/chillie)
echo "✅ Chillie deployed with Application ID: $APP_ID"

# Store application ID for frontend
export CHILLIE_APP_ID=$APP_ID

# Start Linera service for GraphQL API
echo "🌐 Starting Linera service..."
linera service --port 8081 &
SERVICE_PID=$!

# Build and run Chillie frontend
echo "🎨 Building and starting Chillie frontend..."
cd /build/frontend
npm install
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to start..."
sleep 10

echo "✅ Chillie is ready!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔗 GraphQL API: http://localhost:8081"
echo "🚰 Faucet: http://localhost:8080"
echo "📱 Application ID: $APP_ID"

# Keep services running
wait $SERVICE_PID $FRONTEND_PID
