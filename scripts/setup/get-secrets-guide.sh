#!/bin/bash
# Interactive guide for getting environment secrets

echo "🔑 Environment Secrets Setup Guide"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening guides in browser..."
echo ""
echo "1. POLAR_WEBHOOK_SECRET"
open "https://polar.sh/dashboard/settings/webhooks" 2>/dev/null
echo "   → Create webhook → Copy secret"
echo ""
sleep 2
echo "2. GITHUB_TOKEN"
open "https://github.com/settings/tokens" 2>/dev/null
echo "   → Generate new token (classic) → Select 'repo' scope"
echo ""
sleep 2
echo "3. GITHUB_WEBHOOK_SECRET"
open "https://github.com/node-dojo/no3d-tools-library/settings/hooks" 2>/dev/null
echo "   → Add webhook → Generate secret"
echo ""
echo "Full guide: docs/guides/GET_ENV_SECRETS.md"



