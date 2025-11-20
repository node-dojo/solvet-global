#!/bin/bash

# Quick script to update .env with GitHub CLI token

set -e

ENV_FILE=".env"
GH_TOKEN=$(gh auth token 2>/dev/null)

if [ -z "$GH_TOKEN" ]; then
    echo "❌ No token found. Run: gh auth login"
    exit 1
fi

echo "🔑 Found GitHub CLI token: ${GH_TOKEN:0:15}..."

# Test token
echo "🧪 Testing token..."
if ! curl -s -H "Authorization: token $GH_TOKEN" https://api.github.com/user > /dev/null; then
    echo "❌ Token is invalid"
    exit 1
fi

# Check scopes
SCOPES=$(curl -s -H "Authorization: token $GH_TOKEN" -I https://api.github.com/user | grep -i "x-oauth-scopes" | cut -d' ' -f2- | tr -d '\r' || echo "")
echo "📋 Token scopes: $SCOPES"

if echo "$SCOPES" | grep -q "repo"; then
    echo "✅ Token has 'repo' scope - perfect!"
else
    echo "⚠️  Token may not have 'repo' scope"
    echo "   For private repos, you need a token with 'repo' scope"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update .env
if [ -f "$ENV_FILE" ]; then
    if grep -q "^GITHUB_TOKEN=" "$ENV_FILE"; then
        # Update existing
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^GITHUB_TOKEN=.*|GITHUB_TOKEN=$GH_TOKEN|" "$ENV_FILE"
        else
            sed -i "s|^GITHUB_TOKEN=.*|GITHUB_TOKEN=$GH_TOKEN|" "$ENV_FILE"
        fi
        echo "✅ Updated GITHUB_TOKEN in .env"
    else
        echo "GITHUB_TOKEN=$GH_TOKEN" >> "$ENV_FILE"
        echo "✅ Added GITHUB_TOKEN to .env"
    fi
else
    echo "GITHUB_TOKEN=$GH_TOKEN" > "$ENV_FILE"
    echo "✅ Created .env file with token"
fi

echo ""
echo "🚀 Token updated! Restart dashboard server: npm start"

