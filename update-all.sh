#!/usr/bin/env bash
# Updates all repositories in the SOLVET System workspace
# Usage: ./update-all.sh

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
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

log_info "Updating all repositories..."
echo ""

readonly repos=("solvet-system" "no3d-tools-library" "no3d-tools-website" "no3d-tools-addon" "co-aug-dashboard")
readonly start_dir="${PWD}"
failed_repos=()

for repo in "${repos[@]}"; do
  if [[ ! -d "$repo" ]]; then
    log_warn "Directory $repo not found - skipping"
    echo ""
    continue
  fi

  echo "=================================================="
  log_info "Updating $repo"
  echo "=================================================="
  
  if ! cd "$repo"; then
    log_error "Failed to change to directory: $repo"
    failed_repos+=("$repo")
    cd "$start_dir" || error_exit "Failed to return to start directory"
    continue
  fi

  # Validate git repository
  if [[ ! -d ".git" ]]; then
    log_warn "$repo is not a git repository - skipping"
    cd "$start_dir" || error_exit "Failed to return to start directory"
    continue
  fi

  # Stash any local changes
  stashed=false
  if [[ -n $(git status -s 2>/dev/null || echo "") ]]; then
    log_warn "Stashing local changes..."
    if git stash push -m "Auto-stash by update-all.sh $(date +%Y-%m-%d)" 2>/dev/null; then
      stashed=true
    else
      log_warn "Failed to stash changes, continuing anyway..."
    fi
  fi

  # Fetch and pull
  if ! git fetch --all --quiet 2>/dev/null; then
    log_error "Failed to fetch for $repo"
    failed_repos+=("$repo")
    if [[ "$stashed" = true ]]; then
      git stash pop --quiet 2>/dev/null || true
    fi
    cd "$start_dir" || error_exit "Failed to return to start directory"
    continue
  fi

  current_branch=$(git branch --show-current 2>/dev/null || echo "unknown")
  log_info "On branch: $current_branch"

  if ! git pull origin "$current_branch" --quiet 2>/dev/null; then
    log_error "Failed to pull for $repo"
    failed_repos+=("$repo")
  fi

  # Pop stash if we stashed
  if [[ "$stashed" = true ]]; then
    log_info "Restoring stashed changes..."
    if ! git stash pop --quiet 2>/dev/null; then
      log_warn "Stash pop had conflicts, manual resolution may be needed"
    fi
  fi

  cd "$start_dir" || error_exit "Failed to return to start directory"
  echo ""
done

if [[ ${#failed_repos[@]} -eq 0 ]]; then
  log_info "All repos updated successfully!"
else
  log_error "Some repos failed to update: ${failed_repos[*]}"
  exit 1
fi

echo ""
log_info "Tip: Run ./status-all.sh to see the status of all repos"
