#!/usr/bin/env bash
# Check status of all repos in the SOLVET System workspace
# Usage: ./status-all.sh

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${GREEN}ℹ${NC} $*"
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

# Validate we're in the right directory
if [[ ! -f "README.md" ]]; then
  error_exit "This script must be run from the solvet-global root directory"
fi

echo "📊 Status of all repositories"
echo "=============================="
echo ""

readonly repos=("solvet-system" "no3d-tools-library" "no3d-tools-website" "no3d-tools-addon" "co-aug-dashboard")
readonly start_dir="${PWD}"

for repo in "${repos[@]}"; do
  if [[ ! -d "$repo" ]]; then
    log_warn "Directory $repo not found"
    echo ""
    continue
  fi

  echo "=================================================="
  echo "📦 $repo"
  echo "=================================================="
  
  if ! cd "$repo" 2>/dev/null; then
    log_error "Failed to change to directory: $repo"
    cd "$start_dir" || error_exit "Failed to return to start directory"
    continue
  fi

  # Validate git repository
  if [[ ! -d ".git" ]]; then
    log_warn "$repo is not a git repository"
    cd "$start_dir" || error_exit "Failed to return to start directory"
    echo ""
    continue
  fi

  # Show current branch
  branch=$(git branch --show-current 2>/dev/null || echo "unknown")
  echo "🌿 Branch: $branch"

  # Show remote (sanitize URL to avoid exposing tokens)
  remote=$(git remote get-url origin 2>/dev/null || echo "")
  if [[ -n "$remote" ]]; then
    # Mask any potential tokens in URL
    sanitized_remote=$(echo "$remote" | sed 's/:[^@]*@/:***@/g')
    echo "🔗 Remote: $sanitized_remote"
  else
    log_warn "No remote configured"
  fi

  # Show status
  status=$(git status -s 2>/dev/null || echo "")
  if [[ -z "$status" ]]; then
    log_info "Clean working tree"
  else
    echo "📝 Changes:"
    git status -s 2>/dev/null || log_warn "Could not get git status"
  fi

  # Show commits ahead/behind
  if [[ -n "$remote" ]]; then
    if git fetch --quiet 2>/dev/null; then
      ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
      behind=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")

      if [[ -n "$ahead" ]] && [[ "$ahead" -gt 0 ]]; then
        echo "⬆️  $ahead commit(s) ahead of remote"
      fi
      if [[ -n "$behind" ]] && [[ "$behind" -gt 0 ]]; then
        echo "⬇️  $behind commit(s) behind remote"
      fi
      if [[ "${ahead:-0}" = "0" ]] && [[ "${behind:-0}" = "0" ]]; then
        log_info "Up to date with remote"
      fi
    else
      log_warn "Could not fetch remote status"
    fi
  fi

  # Show last commit
  echo "📝 Last commit:"
  if git log -1 --pretty=format:"   %h - %s (%an, %ar)" 2>/dev/null; then
    echo ""
  else
    log_warn "Could not get commit history"
    echo ""
  fi

  cd "$start_dir" || error_exit "Failed to return to start directory"
  echo ""
done

echo "=================================================="
echo "💡 Tips:"
echo "  - Run ./update-all.sh to pull latest from all repos"
echo "  - Open workspace: cursor .vscode/solvet.code-workspace"
