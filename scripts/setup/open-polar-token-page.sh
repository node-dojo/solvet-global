#!/usr/bin/env bash

# Open Polar API Token Generation Page
# This script opens the Polar dashboard page for generating API tokens

echo "🔑 Opening Polar API Token Generation Page..."
echo ""
echo "If the browser doesn't open automatically, visit:"
echo "https://polar.sh/dashboard/settings/api"
echo ""

# Try to open in default browser
if command -v open >/dev/null 2>&1; then
    # macOS
    open "https://polar.sh/dashboard/settings/api"
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "https://polar.sh/dashboard/settings/api"
elif command -v start >/dev/null 2>&1; then
    # Windows
    start "https://polar.sh/dashboard/settings/api"
else
    echo "Could not open browser automatically."
    echo "Please visit: https://polar.sh/dashboard/settings/api"
fi

echo ""
echo "📋 Required Scopes:"
echo "  - products (read + write)"
echo "  - subscriptions (read)"
echo "  - checkout (read + write)"
echo "  - customers (read)"
echo "  - webhooks (read + write)"
echo ""
echo "After generating the token:"
echo "  1. Copy the token (format: polar_oat_...)"
echo "  2. Update .env: POLAR_API_TOKEN=your_token_here"
echo "  3. Run: node scripts/setup/refresh-polar-mcp.js"
echo "  4. Restart Cursor"
echo ""
