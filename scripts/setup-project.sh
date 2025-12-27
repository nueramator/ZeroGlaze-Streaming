#!/bin/bash

################################################################################
# Zeroglaze MVP - Project Setup Script
# One-command setup for local development
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

check_prerequisites() {
    print_header "Checking Prerequisites"

    local missing=0

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js $NODE_VERSION installed"
    else
        print_error "Node.js is not installed"
        echo -e "  Install from: ${BLUE}https://nodejs.org${NC}"
        ((missing++))
    fi

    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "npm $NPM_VERSION installed"
    else
        print_error "npm is not installed"
        ((missing++))
    fi

    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | awk '{print $3}')
        print_success "Git $GIT_VERSION installed"
    else
        print_error "Git is not installed"
        echo -e "  Install from: ${BLUE}https://git-scm.com${NC}"
        ((missing++))
    fi

    # Check Rust (optional for Anchor development)
    if command -v rustc &> /dev/null; then
        RUST_VERSION=$(rustc --version | awk '{print $2}')
        print_success "Rust $RUST_VERSION installed"
    else
        print_warning "Rust is not installed (needed for Solana program development)"
        echo -e "  Install from: ${BLUE}https://rustup.rs${NC}"
    fi

    # Check Solana CLI (optional)
    if command -v solana &> /dev/null; then
        SOLANA_VERSION=$(solana --version | awk '{print $2}')
        print_success "Solana CLI $SOLANA_VERSION installed"
    else
        print_warning "Solana CLI is not installed (needed for program deployment)"
        echo -e "  Install: ${BLUE}sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\"${NC}"
    fi

    # Check Anchor CLI (optional)
    if command -v anchor &> /dev/null; then
        ANCHOR_VERSION=$(anchor --version | awk '{print $2}')
        print_success "Anchor CLI $ANCHOR_VERSION installed"
    else
        print_warning "Anchor CLI is not installed (needed for program development)"
        echo -e "  Install: ${BLUE}cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli${NC}"
    fi

    if [ $missing -gt 0 ]; then
        print_error "Please install missing prerequisites before continuing"
        exit 1
    fi
}

setup_env_file() {
    print_header "Setting up Environment Configuration"

    if [ -f "$PROJECT_ROOT/.env" ]; then
        print_warning ".env file already exists"
        read -p "Overwrite? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Keeping existing .env file"
            return
        fi
    fi

    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
    print_success "Created .env file from template"

    echo ""
    print_info "You need to configure the following variables in .env:"
    echo ""
    echo "  Required:"
    echo "    - NEXT_PUBLIC_SUPABASE_URL"
    echo "    - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "    - WEBHOOK_SECRET (generate with: openssl rand -hex 32)"
    echo ""
    echo "  For Twitch integration:"
    echo "    - TWITCH_CLIENT_ID"
    echo "    - TWITCH_CLIENT_SECRET"
    echo ""

    read -p "Open .env file now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} "$PROJECT_ROOT/.env"
    fi
}

install_dependencies() {
    print_header "Installing Dependencies"

    cd "$PROJECT_ROOT"

    print_info "Installing npm packages..."
    npm install --no-optional

    print_success "Dependencies installed"
}

setup_database() {
    print_header "Database Setup"

    print_info "Database migrations need to be run manually on Supabase"
    echo ""
    echo "Steps:"
    echo "  1. Go to https://app.supabase.com"
    echo "  2. Create a new project (if you haven't already)"
    echo "  3. Go to SQL Editor"
    echo "  4. Run: supabase/migrations/001_initial_schema.sql"
    echo "  5. Run: supabase/migrations/002_seed_data.sql"
    echo ""

    read -p "Have you run the migrations? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_success "Database setup complete"
    else
        print_warning "Remember to run migrations before testing"
    fi
}

setup_solana() {
    print_header "Solana Setup"

    if ! command -v solana &> /dev/null; then
        print_warning "Solana CLI not installed, skipping Solana setup"
        return
    fi

    # Configure for devnet
    print_info "Configuring Solana CLI for devnet..."
    solana config set --url https://api.devnet.solana.com

    # Check if wallet exists
    if [ ! -f ~/.config/solana/id.json ]; then
        print_info "Creating new Solana wallet..."
        solana-keygen new --no-bip39-passphrase
    else
        print_success "Existing Solana wallet found"
    fi

    # Get wallet address
    WALLET_ADDRESS=$(solana address)
    print_info "Wallet address: $WALLET_ADDRESS"

    # Check balance
    BALANCE=$(solana balance | awk '{print $1}')
    print_info "Current balance: $BALANCE SOL"

    if (( $(echo "$BALANCE < 1" | bc -l) )); then
        print_info "Requesting airdrop..."
        solana airdrop 2 || print_warning "Airdrop failed, try again later"
    fi

    print_success "Solana setup complete"
}

build_project() {
    print_header "Building Project"

    cd "$PROJECT_ROOT"

    print_info "Running type check..."
    npm run type-check || print_warning "Type check found issues (fix before deploying)"

    print_info "Building Next.js application..."
    npm run build

    print_success "Build completed"
}

print_next_steps() {
    print_header "Setup Complete!"

    echo -e "${GREEN}Your Zeroglaze MVP is ready for development!${NC}\n"
    echo -e "${YELLOW}Next Steps:${NC}\n"
    echo "  1. Configure environment variables in .env"
    echo "  2. Run Supabase migrations (see instructions above)"
    echo "  3. Start development server:"
    echo -e "     ${BLUE}npm run dev${NC}"
    echo ""
    echo "  4. Visit http://localhost:3000"
    echo ""
    echo -e "${YELLOW}For Deployment:${NC}\n"
    echo "  1. Install Vercel CLI:"
    echo -e "     ${BLUE}npm install -g vercel${NC}"
    echo ""
    echo "  2. Deploy to Vercel:"
    echo -e "     ${BLUE}./scripts/deploy-all.sh --prod${NC}"
    echo ""
    echo -e "${YELLOW}Useful Commands:${NC}\n"
    echo -e "  Validate environment:  ${BLUE}./scripts/validate-env.sh${NC}"
    echo -e "  Run migrations:        ${BLUE}./scripts/migrate-db.sh${NC}"
    echo -e "  Deploy program:        ${BLUE}./scripts/deploy-program.sh${NC}"
    echo ""
}

main() {
    clear
    print_header "Zeroglaze MVP - Project Setup"

    check_prerequisites
    setup_env_file
    install_dependencies
    setup_database
    setup_solana
    build_project
    print_next_steps
}

main "$@"
