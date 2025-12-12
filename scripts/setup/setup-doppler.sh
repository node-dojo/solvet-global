#!/bin/bash
# Doppler Setup Script for SOLVET Global
# Helps initialize Doppler and configure all required secrets

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

error_exit() {
    log_error "$1"
    exit 1
}

# Check if Doppler CLI is installed
check_doppler_cli() {
    if ! command -v doppler &> /dev/null; then
        log_error "Doppler CLI is not installed"
        echo ""
        echo "Install with:"
        echo "  brew install doppler"
        echo "  or"
        echo "  npm install -g doppler-cli"
        exit 1
    fi
    log_success "Doppler CLI found: $(doppler --version)"
}

# Check if user is logged in
check_doppler_auth() {
    if ! doppler me &> /dev/null; then
        log_warn "Not logged in to Doppler"
        echo ""
        echo "Logging in..."
        doppler login
    else
        log_success "Logged in to Doppler"
        doppler me | head -1
    fi
}

# Create or select project
setup_project() {
    local project_name="solvet-global"
    
    log_info "Setting up Doppler project: $project_name"
    
    # Check if project exists
    if doppler projects get "$project_name" &> /dev/null; then
        log_success "Project '$project_name' already exists"
    else
        log_info "Creating project '$project_name'..."
        doppler projects create "$project_name" || error_exit "Failed to create project"
        log_success "Project created"
    fi
    
    # Setup project and config
    log_info "Configuring Doppler..."
    doppler setup --project "$project_name" --config dev --no-interactive || {
        log_warn "Setup failed, trying interactive mode..."
        doppler setup --project "$project_name" --config dev
    }
    
    log_success "Doppler configured for project: $project_name (config: dev)"
}

# Prompt for secret value
prompt_secret() {
    local secret_name=$1
    local description=$2
    local current_value
    
    echo ""
    log_info "Setting: $secret_name"
    echo "  Description: $description"
    
    # Check if secret already exists
    current_value=$(doppler secrets get "$secret_name" --plain 2>/dev/null || echo "")
    
    if [ -n "$current_value" ]; then
        log_warn "Secret already exists (masked: ${current_value:0:4}...${current_value: -4})"
        read -p "  Update? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping $secret_name"
            return 0
        fi
    fi
    
    read -sp "  Enter value: " secret_value
    echo
    
    if [ -z "$secret_value" ]; then
        log_warn "Empty value, skipping..."
        return 0
    fi
    
    doppler secrets set "$secret_name=$secret_value" || error_exit "Failed to set $secret_name"
    log_success "Set $secret_name"
}

# Setup all required secrets
setup_secrets() {
    log_info "Setting up required secrets..."
    echo ""
    echo "You'll be prompted to enter each secret value."
    echo "Press Enter to skip if you don't have it yet."
    echo ""
    
    # Polar secrets
    prompt_secret "POLAR_API_TOKEN" "Polar API access token (get from https://polar.sh/settings/api)"
    prompt_secret "POLAR_ORG_ID" "Polar organization ID (UUID from Polar settings)"
    prompt_secret "POLAR_WEBHOOK_SECRET" "Polar webhook secret (from webhook configuration)"
    
    # GitHub secrets
    prompt_secret "GITHUB_TOKEN" "GitHub Personal Access Token (with 'repo' scope)"
    prompt_secret "GITHUB_WEBHOOK_SECRET" "GitHub webhook secret (from webhook configuration)"
    
    # Vercel secrets (optional)
    echo ""
    read -p "Set up Vercel secrets? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        prompt_secret "VERCEL_TOKEN" "Vercel API token"
        prompt_secret "VERCEL_ORG_ID" "Vercel organization ID"
        prompt_secret "VERCEL_PROJECT_ID" "Vercel project ID"
    fi
}

# Create .doppler.yaml
create_doppler_config() {
    local project_name="solvet-global"
    
    log_info "Creating .doppler.yaml..."
    
    cat > .doppler.yaml <<EOF
setup:
  project: $project_name
  config: dev
EOF
    
    log_success "Created .doppler.yaml"
}

# Verify setup
verify_setup() {
    log_info "Verifying setup..."
    echo ""
    
    # List all secrets
    doppler secrets
    
    echo ""
    log_success "Setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Test with: doppler run -- node scripts/update-product-prices.js"
    echo "  2. View secrets: doppler secrets"
    echo "  3. Download .env: doppler secrets download --no-file --format env > .env.local"
    echo ""
    echo "For more info, see: docs/guides/DOPPLER_SETUP.md"
}

# Main execution
main() {
    echo ""
    log_info "Doppler Setup for SOLVET Global"
    echo "===================================="
    echo ""
    
    check_doppler_cli
    check_doppler_auth
    setup_project
    setup_secrets
    create_doppler_config
    verify_setup
}

# Run main
main





