#!/bin/bash

################################################################################
# Solana Program Deployment Script
# Deploys the Zeroglaze Anchor program to specified network
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NETWORK="${1:-devnet}"

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    print_error "Anchor CLI is not installed"
    echo -e "Install with: ${BLUE}cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli${NC}"
    exit 1
fi

# Check if Solana is installed
if ! command -v solana &> /dev/null; then
    print_error "Solana CLI is not installed"
    echo -e "Install with: ${BLUE}sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\"${NC}"
    exit 1
fi

main() {
    print_header "Solana Program Deployment - $NETWORK"

    # Configure Solana network
    print_info "Configuring Solana CLI for $NETWORK..."

    case $NETWORK in
        devnet)
            solana config set --url https://api.devnet.solana.com
            ;;
        testnet)
            solana config set --url https://api.testnet.solana.com
            ;;
        mainnet-beta|mainnet)
            print_warning "Deploying to MAINNET!"
            read -p "Are you sure? (yes/no) " -r
            if [[ ! $REPLY == "yes" ]]; then
                print_info "Deployment cancelled"
                exit 0
            fi
            solana config set --url https://api.mainnet-beta.solana.com
            NETWORK="mainnet-beta"
            ;;
        localnet|local)
            solana config set --url http://localhost:8899
            NETWORK="localnet"
            ;;
        *)
            print_error "Invalid network: $NETWORK"
            echo "Valid options: devnet, testnet, mainnet-beta, localnet"
            exit 1
            ;;
    esac

    print_success "Network configured: $NETWORK"

    # Check wallet
    WALLET_PATH=$(solana config get | grep "Keypair Path" | awk '{print $3}')
    print_info "Using wallet: $WALLET_PATH"

    WALLET_ADDRESS=$(solana address)
    print_info "Wallet address: $WALLET_ADDRESS"

    # Check balance
    BALANCE=$(solana balance 2>/dev/null | awk '{print $1}' || echo "0")
    print_info "Wallet balance: $BALANCE SOL"

    if [ "$NETWORK" == "devnet" ]; then
        if (( $(echo "$BALANCE < 2" | bc -l) )); then
            print_warning "Low balance, requesting airdrop..."
            solana airdrop 2 || print_warning "Airdrop failed"
            sleep 5
            # Try again
            solana airdrop 2 || print_warning "Second airdrop failed"
            sleep 5
            BALANCE=$(solana balance | awk '{print $1}')
            print_info "New balance: $BALANCE SOL"
        fi
    else
        if (( $(echo "$BALANCE < 2" | bc -l) )); then
            print_error "Insufficient balance for deployment (need at least 2 SOL)"
            exit 1
        fi
    fi

    # Navigate to program directory
    cd "$PROJECT_ROOT/programs/zeroglaze"

    # Build program
    print_info "Building Anchor program..."
    anchor build

    PROGRAM_SIZE=$(ls -lh target/deploy/zeroglaze.so | awk '{print $5}')
    print_success "Build complete (program size: $PROGRAM_SIZE)"

    # Get program ID from keypair
    if [ -f "target/deploy/zeroglaze-keypair.json" ]; then
        PROGRAM_ID=$(solana-keygen pubkey target/deploy/zeroglaze-keypair.json)
        print_info "Program ID (from keypair): $PROGRAM_ID"
    fi

    # Deploy
    print_info "Deploying program to $NETWORK..."
    echo ""

    DEPLOY_OUTPUT=$(anchor deploy --provider.cluster $NETWORK 2>&1 | tee /dev/tty)

    # Extract deployed program ID
    DEPLOYED_PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep "Program Id:" | awk '{print $3}')

    if [ -z "$DEPLOYED_PROGRAM_ID" ]; then
        print_error "Failed to extract Program ID from deployment output"
        exit 1
    fi

    print_success "Program deployed successfully!"
    echo ""
    print_info "Program ID: $DEPLOYED_PROGRAM_ID"

    # Update Anchor.toml
    print_info "Updating Anchor.toml..."
    sed -i.bak "s|zeroglaze = \".*\"|zeroglaze = \"$DEPLOYED_PROGRAM_ID\"|" "$PROJECT_ROOT/Anchor.toml"
    rm "$PROJECT_ROOT/Anchor.toml.bak"
    print_success "Anchor.toml updated"

    # Update .env file
    print_info "Updating .env file..."
    if [ -f "$PROJECT_ROOT/.env" ]; then
        if grep -q "NEXT_PUBLIC_PROGRAM_ID" "$PROJECT_ROOT/.env"; then
            sed -i.bak "s|NEXT_PUBLIC_PROGRAM_ID=.*|NEXT_PUBLIC_PROGRAM_ID=$DEPLOYED_PROGRAM_ID|" "$PROJECT_ROOT/.env"
            rm "$PROJECT_ROOT/.env.bak"
        else
            echo "NEXT_PUBLIC_PROGRAM_ID=$DEPLOYED_PROGRAM_ID" >> "$PROJECT_ROOT/.env"
        fi
        print_success ".env file updated"
    else
        print_warning ".env file not found, skipping update"
    fi

    # Generate IDL
    print_info "Generating IDL..."
    if [ -f "target/idl/zeroglaze.json" ]; then
        cp target/idl/zeroglaze.json "$PROJECT_ROOT/lib/idl.json"
        print_success "IDL copied to lib/idl.json"
    fi

    # Summary
    print_header "Deployment Summary"
    echo -e "Network:     ${BLUE}$NETWORK${NC}"
    echo -e "Program ID:  ${BLUE}$DEPLOYED_PROGRAM_ID${NC}"
    echo -e "Deployer:    ${BLUE}$WALLET_ADDRESS${NC}"
    echo -e "Balance:     ${BLUE}$BALANCE SOL${NC}"
    echo ""
    echo -e "${GREEN}Next Steps:${NC}"
    echo "1. Update Vercel environment variable: NEXT_PUBLIC_PROGRAM_ID=$DEPLOYED_PROGRAM_ID"
    echo "2. Redeploy frontend: vercel --prod"
    echo "3. Test program interaction on the frontend"
    echo ""
    echo -e "${BLUE}Verify deployment:${NC}"
    echo "  solana program show $DEPLOYED_PROGRAM_ID"
    echo ""
}

# Show usage
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: $0 [network]"
    echo ""
    echo "Networks:"
    echo "  devnet       - Solana Devnet (default)"
    echo "  testnet      - Solana Testnet"
    echo "  mainnet-beta - Solana Mainnet"
    echo "  localnet     - Local validator"
    echo ""
    echo "Examples:"
    echo "  $0 devnet"
    echo "  $0 mainnet-beta"
    exit 0
fi

main
