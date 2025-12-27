#!/bin/bash

################################################################################
# Database Migration Script
# Runs Supabase migrations
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

main() {
    print_header "Supabase Database Migration"

    cd "$PROJECT_ROOT"

    # Check if Supabase CLI is installed
    if command -v supabase &> /dev/null; then
        print_info "Using Supabase CLI..."

        # Run migrations
        print_info "Pushing migrations to Supabase..."
        supabase db push

        print_success "Migrations completed successfully"
    else
        print_warning "Supabase CLI not found"
        echo ""
        print_info "Option 1: Install Supabase CLI"
        echo -e "  ${BLUE}npm install -g supabase${NC}"
        echo ""
        print_info "Option 2: Run migrations manually"
        echo "  1. Go to https://app.supabase.com"
        echo "  2. Open your project"
        echo "  3. Go to SQL Editor"
        echo "  4. Run the following files in order:"
        echo ""

        for migration in "$PROJECT_ROOT/supabase/migrations"/*.sql; do
            if [ -f "$migration" ]; then
                echo -e "     - ${BLUE}$(basename "$migration")${NC}"
            fi
        done

        echo ""
        print_info "Migration files are located in: supabase/migrations/"

        echo ""
        read -p "Have you run the migrations manually? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_success "Migration confirmed"
        else
            print_warning "Remember to run migrations before using the app"
            exit 1
        fi
    fi

    # Verify connection
    print_info "Verifying database connection..."

    # Load environment variables
    if [ -f "$PROJECT_ROOT/.env" ]; then
        export $(cat "$PROJECT_ROOT/.env" | grep NEXT_PUBLIC_SUPABASE_URL | xargs)

        if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
            # Simple health check
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" || echo "000")

            if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "401" ]; then
                print_success "Database connection verified"
            else
                print_warning "Could not verify database connection (HTTP $HTTP_CODE)"
            fi
        fi
    fi

    print_header "Migration Summary"
    echo -e "${GREEN}Database migrations completed!${NC}\n"
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Verify tables in Supabase dashboard"
    echo "2. Check that seed data is loaded"
    echo "3. Test API endpoints"
    echo ""
}

main "$@"
