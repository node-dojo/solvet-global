#!/bin/bash

# GitHub Token Setup Helper
# Helps generate and validate GitHub Personal Access Tokens

set -e

echo "🔑 GitHub Token Setup Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found"
    echo "   Install: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "⚠️  Not authenticated with GitHub CLI"
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Check current token (if using gh token)
CURRENT_TOKEN=$(gh auth token 2>/dev/null || echo "")

if [ -n "$CURRENT_TOKEN" ]; then
    echo "📋 Current GitHub CLI token:"
    echo "   ${CURRENT_TOKEN:0:15}... (${#CURRENT_TOKEN} chars)"
    echo ""
    
    # Test token
    echo "🧪 Testing token..."
    if curl -s -H "Authorization: token $CURRENT_TOKEN" https://api.github.com/user > /dev/null; then
        echo "   ✅ Token is valid"
        
        # Check if token has repo scope
        echo "   🔍 Checking scopes..."
        RESPONSE=$(curl -s -H "Authorization: token $CURRENT_TOKEN" -I https://api.github.com/user)
        SCOPES=$(echo "$RESPONSE" | grep -i "x-oauth-scopes" | cut -d' ' -f2- || echo "unknown")
        echo "   Scopes: $SCOPES"
        
        if echo "$SCOPES" | grep -q "repo"; then
            echo "   ✅ Token has 'repo' scope - perfect for private repos!"
            
            # Ask if user wants to use this token
            echo ""
            read -p "💾 Use this token for the dashboard? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                # Update .env file
                ENV_FILE=".env"
                if [ -f "$ENV_FILE" ]; then
                    # Backup
                    cp "$ENV_FILE" "${ENV_FILE}.backup"
                    
                    # Update token
                    if grep -q "^GITHUB_TOKEN=" "$ENV_FILE"; then
                        sed -i '' "s|^GITHUB_TOKEN=.*|GITHUB_TOKEN=$CURRENT_TOKEN|" "$ENV_FILE"
                    else
                        echo "GITHUB_TOKEN=$CURRENT_TOKEN" >> "$ENV_FILE"
                    fi
                    
                    echo "✅ Updated .env file with token"
                    echo "   Backup saved to: ${ENV_FILE}.backup"
                else
                    echo "GITHUB_TOKEN=$CURRENT_TOKEN" > "$ENV_FILE"
                    echo "✅ Created .env file with token"
                fi
                
                echo ""
                echo "🚀 Next steps:"
                echo "   1. Restart dashboard server: npm start"
                echo "   2. Hard refresh browser: Cmd+Shift+R"
                echo "   3. Test dashboard: http://localhost:8000/dashboard"
            fi
        else
            echo "   ⚠️  Token doesn't have 'repo' scope"
            echo "   You need to create a new token with 'repo' scope"
        fi
    else
        echo "   ❌ Token is invalid or expired"
    fi
else
    echo "⚠️  No token found in GitHub CLI"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 To create a new token manually:"
echo "   1. Visit: https://github.com/settings/tokens"
echo "   2. Click 'Generate new token (classic)'"
echo "   3. Select 'repo' scope"
echo "   4. Copy token and add to .env file:"
echo "      GITHUB_TOKEN=ghp_your_token_here"
echo ""
echo "💡 Or use GitHub CLI to open the page:"
echo "   gh browse --settings tokens"
echo ""

