#!/bin/bash

################################################################################
# Environment Validation Script
# Validates that all required environment variables are set correctly
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

check_var() {
    local var_name=$1
    local var_value="${!var_name}"
    local required=$2
    local description=$3

    if [ -z "$var_value" ]; then
        if [ "$required" == "true" ]; then
            echo -e "${RED}✗ $var_name${NC} - Missing (required)"
            echo -e "  ${YELLOW}Description:${NC} $description"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ $var_name${NC} - Missing (optional)"
            echo -e "  ${YELLOW}Description:${NC} $description"
            ((WARNINGS++))
        fi
    else
        echo -e "${GREEN}✓ $var_name${NC} - Set"

        # Validate format for specific variables
        case $var_name in
            NEXT_PUBLIC_SUPABASE_URL)
                if [[ ! $var_value =~ ^https://.*\.supabase\.co$ ]]; then
                    echo -e "  ${YELLOW}Warning:${NC} URL format looks incorrect"
                    ((WARNINGS++))
                fi
                ;;
            NEXT_PUBLIC_PROGRAM_ID)
                if [ ${#var_value} -lt 32 ]; then
                    echo -e "  ${YELLOW}Warning:${NC} Program ID looks too short"
                    ((WARNINGS++))
                fi
                ;;
            SOLANA_NETWORK)
                if [[ ! $var_value =~ ^(devnet|testnet|mainnet-beta)$ ]]; then
                    echo -e "  ${RED}Error:${NC} Must be devnet, testnet, or mainnet-beta"
                    ((ERRORS++))
                fi
                ;;
        esac
    fi
}

main() {
    print_header "Environment Configuration Validation"

    # Load .env file
    if [ -f .env ]; then
        echo -e "${GREEN}Found .env file${NC}\n"
        export $(cat .env | grep -v '^#' | xargs)
    else
        echo -e "${RED}No .env file found!${NC}"
        echo -e "${YELLOW}Create one from .env.example:${NC} cp .env.example .env\n"
        exit 1
    fi

    print_header "Supabase Configuration"
    check_var "NEXT_PUBLIC_SUPABASE_URL" true "Supabase project URL"
    check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" true "Supabase anonymous key for client-side"
    check_var "SUPABASE_SERVICE_ROLE_KEY" false "Supabase service role key for admin operations"

    print_header "Solana Configuration"
    check_var "SOLANA_RPC_ENDPOINT" true "Solana RPC endpoint URL"
    check_var "SOLANA_NETWORK" true "Solana network (devnet/mainnet-beta)"
    check_var "NEXT_PUBLIC_PROGRAM_ID" true "Deployed Solana program ID"
    check_var "PLATFORM_FEE_WALLET" false "Wallet receiving platform fees"
    check_var "AUTHORITY_KEYPAIR" false "Authority keypair for admin operations"

    print_header "Twitch Integration"
    check_var "TWITCH_CLIENT_ID" false "Twitch application client ID"
    check_var "TWITCH_CLIENT_SECRET" false "Twitch application secret"
    check_var "TWITCH_WEBHOOK_CALLBACK" false "Webhook URL for stream status updates"

    print_header "Security"
    check_var "WEBHOOK_SECRET" true "Secret for webhook validation"
    check_var "JWT_SECRET" false "JWT signing secret"

    print_header "Application"
    check_var "NEXT_PUBLIC_APP_URL" true "Application URL"
    check_var "NODE_ENV" false "Node environment (development/production)"

    print_header "Feature Flags"
    check_var "ENABLE_TWITCH_WEBHOOKS" false "Enable Twitch webhook integration"
    check_var "ENABLE_RATE_LIMITING" false "Enable API rate limiting"

    # Summary
    print_header "Validation Summary"

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ All required environment variables are properly configured!${NC}\n"
        exit 0
    elif [ $ERRORS -eq 0 ]; then
        echo -e "${YELLOW}⚠ Configuration valid but has $WARNINGS warnings${NC}\n"
        exit 0
    else
        echo -e "${RED}✗ Found $ERRORS errors and $WARNINGS warnings${NC}"
        echo -e "${YELLOW}Please fix the errors before deploying${NC}\n"
        exit 1
    fi
}

main "$@"
