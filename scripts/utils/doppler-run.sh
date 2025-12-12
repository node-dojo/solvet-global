#!/bin/bash
# Wrapper script to run commands with Doppler
# Usage: ./scripts/utils/doppler-run.sh <command>
# Example: ./scripts/utils/doppler-run.sh node scripts/update-product-prices.js

set -euo pipefail

# Check if Doppler CLI is installed
if ! command -v doppler &> /dev/null; then
    echo "Error: Doppler CLI is not installed"
    echo "Install with: brew install doppler"
    exit 1
fi

# Check if logged in
if ! doppler me &> /dev/null; then
    echo "Error: Not logged in to Doppler"
    echo "Run: doppler login"
    exit 1
fi

# Run command with Doppler
doppler run -- "$@"



