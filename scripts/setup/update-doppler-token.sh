#!/bin/bash
# Update Doppler POLAR_API_TOKEN
# Usage: ./update-doppler-token.sh <token>
#   or: POLAR_TOKEN=polar_oat_xxx ./update-doppler-token.sh

set -euo pipefail

TOKEN="${1:-${POLAR_TOKEN:-}}"

if [ -z "$TOKEN" ]; then
    echo "Usage: $0 <polar_api_token>"
    echo "   or: POLAR_TOKEN=polar_oat_xxx $0"
    echo ""
    echo "Get token from: https://polar.sh/dashboard/settings/api"
    exit 1
fi

# Check if Doppler CLI is installed
if ! command -v doppler &> /dev/null; then
    echo "❌ Doppler CLI is not installed"
    exit 1
fi

# Check if logged in
if ! doppler me &> /dev/null; then
    echo "❌ Not logged in to Doppler"
    echo "Run: doppler login"
    exit 1
fi

echo "🔄 Updating Doppler POLAR_API_TOKEN..."
echo "   Token preview: ${TOKEN:0:15}..."

if doppler secrets set "POLAR_API_TOKEN=$TOKEN"; then
    echo ""
    echo "✅ Successfully updated POLAR_API_TOKEN in Doppler"
    echo ""
    echo "Verify: doppler secrets get POLAR_API_TOKEN --plain | head -c 20"
else
    echo ""
    echo "❌ Failed to update Doppler"
    exit 1
fi



