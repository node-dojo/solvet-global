#!/bin/bash
# Interactive script to update Doppler POLAR_API_TOKEN

set -euo pipefail

echo "🔑 Update Doppler POLAR_API_TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Doppler CLI is installed
if ! command -v doppler &> /dev/null; then
    echo "❌ Doppler CLI is not installed"
    echo "Install with: brew install doppler"
    exit 1
fi

# Check if logged in
if ! doppler me &> /dev/null; then
    echo "❌ Not logged in to Doppler"
    echo "Run: doppler login"
    exit 1
fi

# Try to read from .env first
if [ -f ".env" ]; then
    ENV_TOKEN=$(grep "^POLAR_API_TOKEN=" .env 2>/dev/null | cut -d'=' -f2- | sed 's/^"//;s/"$//;s/^'\''//;s/'\''$//' || echo "")
    
    if [ -n "$ENV_TOKEN" ] && [[ ! "$ENV_TOKEN" =~ your_|placeholder|example ]]; then
        echo "✅ Found token in .env file"
        read -p "Use token from .env? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            TOKEN="$ENV_TOKEN"
        fi
    fi
fi

# Prompt for token if not set
if [ -z "${TOKEN:-}" ]; then
    echo ""
    echo "Enter your Polar API token:"
    echo "  Format: polar_oat_xxxxxxxxxxxxxxxxx"
    echo "  Get from: https://polar.sh/dashboard/settings/api"
    echo ""
    read -sp "Token: " TOKEN
    echo
    echo ""
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Token cannot be empty"
    exit 1
fi

# Validate token format
if [[ ! "$TOKEN" =~ ^polar_oat_ ]]; then
    echo "⚠️  Warning: Token doesn't start with 'polar_oat_'"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update Doppler
echo "🔄 Updating Doppler..."
if doppler secrets set "POLAR_API_TOKEN=$TOKEN"; then
    echo ""
    echo "✅ Successfully updated POLAR_API_TOKEN in Doppler"
    echo ""
    echo "Verify with: doppler secrets get POLAR_API_TOKEN --plain"
    echo ""
else
    echo ""
    echo "❌ Failed to update Doppler"
    exit 1
fi



