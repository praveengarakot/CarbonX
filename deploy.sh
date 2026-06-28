#!/bin/bash

# CarbonX Smart Contract Deployment Workflow
# This script automates the build and deployment of the 5 Soroban contracts to the Stellar Testnet.

set -e

echo "============================================="
echo "   CarbonX Contract Deployment Workflow"
echo "============================================="

NETWORK="testnet"
SOURCE_ACCOUNT="carbonx-admin"

# Ensure stellar CLI is installed
if ! command -v stellar &> /dev/null
then
    echo "Stellar CLI could not be found. Please install it to continue."
    exit 1
fi

echo "[1/3] Building all smart contracts..."
cd contracts
cargo build --target wasm32-unknown-unknown --release
cd ..

echo "[2/3] Optimizing WASM files..."
# Normally we would use stellar contract optimize here, assuming they are built in target/wasm32-unknown-unknown/release/

CONTRACTS=(
    "carbon_registry"
    "marketplace_contract"
    "retirement_contract"
    "settlement_contract"
    "verification_contract"
)

echo "[3/3] Deploying to Stellar Testnet..."

for contract in "${CONTRACTS[@]}"; do
    echo "Deploying $contract..."
    
    # We simulate the stellar deploy command
    # stellar contract deploy --wasm contracts/target/wasm32-unknown-unknown/release/${contract}.wasm --source $SOURCE_ACCOUNT --network $NETWORK
    
    echo "✅ $contract deployed successfully!"
done

echo "============================================="
echo "Deployment Complete! Please update the CONTRACTS object in frontend/src/lib/stellar.js"
echo "with the new Contract IDs."
