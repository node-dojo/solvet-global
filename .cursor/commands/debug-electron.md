# Debug Electron App

Debug the running co-aug-dashboard Electron application. Check process status, view logs, identify errors, and restart if needed. **For advanced inspection and control, utilize the Electron MCP (Main Control Panel) and the Chrome DevTools MCP as part of your debugging workflow.**

## Quick Checks

1. **Check if Electron is running**: `ps aux | grep -i electron | grep -v grep`
2. **Check Vite dev server**: `lsof -i :5173` or `curl http://localhost:5173`
3. **View recent logs**: Check `co-aug-dashboard/electron/services/logger.js` output or console
4. **Kill stuck processes**: `cd co-aug-dashboard && npm run kill:electron`
5. **Use Electron MCP**: Launch and interact with Electron MCP to monitor and control Electron process state if available.
6. **Use Chrome DevTools MCP**: Access Chrome DevTools MCP for advanced debugging of the renderer and main processes.

## Common Issues

- **Port 5173 in use**: Kill process on port or change Vite port
- **Build errors**: Run `cd co-aug-dashboard && npm run build:electron` to see errors
- **Main process crashes**: Check `dist-electron/main.js` exists and is valid
- **IPC communication errors**: Verify preload script is loaded correctly
- **File system errors**: Check permissions and file paths in services

## Debug Steps

1. Verify Electron process: Check if `electron` process exists, or use Electron MCP for process management.
2. Check Vite server: Ensure `http://localhost:5173` responds.
3. View console output: Check terminal running `npm run electron:dev`.
4. Check build artifacts: Verify `dist-electron/` contains compiled files.
5. Restart clean: `cd co-aug-dashboard && npm run clean && npm run electron:dev`.
6. Check logs: Review logger service output for errors.
7. DevTools: Open DevTools in Electron window (Cmd+Option+I / Ctrl+Shift+I), or use Chrome DevTools MCP for extended debug features.
8. Use MCPs for advanced debugging: Employ Electron MCP and Chrome DevTools MCP to manage, inspect, and debug processes interactively.

## Restart Command

```bash
cd co-aug-dashboard && npm run kill:electron && npm run electron:dev
```

**Next steps:**  
- Open Electron MCP for process overview and control as needed.  
- Use Chrome DevTools MCP to connect directly to renderer/main for step-debugging and profiling.
```

