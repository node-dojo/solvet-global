#!/bin/bash
# Update Doppler secrets from .env file
# This script reads ALL secrets from .env and updates Doppler (overwrites existing)

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Doppler CLI is installed
if ! command -v doppler &> /dev/null; then
    log_error "Doppler CLI is not installed"
    echo "Install with: brew install doppler"
    exit 1
fi

# Check if logged in
if ! doppler me &> /dev/null; then
    log_error "Not logged in to Doppler"
    echo "Run: doppler login"
    exit 1
fi

# Check if .env file exists
ENV_FILE="${1:-.env}"
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env file not found: $ENV_FILE"
    exit 1
fi

log_info "Reading secrets from $ENV_FILE..."
echo ""

UPDATED=0
SKIPPED=0
FAILED=0

# Read .env file line by line
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    
    # Parse KEY=VALUE
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        key=$(echo "$key" | xargs)  # Trim whitespace
        value="${BASH_REMATCH[2]}"
        
        # Remove quotes if present
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"
        value=$(echo "$value" | xargs)  # Trim whitespace
        
        # Skip empty values
        if [ -z "$value" ]; then
            log_warn "Skipping $key (empty value)"
            ((SKIPPED++))
            continue
        fi
        
        # Check for placeholder values (case-insensitive)
        value_lower=$(echo "$value" | tr '[:upper:]' '[:lower:]')
        if [[ "$value_lower" == *"your_"* ]] || [[ "$value_lower" == *"placeholder"* ]] || [[ "$value_lower" == *"test_"* ]] || [[ "$value_lower" == *"example"* ]]; then
            log_warn "Skipping $key (appears to be placeholder: $value)"
            ((SKIPPED++))
            continue
        fi
        
        # Update secret in Doppler (this will overwrite if it exists)
        log_info "Updating Doppler: $key"
        if doppler secrets set "${key}=${value}" &> /dev/null; then
            log_success "  ✓ Updated $key"
            ((UPDATED++))
        else
            log_error "  ✗ Failed to update $key"
            ((FAILED++))
        fi
    fi
done < "$ENV_FILE"

echo ""
log_success "Doppler update complete!"
echo ""
echo "Summary:"
echo "  Updated: $UPDATED secrets"
echo "  Skipped: $SKIPPED secrets (empty or placeholders)"
if [ $FAILED -gt 0 ]; then
    echo "  Failed: $FAILED secrets"
fi
echo ""
echo "Verify with: doppler secrets"
echo ""



