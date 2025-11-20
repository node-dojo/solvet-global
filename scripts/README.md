# Helper Scripts

## Polar Product Management

### Delete Duplicate Products

**Important**: Polar does NOT support true deletion via API. Products can only be archived. Archived products are hidden from new purchases but remain accessible to existing customers.

```bash
# Preview what would be archived (dry run - default)
node scripts/delete-polar-duplicates.js

# Actually archive duplicates
node scripts/delete-polar-duplicates.js --no-dry-run

# Keep newest version of each duplicate
node scripts/delete-polar-duplicates.js --keep-newest --no-dry-run

# Keep oldest version of each duplicate
node scripts/delete-polar-duplicates.js --keep-oldest --no-dry-run

# Keep specific product IDs
node scripts/delete-polar-duplicates.js --keep-ids=id1,id2,id3 --no-dry-run

# Group duplicates by SKU instead of name
node scripts/delete-polar-duplicates.js --by-sku --no-dry-run
```

**Environment Variables Required:**
- `POLAR_API_TOKEN` - Your Polar API token
- `POLAR_ORG_ID` - Your Polar organization ID

**Note**: For permanent deletion, contact Polar support directly. Archived products cannot be unarchived via API.

## Dashboard Helper Scripts

## Quick Token Setup

### Option 1: Use GitHub CLI Token (Easiest)
```bash
./scripts/update-token-from-gh.sh
```
This script:
- Gets your current GitHub CLI token (`gh auth token`)
- Tests it to verify it works
- Checks if it has `repo` scope
- Updates your `.env` file automatically

**Requirements:**
- GitHub CLI installed: `brew install gh`
- Authenticated: `gh auth login`
- Token must have `repo` scope

### Option 2: Manual Setup
```bash
./scripts/setup-github-token.sh
```
Interactive script that helps you:
- Check current token status
- Validate token scopes
- Update `.env` file
- Provides instructions for manual token creation

### Option 3: Create Token via Web UI
1. Visit: https://github.com/settings/tokens
2. Or use: `gh browse --settings tokens`
3. Generate new token (classic) with `repo` scope
4. Add to `.env`: `GITHUB_TOKEN=ghp_your_token_here`

## Token Types

- **`ghp_...`** - Personal Access Token (classic) - created via web UI
- **`gho_...`** - OAuth token - from GitHub CLI (`gh auth login`)

Both work, but OAuth tokens from GitHub CLI are easier to manage.

## After Updating Token

1. Restart server: `npm start` or `lsof -ti:8000 | xargs kill && npm start`
2. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Test dashboard: http://localhost:8000/dashboard

