#!/bin/bash
# Migrate .env file to Doppler
# Reads existing .env file and uploads all secrets to Doppler

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
        error_exit "Doppler CLI is not installed. Install with: brew install doppler"
    fi
}

# Check if .env file exists
check_env_file() {
    local env_file="${1:-.env}"
    
    if [ ! -f "$env_file" ]; then
        error_exit ".env file not found: $env_file"
    fi
    
    log_success "Found .env file: $env_file"
}

# Parse .env file and upload to Doppler
migrate_secrets() {
    local env_file="${1:-.env}"
    local backup_file="${env_file}.backup.$(date +%Y%m%d_%H%M%S)"
    local secrets_count=0
    local skipped_count=0
    
    log_info "Reading secrets from $env_file..."
    echo ""
    
    # Create backup
    cp "$env_file" "$backup_file"
    log_success "Created backup: $backup_file"
    echo ""
    
    # Read .env file line by line
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Parse KEY=VALUE
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"
            
            # Remove quotes if present
            value="${value#\"}"
            value="${value%\"}"
            value="${value#\'}"
            value="${value%\'}"
            
            # Skip empty values
            if [ -z "$value" ]; then
                log_warn "Skipping empty: $key"
                ((skipped_count++))
                continue
            fi
            
            # Check if secret already exists in Doppler
            if doppler secrets get "$key" --plain &> /dev/null; then
                log_warn "Secret already exists: $key (skipping)"
                ((skipped_count++))
                continue
            fi
            
            # Set secret in Doppler
            log_info "Migrating: $key"
            if doppler secrets set "$key=$value" &> /dev/null; then
                log_success "  ✓ Set $key"
                ((secrets_count++))
            else
                log_error "  ✗ Failed to set $key"
            fi
        fi
    done < "$env_file"
    
    echo ""
    log_success "Migration complete!"
    echo "  Migrated: $secrets_count secrets"
    echo "  Skipped: $skipped_count secrets (empty or already exist)"
    echo "  Backup: $backup_file"
}

# Verify migration
verify_migration() {
    log_info "Verifying migration..."
    echo ""
    doppler secrets
    echo ""
}

# Optional: Remove .env file
prompt_remove_env() {
    local env_file="${1:-.env}"
    
    echo ""
    log_warn "Your .env file has been backed up."
    read -p "Remove original .env file? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm "$env_file"
        log_success "Removed $env_file"
        log_info "You can restore from backup if needed"
    else
        log_info "Keeping $env_file (you can remove it manually later)"
    fi
}

# Main execution
main() {
    local env_file="${1:-.env}"
    
    echo ""
    log_info "Migrating .env to Doppler"
    echo "============================"
    echo ""
    
    check_doppler_cli
    
    # Check if logged in
    if ! doppler me &> /dev/null; then
        log_warn "Not logged in to Doppler"
        echo "Logging in..."
        doppler login
    fi
    
    check_env_file "$env_file"
    migrate_secrets "$env_file"
    verify_migration
    prompt_remove_env "$env_file"
    
    echo ""
    log_success "Done! Use 'doppler run --' to run scripts with secrets."
    echo "See docs/guides/DOPPLER_SETUP.md for more information."
}

# Run main
main "$@"



