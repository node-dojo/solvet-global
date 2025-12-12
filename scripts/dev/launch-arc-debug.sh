#!/usr/bin/env bash
# Launch Arc browser with remote debugging enabled for MCP
# Usage: ./scripts/launch-arc-debug.sh

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

readonly DEBUG_PORT=9222

# Check if Arc is already running with debugging
if pgrep -f "Arc.*--remote-debugging-port" > /dev/null 2>&1; then
  log_info "Arc is already running with remote debugging enabled"
  exit 0
fi

# Check if Arc is running without debugging
if pgrep -f "Arc.app" > /dev/null 2>&1; then
  log_warn "Arc is running but without remote debugging"
  echo "Please close Arc completely and run this script again"
  exit 1
fi

# Find Arc installation
ARC_PATH="/Applications/Arc.app/Contents/MacOS/Arc"

if [[ ! -f "$ARC_PATH" ]]; then
  log_warn "Arc not found at $ARC_PATH"
  echo "Searching for Arc installation..."
  found_path=$(mdfind -name Arc.app 2>/dev/null | head -1 || echo "")
  if [[ -z "$found_path" ]]; then
    error_exit "Arc browser not found. Please install Arc or update the ARC_PATH in this script"
  fi
  ARC_PATH="$found_path/Contents/MacOS/Arc"
  
  if [[ ! -f "$ARC_PATH" ]]; then
    error_exit "Arc executable not found at: $ARC_PATH"
  fi
fi

log_info "Launching Arc with remote debugging on port $DEBUG_PORT..."
if ! "$ARC_PATH" --remote-debugging-port="$DEBUG_PORT" > /dev/null 2>&1 &; then
  error_exit "Failed to launch Arc"
fi

# Wait a moment for Arc to start
sleep 2

# Verify remote debugging is active
if curl -s -f "http://localhost:$DEBUG_PORT/json/version" > /dev/null 2>&1; then
  log_info "Arc launched successfully with remote debugging enabled"
  log_info "Remote debugging is active on port $DEBUG_PORT"
  echo ""
  echo "You can now use browser MCP tools in Cursor."
  echo "Make sure to restart Cursor if it's already running."
else
  log_warn "Remote debugging might not be active yet"
  echo "   Try again in a few seconds, or check if port $DEBUG_PORT is available"
  exit 1
fi


