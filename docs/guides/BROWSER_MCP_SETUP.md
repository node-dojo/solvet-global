# Browser MCP Setup Guide

This guide helps you configure the Chrome DevTools MCP server to work with Arc browser in Cursor.

## Overview

The browser MCP server allows Cursor to interact with your browser (Arc) using Chrome DevTools Protocol (CDP). This enables features like:
- Taking snapshots of the current page
- Navigating to URLs
- Clicking elements
- Typing into forms
- Reading console messages
- Viewing network requests

## Prerequisites

- Arc browser installed
- Cursor IDE with MCP support
- Node.js installed (for some MCP servers)

## Step 1: Enable Remote Debugging in Arc

Arc browser needs to be launched with remote debugging enabled. You have two options:

### Option A: Launch Arc with Debugging Flag (Recommended)

1. **Close Arc browser completely** (make sure no Arc processes are running)

2. **Launch Arc from Terminal with debugging enabled:**
   ```bash
   /Applications/Arc.app/Contents/MacOS/Arc --remote-debugging-port=9222
   ```

3. **Or create an alias** (add to your `~/.zshrc` or `~/.bash_profile`):
   ```bash
   alias arc-debug="/Applications/Arc.app/Contents/MacOS/Arc --remote-debugging-port=9222"
   ```

4. **Then use the alias:**
   ```bash
   arc-debug
   ```

### Option B: Use Arc's Developer Mode

1. Open Arc browser
2. Click the Arc logo in the upper-left corner
3. Hover over "Developer" in the dropdown menu
4. Enable "Developer Mode"
5. This may enable remote debugging automatically (check if port 9222 is accessible)

## Step 2: Verify Remote Debugging is Active

Test if remote debugging is working:

```bash
curl http://localhost:9222/json/version
```

You should see a JSON response with browser version information. If you get a connection error, remote debugging is not active.

## Step 3: Enable Browser MCP in Cursor Settings

The browser MCP server (`cursor-ide-browser`) is built into Cursor and should automatically detect browsers with remote debugging enabled.

**Important:** The browser MCP tools are built into Cursor and do NOT require configuration in `.mcp.json`. They should work automatically once:
1. Arc is running with remote debugging enabled (Step 1)
2. Cursor is restarted

If the browser MCP tools are not working after restarting Cursor:

1. **Check Cursor Settings:**
   - Open Cursor Settings (Cmd+, on Mac)
   - Search for "MCP" or "browser"
   - Look for any browser-related MCP settings that need to be enabled

2. **Check Cursor's MCP Server Status:**
   - The browser MCP server should automatically connect to browsers on port 9222
   - No explicit configuration is needed in `.mcp.json`

3. **Verify Browser Accessibility:**
   - Make sure Arc is still running with `--remote-debugging-port=9222`
   - Test with: `curl http://localhost:9222/json/version`

## Step 4: Restart Cursor

After enabling remote debugging in Arc:

1. **Restart Cursor IDE** to pick up the browser connection
2. The browser MCP tools should now be available

## Step 5: Test the Connection

Try using the browser MCP tools:

1. Navigate to a URL in Arc
2. In Cursor, try to take a snapshot of the current page
3. The browser MCP should be able to see what's open in Arc

## Troubleshooting

### Browser MCP tools return "undefined" error

**Cause:** Remote debugging is not enabled or Arc is not accessible on port 9222.

**Solution:**
1. Make sure Arc is launched with `--remote-debugging-port=9222`
2. Verify with: `curl http://localhost:9222/json/version`
3. Restart Cursor after enabling debugging

### Can't find Arc executable

**Cause:** Arc might be installed in a different location.

**Solution:**
1. Find Arc's location:
   ```bash
   mdfind -name Arc.app
   ```
2. Use the full path when launching with debugging flag

### Port 9222 is already in use

**Cause:** Another browser or process is using port 9222.

**Solution:**
1. Find what's using the port:
   ```bash
   lsof -i :9222
   ```
2. Kill the process or use a different port (and update MCP config accordingly)

### MCP server not connecting

**Cause:** The browser MCP server is built into Cursor and should auto-detect browsers. If it's not connecting, there might be a Cursor settings issue.

**Solution:**
1. **Verify remote debugging is active:**
   ```bash
   curl http://localhost:9222/json/version
   ```
   Should return browser version info.

2. **Check Cursor Settings:**
   - Open Cursor Settings (Cmd+,)
   - Search for "MCP" or "browser"
   - Ensure browser MCP is enabled (if there's a setting)

3. **Restart Cursor completely:**
   - Quit Cursor (Cmd+Q)
   - Relaunch Cursor
   - The browser MCP should auto-connect

4. **Check Cursor logs:**
   - Look for any MCP-related errors in Cursor's developer console
   - Access via: Help > Toggle Developer Tools

**Note:** The browser MCP is built into Cursor and does NOT require installing any npm packages or configuring `.mcp.json`.

## Alternative: Using Chrome/Chromium

If Arc doesn't work, you can use Chrome or Chromium instead:

```bash
# Chrome
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Chromium (if installed)
chromium --remote-debugging-port=9222
```

## Next Steps

Once configured, you can:
- Use browser snapshots to see what's currently open
- Navigate to URLs programmatically
- Interact with web pages
- Debug web applications
- Test your website implementations

## References

- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Arc Browser Developer Mode](https://resources.arc.net/hc/en-us/articles/20468488031511-Developer-Mode-Instant-Dev-Tools)


