#!/usr/bin/env bash
# Setup script for Polar MCP in Cursor
# Usage: POLAR_API_TOKEN='your_token' ./scripts/setup/setup-polar-mcp.sh

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

# Validate POLAR_API_TOKEN is set
if [[ -z "${POLAR_API_TOKEN:-}" ]]; then
  log_error "POLAR_API_TOKEN environment variable is not set"
  echo ""
  echo "Please set it using:"
  echo "  export POLAR_API_TOKEN='polar_oat_...'"
  echo ""
  echo "You can get your token from: https://polar.sh/settings/api"
  exit 1
fi

# Validate token format (basic check)
if [[ ! "${POLAR_API_TOKEN}" =~ ^polar_ ]]; then
  log_warn "Token doesn't start with 'polar_' - this may not be a valid Polar token"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

readonly MCP_CONFIG=".mcp.json"

# Create backup if config exists
if [[ -f "$MCP_CONFIG" ]]; then
  readonly backup_file="${MCP_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
  if cp "$MCP_CONFIG" "$backup_file" 2>/dev/null; then
    log_info "Created backup: $backup_file"
  else
    log_warn "Could not create backup, continuing anyway..."
  fi
fi

# Update the config with the actual token
# Note: This stores the token in the file. For better security, consider using
# a secrets manager or environment variable interpolation if Cursor supports it.
if ! cat > "$MCP_CONFIG" <<EOF
{
  "mcpServers": {
    "Polar": {
      "type": "http",
      "url": "https://mcp.polar.sh/mcp/polar-mcp",
      "headers": {
        "Authorization": "Bearer ${POLAR_API_TOKEN}"
      }
    }
  }
}
EOF
then
  error_exit "Failed to write configuration file"
fi

log_info "Polar MCP configured successfully"
echo ""
echo "Configuration file: $MCP_CONFIG"
echo "API Token: $(mask_token "${POLAR_API_TOKEN}")"
echo ""
log_warn "Next steps:"
echo "1. Restart Cursor to apply the changes"
echo "2. Verify the connection works"
echo ""
log_warn "Security Note:"
echo "  - Your token is stored in $MCP_CONFIG"
echo "  - Make sure this file is in your .gitignore!"
echo "  - Never commit this file to version control"


