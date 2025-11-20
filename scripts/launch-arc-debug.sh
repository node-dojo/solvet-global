#!/bin/bash
# Launch Arc browser with remote debugging enabled for MCP

# Check if Arc is already running
if pgrep -f "Arc.*--remote-debugging-port" > /dev/null; then
    echo "Arc is already running with remote debugging enabled."
    exit 0
fi

# Check if Arc is running without debugging
if pgrep -f "Arc.app" > /dev/null; then
    echo "Arc is running but without remote debugging."
    echo "Please close Arc completely and run this script again."
    exit 1
fi

# Find Arc installation
ARC_PATH="/Applications/Arc.app/Contents/MacOS/Arc"

if [ ! -f "$ARC_PATH" ]; then
    echo "Arc not found at $ARC_PATH"
    echo "Searching for Arc installation..."
    ARC_PATH=$(mdfind -name Arc.app | head -1)
    if [ -z "$ARC_PATH" ]; then
        echo "Error: Arc browser not found."
        echo "Please install Arc or update the ARC_PATH in this script."
        exit 1
    fi
    ARC_PATH="$ARC_PATH/Contents/MacOS/Arc"
fi

echo "Launching Arc with remote debugging on port 9222..."
"$ARC_PATH" --remote-debugging-port=9222 > /dev/null 2>&1 &

# Wait a moment for Arc to start
sleep 2

# Verify remote debugging is active
if curl -s http://localhost:9222/json/version > /dev/null 2>&1; then
    echo "✓ Arc launched successfully with remote debugging enabled"
    echo "✓ Remote debugging is active on port 9222"
    echo ""
    echo "You can now use browser MCP tools in Cursor."
    echo "Make sure to restart Cursor if it's already running."
else
    echo "⚠ Warning: Remote debugging might not be active yet."
    echo "   Try again in a few seconds, or check if port 9222 is available."
fi


