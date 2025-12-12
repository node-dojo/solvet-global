#!/usr/bin/env bash
# GitHub Token Setup Helper
# Helps generate and validate GitHub Personal Access Tokens
# Usage: ./scripts/setup-github-token.sh

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

echo "🔑 GitHub Token Setup Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
  error_exit "GitHub CLI (gh) not found. Install: brew install gh"
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
  error_exit "Not authenticated with GitHub CLI. Run: gh auth login"
fi

log_info "GitHub CLI authenticated"
echo ""

# Check current token (if using gh token)
CURRENT_TOKEN=$(gh auth token 2>/dev/null || echo "")

if [[ -n "$CURRENT_TOKEN" ]]; then
  echo "📋 Current GitHub CLI token:"
  echo "   $(mask_token "$CURRENT_TOKEN") (${#CURRENT_TOKEN} chars)"
  echo ""
  
  # Test token
  echo "🧪 Testing token..."
  if curl -s -f -H "Authorization: token $CURRENT_TOKEN" https://api.github.com/user > /dev/null 2>&1; then
    log_info "Token is valid"
    
    # Check if token has repo scope
    echo "   🔍 Checking scopes..."
    RESPONSE=$(curl -s -f -H "Authorization: token $CURRENT_TOKEN" -I https://api.github.com/user 2>/dev/null || echo "")
    SCOPES=$(echo "$RESPONSE" | grep -i "x-oauth-scopes" | cut -d' ' -f2- | tr -d '\r' || echo "unknown")
    echo "   Scopes: $SCOPES"
    
    if echo "$SCOPES" | grep -q "repo"; then
      log_info "Token has 'repo' scope - perfect for private repos!"
      
      # Ask if user wants to use this token
      echo ""
      read -p "💾 Use this token for the dashboard? (y/n) " -n 1 -r
      echo ""
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update .env file
        readonly ENV_FILE=".env"
        if [[ -f "$ENV_FILE" ]]; then
          # Backup
          readonly backup_file="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
          if cp "$ENV_FILE" "$backup_file" 2>/dev/null; then
            log_info "Created backup: $backup_file"
          else
            log_warn "Could not create backup, continuing anyway..."
          fi
          
          # Update token
          if grep -q "^GITHUB_TOKEN=" "$ENV_FILE"; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
              sed -i '' "s|^GITHUB_TOKEN=.*|GITHUB_TOKEN=$CURRENT_TOKEN|" "$ENV_FILE"
            else
              sed -i "s|^GITHUB_TOKEN=.*|GITHUB_TOKEN=$CURRENT_TOKEN|" "$ENV_FILE"
            fi
            log_info "Updated .env file with token"
          else
            echo "GITHUB_TOKEN=$CURRENT_TOKEN" >> "$ENV_FILE"
            log_info "Added GITHUB_TOKEN to .env"
          fi
        else
          echo "GITHUB_TOKEN=$CURRENT_TOKEN" > "$ENV_FILE"
          log_info "Created .env file with token"
        fi
        
        echo ""
        log_info "Next steps:"
        echo "   1. Restart dashboard server: npm start"
        echo "   2. Hard refresh browser: Cmd+Shift+R"
        echo "   3. Test dashboard: http://localhost:8000/dashboard"
      fi
    else
      log_warn "Token doesn't have 'repo' scope"
      echo "   You need to create a new token with 'repo' scope"
    fi
  else
    log_error "Token is invalid or expired"
  fi
else
  log_warn "No token found in GitHub CLI"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 To create a new token manually:"
echo "   1. Visit: https://github.com/settings/tokens"
echo "   2. Click 'Generate new token (classic)'"
echo "   3. Select 'repo' scope"
echo "   4. Copy token and add to .env file:"
echo "      GITHUB_TOKEN=ghp_your_token_here"
echo ""
echo "💡 Or use GitHub CLI to open the page:"
echo "   gh browse --settings tokens"
echo ""

