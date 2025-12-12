#!/usr/bin/env bash
# Initialize the CO-AUG Dashboard submodule (since it's already in .gitmodules)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Initializing CO-AUG Dashboard submodule..."
echo ""

# Since .gitmodules already has the entry, we can initialize it
git submodule update --init --recursive co-aug-dashboard

echo ""
echo "✅ Dashboard submodule initialized successfully!"
echo ""
echo "The dashboard is now available at: solvet-global/co-aug-dashboard/"

