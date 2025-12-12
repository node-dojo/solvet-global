#!/usr/bin/env bash
# Quick script to update .env with GitHub CLI token
# Usage: ./scripts/update-token-from-gh.sh

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${GREEN}✓${NC} $*"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $*"
}

log_error() {
  echo -e "${RED}✗${NC} $*" >&2
}

# Error handler
error_exit() {
  log_error "$1"
  exit "${2:-1}"
}

# Mask token for display (show first 4 and last 4 chars)
mask_token() {
  local token="$1"
  if [[ ${#token} -le 8 ]]; then
    echo "****"
  else
    echo "${token:0:4}...${token: -4}"
  fi
}

readonly ENV_FILE=".env"
GH_TOKEN=$(gh auth token 2>/dev/null || echo "")

if [[ -z "$GH_TOKEN" ]]; then
  error_exit "No token found. Run: gh auth login"
fi

echo "🔑 Found GitHub CLI token: $(mask_token "$GH_TOKEN")"

# Test token
echo "🧪 Testing token..."
if ! curl -s -f -H "Authorization: token $GH_TOKEN" https://api.github.com/user > /dev/null 2>&1; then
  error_exit "Token is invalid"
fi

# Check scopes
SCOPES=$(curl -s -f -H "Authorization: token $GH_TOKEN" -I https://api.github.com/user 2>/dev/null | grep -i "x-oauth-scopes" | cut -d' ' -f2- | tr -d '\r' || echo "")
echo "📋 Token scopes: $SCOPES"

if echo "$SCOPES" | grep -q "repo"; then
  log_info "Token has 'repo' scope - perfect!"
else
  log_warn "Token may not have 'repo' scope"
  echo "   For private repos, you need a token with 'repo' scope"
  read -p "   Continue anyway? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Update .env
if [[ -f "$ENV_FILE" ]]; then
  # Create backup
  readonly backup_file="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
  if cp "$ENV_FILE" "$backup_file" 2>/dev/null; then
    log_info "Created backup: $backup_file"
  fi
  
  if grep -q "^GITHUB_TOKEN=" "$ENV_FILE"; then
    # Update existing
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^GITHUB_TOKEN=.*|GITHUB_TOKEN=$GH_TOKEN|" "$ENV_FILE"
    else
      sed -i "s|^GITHUB_TOKEN=.*|GITHUB_TOKEN=$GH_TOKEN|" "$ENV_FILE"
    fi
    log_info "Updated GITHUB_TOKEN in .env"
  else
    echo "GITHUB_TOKEN=$GH_TOKEN" >> "$ENV_FILE"
    log_info "Added GITHUB_TOKEN to .env"
  fi
else
  echo "GITHUB_TOKEN=$GH_TOKEN" > "$ENV_FILE"
  log_info "Created .env file with token"
fi

echo ""
log_info "Token updated! Restart dashboard server: npm start"

