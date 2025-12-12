# Helper Scripts

> **⚠️ Security Warning**: These scripts handle sensitive tokens and API keys. Always:
> - Never commit tokens to version control
> - Use `.env` files for local development (already in `.gitignore`)
> - Use environment variables for all secrets
> - Review script outputs for exposed tokens
> - Rotate tokens regularly (every 90 days recommended)

## Environment Variables

All scripts use `.env` files for configuration. Create a `.env` file in the project root with your API keys:

```bash
# .env file
POLAR_API_TOKEN=your_polar_token_here
POLAR_ORG_ID=your_org_id_here
GITHUB_TOKEN=your_github_token_here
```

Scripts automatically load environment variables from `.env` using `dotenv`. You can also set environment variables directly:

```bash
POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/update-product-prices.js
```

## Security Features

All scripts include:
- **Token Masking**: Tokens are automatically masked in logs (showing only first/last 4 characters)
- **Input Validation**: All scripts validate required environment variables
- **Error Sanitization**: Error messages are sanitized to prevent token exposure
- **Secure Error Handling**: Scripts use proper error handling with `set -euo pipefail` (bash) or try/catch (Node.js)

### Security Utilities

The `scripts/utils/security.js` module provides:
- `maskToken(token)` - Safely mask tokens for display
- `validateEnvVars(requiredVars)` - Validate required environment variables
- `logTokenInfo(varName, token)` - Log token info without exposing full token
- `sanitizeError(error)` - Remove tokens from error messages

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
- `POLAR_API_TOKEN` - Your Polar API token (never commit this!)
- `POLAR_ORG_ID` - Your Polar organization ID

**Usage:**
```bash
# With .env file (recommended)
node scripts/delete-polar-duplicates.js

# Or with environment variables directly
POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/delete-polar-duplicates.js
```

**Security Notes:**
- Tokens are automatically masked in script output
- Never share your API token
- Rotate tokens if exposed
- Use Doppler or environment variables, never hardcode tokens

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

## Error Codes

Scripts exit with the following codes:
- `0` - Success
- `1` - General error (missing env vars, invalid input, etc.)
- `2` - Security error (token validation failed, etc.)

## Script Categories

### Setup Scripts
- `setup/setup-github-token.sh` - GitHub token setup helper
- `setup/setup-polar-mcp.sh` - Polar MCP configuration
- `setup/init-dashboard-submodule.sh` - Initialize CO-AUG Dashboard submodule
- `setup/setup-dashboard-submodule.sh` - Setup CO-AUG Dashboard as submodule
- `maintenance/update-token-from-gh.sh` - Quick token update from GitHub CLI

### Maintenance Scripts
- `../update-all.sh` - Update all repositories (workspace-level, in root)
- `../status-all.sh` - Check status of all repositories (workspace-level, in root)

### Sync Scripts
- `update-product-prices.js` - Update product prices in Polar
- `generate-polar-mapping.js` - Generate product mapping files
- `create-checkout-links.js` - Create checkout links for products
- `batch-update-prices.js` - Batch price updates

### Utility Scripts
- `add-changelogs.js` - Add changelog entries
- `create-benefit-test.js` - Test benefit creation
- `delete-polar-duplicates.js` - Archive duplicate products
- `verify-visitor-font.py` - Verify font files
- `convert-visitor-to-woff2.py` - Convert font formats

### Development Scripts
- `launch-arc-debug.sh` - Launch Arc browser with debugging
- `test-mcp-product.js` - Test MCP product integration

## Troubleshooting

### Token Not Working
1. Verify token is set: `echo $POLAR_API_TOKEN` (should show masked token)
2. Check token format: Polar tokens start with `polar_`
3. Verify token hasn't expired
4. Check token scopes in Polar dashboard

### Script Fails with "Missing required environment variables"
1. Check `.env` file exists
2. Verify variable names match exactly (case-sensitive)
3. Ensure no extra spaces in `.env` file
4. Restart terminal after updating `.env`

### Token Exposed in Logs
If you see a full token in logs:
1. **Immediately rotate the token** in Polar/GitHub settings
2. Update `.env` with new token
3. Report the issue (see [SECURITY.md](../SECURITY.md))
4. Check git history and remove if committed

## Best Practices

1. **Always use environment variables** - Never hardcode tokens
2. **Review script output** - Check for accidentally exposed tokens
3. **Use dry-run mode** when available - Test scripts before making changes
4. **Backup before destructive operations** - Scripts create backups when modifying files
5. **Read script documentation** - Each script has usage information
6. **Test in development first** - Don't run production scripts without testing

## Getting Help

- Check script help: `./script-name.sh --help` or read script comments
- Review [SECURITY.md](../SECURITY.md) for security concerns
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines
- Open an issue for bugs or questions

