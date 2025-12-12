#!/bin/bash
# Sync specific secret from .env to Doppler
# Usage: ./sync-env-to-doppler.sh POLAR_API_TOKEN

set -euo pipefail

SECRET_NAME="${1:-}"
if [ -z "$SECRET_NAME" ]; then
    echo "Usage: $0 <SECRET_NAME>"
    echo "Example: $0 POLAR_API_TOKEN"
    exit 1
fi

# Check if Doppler CLI is installed
if ! command -v doppler &> /dev/null; then
    echo "Error: Doppler CLI is not installed"
    exit 1
fi

# Check if logged in
if ! doppler me &> /dev/null; then
    echo "Error: Not logged in to Doppler"
    echo "Run: doppler login"
    exit 1
fi

# Read from .env
if [ ! -f ".env" ]; then
    echo "Error: .env file not found"
    exit 1
fi

VALUE=$(grep "^${SECRET_NAME}=" .env 2>/dev/null | cut -d'=' -f2- | sed 's/^"//;s/"$//;s/^'\''//;s/'\''$//' || echo "")

if [ -z "$VALUE" ]; then
    echo "Error: $SECRET_NAME not found in .env or is empty"
    exit 1
fi

# Check if it's a placeholder
VALUE_LOWER=$(echo "$VALUE" | tr '[:upper:]' '[:lower:]')
if [[ "$VALUE_LOWER" == *"your_"* ]] || [[ "$VALUE_LOWER" == *"placeholder"* ]] || [[ "$VALUE_LOWER" == *"example"* ]]; then
    echo "Warning: Value appears to be a placeholder"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Updating Doppler: $SECRET_NAME"
if doppler secrets set "${SECRET_NAME}=${VALUE}"; then
    echo "✅ Successfully updated $SECRET_NAME in Doppler"
else
    echo "❌ Failed to update $SECRET_NAME"
    exit 1
fi



