#!/bin/bash

################################################################################
# Zeroglaze MVP - Complete Deployment Script
# This script handles the full deployment pipeline for Devnet
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NETWORK="${NETWORK:-devnet}"

################################################################################
# Helper Functions
################################################################################

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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

confirm() {
    read -p "$1 (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 1
    fi
}

################################################################################
# Pre-flight Checks
################################################################################

preflight_checks() {
    print_header "Pre-flight Checks"

    print_info "Checking required tools..."

    check_command "node"
    check_command "npm"
    check_command "git"
    check_command "solana"
    check_command "anchor"
    check_command "vercel"

    print_success "All required tools are installed"

    # Check environment file
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        print_error ".env file not found. Please create it from .env.example"
        exit 1
    fi
    print_success "Environment file exists"

    # Check Solana config
    SOLANA_NETWORK=$(solana config get | grep "RPC URL" | awk '{print $3}')
    if [[ "$SOLANA_NETWORK" != *"$NETWORK"* ]]; then
        print_warning "Solana CLI is not configured for $NETWORK"
        print_info "Configuring Solana CLI for $NETWORK..."
        solana config set --url https://api.$NETWORK.solana.com
    fi
    print_success "Solana configured for $NETWORK"

    # Check wallet balance
    BALANCE=$(solana balance 2>/dev/null | awk '{print $1}' || echo "0")
    print_info "Wallet balance: $BALANCE SOL"

    if (( $(echo "$BALANCE < 2" | bc -l) )); then
        print_warning "Low SOL balance. Requesting airdrop..."
        solana airdrop 2 || print_warning "Airdrop failed, continuing anyway..."
        sleep 5
    fi
}

################################################################################
# Deploy Solana Program
################################################################################

deploy_program() {
    print_header "Deploying Solana Program"

    cd "$PROJECT_ROOT/programs/zeroglaze"

    print_info "Building Anchor program..."
    anchor build

    print_info "Deploying to $NETWORK..."
    DEPLOY_OUTPUT=$(anchor deploy --provider.cluster $NETWORK 2>&1)

    # Extract program ID from deploy output
    PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep "Program Id:" | awk '{print $3}')

    if [ -z "$PROGRAM_ID" ]; then
        print_error "Failed to extract Program ID from deployment"
        echo "$DEPLOY_OUTPUT"
        exit 1
    fi

    print_success "Program deployed successfully"
    print_info "Program ID: $PROGRAM_ID"

    # Save program ID to env file
    if grep -q "NEXT_PUBLIC_PROGRAM_ID" "$PROJECT_ROOT/.env"; then
        sed -i.bak "s|NEXT_PUBLIC_PROGRAM_ID=.*|NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID|" "$PROJECT_ROOT/.env"
        rm "$PROJECT_ROOT/.env.bak"
    else
        echo "NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID" >> "$PROJECT_ROOT/.env"
    fi

    print_success "Program ID saved to .env"

    cd "$PROJECT_ROOT"
}

################################################################################
# Deploy Database
################################################################################

deploy_database() {
    print_header "Deploying Database (Supabase)"

    print_info "Running database migrations..."

    # Check if supabase CLI is available
    if command -v supabase &> /dev/null; then
        cd "$PROJECT_ROOT"
        supabase db push || print_warning "Supabase CLI push failed, you may need to run migrations manually"
    else
        print_warning "Supabase CLI not found. Please run migrations manually via Supabase dashboard."
        print_info "1. Go to https://app.supabase.com"
        print_info "2. Open SQL Editor"
        print_info "3. Run supabase/migrations/001_initial_schema.sql"
        print_info "4. Run supabase/migrations/002_seed_data.sql"

        if ! confirm "Have you run the migrations manually?"; then
            exit 1
        fi
    fi

    print_success "Database migrations complete"
}

################################################################################
# Deploy Frontend
################################################################################

deploy_frontend() {
    print_header "Deploying Frontend (Vercel)"

    cd "$PROJECT_ROOT"

    print_info "Installing dependencies..."
    npm ci --no-optional

    print_info "Running type check..."
    npm run type-check

    print_info "Building Next.js application..."
    npm run build

    print_success "Build completed successfully"

    print_info "Deploying to Vercel..."

    if [ "$1" == "--prod" ]; then
        DEPLOY_URL=$(vercel --prod --yes)
    else
        DEPLOY_URL=$(vercel --yes)
    fi

    print_success "Frontend deployed"
    print_info "URL: $DEPLOY_URL"
}

################################################################################
# Post-deployment Checks
################################################################################

post_deployment_checks() {
    print_header "Post-Deployment Verification"

    # Wait for deployment to be ready
    print_info "Waiting for deployment to be ready..."
    sleep 10

    # Check if DEPLOY_URL is set
    if [ -z "$DEPLOY_URL" ]; then
        print_warning "Deploy URL not available, skipping health checks"
        return
    fi

    # Health check
    print_info "Running health check..."
    if curl -f -s "$DEPLOY_URL/api/health" > /dev/null; then
        print_success "Health check passed"
    else
        print_warning "Health check failed (this is normal if health endpoint doesn't exist yet)"
    fi

    # Test API
    print_info "Testing API endpoints..."
    if curl -f -s "$DEPLOY_URL/api/tokens/list" > /dev/null; then
        print_success "API endpoint test passed"
    else
        print_warning "API endpoint test failed"
    fi
}

################################################################################
# Deployment Summary
################################################################################

print_summary() {
    print_header "Deployment Summary"

    echo -e "${GREEN}Deployment completed successfully!${NC}\n"
    echo -e "Network:     ${BLUE}$NETWORK${NC}"
    echo -e "Program ID:  ${BLUE}$PROGRAM_ID${NC}"
    echo -e "Frontend:    ${BLUE}$DEPLOY_URL${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Test wallet connection on the deployed site"
    echo "2. Test token creation flow"
    echo "3. Test trading functionality"
    echo "4. Monitor Vercel deployment dashboard"
    echo "5. Check Supabase logs for any errors"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "  View logs:     vercel logs"
    echo "  Rollback:      vercel rollback"
    echo "  Redeploy:      vercel --prod"
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    clear

    print_header "Zeroglaze MVP - Deployment Script"

    echo -e "This script will deploy the entire Zeroglaze MVP to ${BLUE}$NETWORK${NC}"
    echo ""
    echo "Steps:"
    echo "  1. Pre-flight checks"
    echo "  2. Deploy Solana program"
    echo "  3. Deploy database migrations"
    echo "  4. Deploy frontend to Vercel"
    echo "  5. Post-deployment verification"
    echo ""

    if ! confirm "Continue with deployment?"; then
        print_info "Deployment cancelled"
        exit 0
    fi

    # Run deployment steps
    preflight_checks
    deploy_program
    deploy_database
    deploy_frontend "$@"
    post_deployment_checks
    print_summary
}

# Run main function
main "$@"
