# Polar MCP Setup Guide

## Quick Setup

### 1. Add Token to .env

Edit `.env` file and replace placeholder with your real token:

```env
POLAR_API_TOKEN=polar_oat_your_actual_token_here
POLAR_ORG_ID=your_org_id_here
```

Get your token from: https://polar.sh/settings/api

### 2. Refresh MCP Configuration

```bash
node scripts/setup/refresh-polar-mcp.js
```

This updates `.mcp.json` with the token from `.env`.

### 3. Restart Cursor

Restart Cursor IDE for MCP to pick up the new token.

### 4. Test with MCP

Once MCP is working, I can use it to:
- List your organizations
- Get your organization ID automatically
- Create subscription products
- Test the subscription system

## Getting Your Organization ID

### Option A: Via Polar MCP (Once Configured)

I can use Polar MCP to list your products, which will show the organization ID.

### Option B: Via Script

Run the subscription product creation script - it will help identify your org ID:

```bash
node scripts/setup/create-subscription-product.js
```

### Option C: Via Polar Dashboard

1. Go to Polar dashboard
2. Check URL or settings - org ID is usually visible
3. Or create a test product and check its details

## Verification

After setup, test MCP connection:

```bash
node scripts/test/test-with-polar-mcp.js
```

## Troubleshooting

### MCP Token Expired

If you see "invalid_token" errors:
1. Get a new token from Polar dashboard
2. Update .env file
3. Run: `node scripts/setup/refresh-polar-mcp.js`
4. Restart Cursor

### MCP Not Working

1. Check .mcp.json exists and has correct format
2. Verify token in .mcp.json matches .env
3. Restart Cursor completely
4. Check Cursor MCP settings

## Using MCP for Testing

Once configured, I can:
- ✅ List organizations
- ✅ List products  
- ✅ Create subscription products
- ✅ Check subscription status
- ✅ Test webhook events

This makes testing much faster and easier!
