<!-- 9b4faeeb-5e3f-499d-96dd-27c0c953048f 628fd1a7-207e-4c65-aba7-e8c22d8d4391 -->
# Auto-Commit Git Automation Plan

## Overview

Convert the Electron dashboard app into a menu bar application that watches for file changes and automatically commits/pushes to GitHub. The app will run at login and provide notifications with user preference for silent auto-commit or approval prompts.

## Implementation Steps

### 1. Convert Electron App to Menu Bar App

**File**: `electron-main.js`

- Add `Tray` import from electron
- Create system tray icon with menu
- Hide dock icon on macOS (`app.dock.hide()`)
- Add tray menu options:
  - Open Dashboard
  - Auto-commit Settings (silent/prompt)
  - View Recent Commits
  - Quit
- Make app run in background (don't quit on window close)
- Add app to login items (macOS Launch Agent)

### 2. Add File Watcher System

**File**: `electron-main.js` (new module: `file-watcher.js`)

- Install `chokidar` for reliable file watching
- Watch `no3d-tools-library/Dojo*/**` for changes:
  - `*.json` files (metadata)
  - `*.blend` files (product files)
  - `icon_*.png` files (icons)
  - `product-images/**` (preview images)
- Debounce file changes (wait 2-3 seconds after last change)
- Track changed files for batch commits
- Detect change source (Blender export pattern, dashboard save, manual edit)

### 3. Add Git Operations Module

**File**: `git-automation.js` (new file)

- Install `simple-git` for git operations
- Functions:
  - `getChangedFiles()` - List modified/added files
  - `stageFiles(files)` - Stage specific files
  - `commit(message)` - Create commit with descriptive message
  - `push()` - Push to remote
  - `getCommitHistory(limit)` - Get recent commits for menu
- Handle git errors gracefully
- Support custom commit messages based on change type

### 4. Add Notification System

**File**: `electron-main.js`

- Use Electron `Notification` API (primary)
- Fallback to macOS native notifications if Electron fails
- Notification types:
  - File change detected
  - Commit successful
  - Commit failed (with error)
  - Push successful
  - Push failed
- Add action buttons to notifications (if supported):
  - "View Changes" - Opens dashboard
  - "Undo Commit" - Reverts last commit (if needed)

### 5. Add User Preferences Storage

**File**: `electron-main.js` (use Electron Store)

- Install `electron-store` for persistent settings
- Settings:
  - `autoCommitMode`: "silent" | "prompt"
  - `commitMessageTemplate`: Custom template
  - `watchPaths`: Array of paths to watch
  - `gitConfig`: { repoPath, branch, remote }
- Store in user data directory
- Provide IPC handlers for dashboard to read/update settings

### 6. Add Commit Approval Dialog

**File**: `electron-main.js` + `commit-dialog.html` (new)

- When `autoCommitMode === "prompt"`:
  - Show notification with commit details
  - Create dialog window showing:
    - Changed files list
    - Proposed commit message
    - Diff preview (if small)
    - "Approve & Commit" button
    - "Skip" button
    - "Always Auto-commit" checkbox
- If user approves: proceed with commit
- If user skips: queue for next batch
- If "Always Auto-commit" checked: update preference to "silent"

### 7. Add macOS Launch Agent Setup

**File**: `scripts/setup-launch-agent.sh` (new)

- Create Launch Agent plist file
- Register app to run at login
- Path: `~/Library/LaunchAgents/com.thewelltarot.solvet-dashboard.plist`
- Script to install/uninstall launch agent
- Update `package.json` with setup script

### 8. Update IPC Handlers

**File**: `electron-main.js`

- Add IPC handlers:
  - `get-auto-commit-status` - Get current status
  - `set-auto-commit-mode` - Update preference
  - `trigger-manual-commit` - Manual commit trigger
  - `get-recent-commits` - For menu display
  - `get-changed-files` - Show pending changes

### 9. Update Dashboard UI

**File**: `product-dashboard.html`

- Add auto-commit status indicator
- Add toggle for auto-commit mode (silent/prompt)
- Show notification when files are auto-committed
- Display last commit info
- Add "Commit Now" button for manual trigger

### 10. Update Package Dependencies

**File**: `package.json`

- Add dependencies:
  - `chokidar` - File watching
  - `simple-git` - Git operations
  - `electron-store` - Settings storage
- Update build config for menu bar app

## File Structure

```
SOLVET System V1/
├── electron-main.js          (modified - add Tray, file watcher, git automation)
├── electron-preload.js        (modified - add new IPC handlers)
├── product-dashboard.html     (modified - add auto-commit UI)
├── git-automation.js         (new - git operations module)
├── file-watcher.js           (new - file watching logic)
├── commit-dialog.html        (new - approval dialog)
├── scripts/
│   └── setup-launch-agent.sh (new - macOS login setup)
└── package.json              (modified - add dependencies)
```

## Configuration

### Auto-Commit Modes

1. **Silent Mode** (default after first approval):

   - Detects changes
   - Waits 3 seconds (debounce)
   - Auto-commits with generated message
   - Auto-pushes
   - Shows success notification

2. **Prompt Mode**:

   - Detects changes
   - Shows notification with commit preview
   - User approves/skips
   - If approved: commits and pushes
   - If skipped: queues for next batch

### Commit Message Generation

Template: `Auto-commit: [ChangeType] - [FileCount] file(s)`

Examples:

- `Auto-commit: Blender export - 3 file(s)`
- `Auto-commit: Dashboard update - 1 file(s)`
- `Auto-commit: Manual edit - 2 file(s)`

## Testing Checklist

- [ ] File watcher detects Blender export
- [ ] File watcher detects dashboard save
- [ ] File watcher detects manual file edit
- [ ] Silent mode auto-commits without prompt
- [ ] Prompt mode shows approval dialog
- [ ] Git commit creates proper commit message
- [ ] Git push succeeds
- [ ] Notifications appear correctly
- [ ] Menu bar icon shows status
- [ ] App launches at login
- [ ] Settings persist across restarts

## Security Considerations

- Git operations use system git (no credentials stored)
- Settings stored in user data directory (encrypted on macOS)
- File watcher only watches specified paths
- No remote code execution

## Future Enhancements

- Branch selection in menu
- Commit message templates
- Exclude patterns for file watcher
- Commit history viewer in menu
- Rollback last commit option

## Additional Features

### Create New Product Feature

**File**: `product-dashboard.html` + `electron-main.js`

- Add "Create New Product" button in dashboard UI
- Creates generic product entry with default template:
  - Default name: "Dojo New Product [timestamp]"
  - Default JSON structure from template
  - Default icon placeholder
- Creates corresponding folder in `no3d-tools-library/Dojo*/`
- Folder name syncs with product name:
  - When product name changes, rename folder
  - Handle conflicts if folder name exists
  - Update all file references (JSON, icon paths)
- Initialize with template files:
  - `[Product Name].json` - Metadata template
  - `icon_[Product Name].png` - Placeholder icon
  - Optional: `[Product Name].blend` - Empty/placeholder

### To-dos

- [ ] Add 'Create New Product' button to dashboard UI
- [ ] Implement IPC handler to create new product folder and files
- [ ] Implement folder renaming when product name changes, with conflict handling
- [ ] Create product template JSON structure for new products