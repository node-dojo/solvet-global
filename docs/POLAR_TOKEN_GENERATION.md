# Polar API Token Generation Guide

## Overview

Polar API tokens (Organization Access Tokens / OAT) must be created via the Polar dashboard. This guide helps you generate a token with the appropriate scopes for the subscription system.

## Required Scopes

Based on the subscription system implementation, you need these scopes:

### Core Scopes
- ✅ **products** (read + write) - Manage subscription products
- ✅ **subscriptions** (read) - Check subscription status
- ✅ **checkout** (read + write) - Create and manage checkout links
- ✅ **customers** (read) - Access customer information
- ✅ **webhooks** (read + write) - Configure webhooks for events

### What Each Scope Enables

| Scope | Read | Write | Used For |
|-------|------|-------|----------|
| **products** | ✅ | ✅ | List products, create subscription products, update product details |
| **subscriptions** | ✅ | ❌ | Verify active subscriptions, check subscription status |
| **checkout** | ✅ | ✅ | Create checkout links, list existing links |
| **customers** | ✅ | ❌ | Get customer information, verify customer IDs |
| **webhooks** | ✅ | ✅ | Configure webhooks for subscription events |

## Step-by-Step Instructions

### Step 1: Navigate to API Settings

**Option A: Direct Link**
```
https://polar.sh/dashboard/settings/api
```

**Option B: Via Dashboard**
1. Go to https://polar.sh/dashboard
2. Click **Settings** in sidebar
3. Click **General**
4. Scroll to **Developers** section
5. Click **New Token**

### Step 2: Configure Token

Fill in the form:

- **Name**: `SOLVET Subscription System` (or descriptive name)
- **Expiration**: 
  - Recommended: 90 days
  - For production: 1 year
  - For testing: 30 days
- **Scopes**: Select all required scopes:
  - ✅ products (read + write)
  - ✅ subscriptions (read)
  - ✅ checkout (read + write)
  - ✅ customers (read)
  - ✅ webhooks (read + write)

### Step 3: Generate and Copy Token

1. Click **Create Token**
2. **⚠️ IMPORTANT**: Copy the token immediately
   - Format: `polar_oat_xxxxxxxxxxxxxxxxx`
   - You won't be able to see it again!
   - Store it securely

### Step 4: Update Environment Variables

Update your `.env` file:

```bash
# Get your organization ID (already set from MCP)
POLAR_ORG_ID=f0c16049-5959-42c9-8be8-5952c38c7d63

# Add your new token
POLAR_API_TOKEN=polar_oat_your_new_token_here
```

### Step 5: Refresh MCP Configuration

```bash
node scripts/setup/refresh-polar-mcp.js
```

This updates `.mcp.json` with the new token.

### Step 6: Restart Cursor

Restart Cursor IDE completely to apply MCP changes.

### Step 7: Verify Token

Test the token works:

```bash
node scripts/test/complete-subscription-test.js
```

Or test with Polar MCP directly.

## Quick Reference

### Token Format
```
polar_oat_xxxxxxxxxxxxxxxxx
```

### Organization ID
```
f0c16049-5959-42c9-8be8-5952c38c7d63
```

### Dashboard Links
- API Settings: https://polar.sh/dashboard/settings/api
- Organization Settings: https://polar.sh/dashboard/settings

## Security Best Practices

1. **Never commit tokens** to version control
2. **Use environment variables** - never hardcode tokens
3. **Rotate tokens regularly** - especially if exposed
4. **Use minimum required scopes** - don't grant unnecessary permissions
5. **Set expiration dates** - don't create tokens that never expire
6. **Revoke unused tokens** - clean up old tokens regularly

## Troubleshooting

### Token Not Working

1. **Check token format**: Should start with `polar_oat_`
2. **Verify scopes**: Ensure all required scopes are selected
3. **Check expiration**: Token may have expired
4. **Verify organization**: Token must be for correct organization

### MCP Not Updating

1. **Check .env file**: Ensure token is correct
2. **Run refresh script**: `node scripts/setup/refresh-polar-mcp.js`
3. **Restart Cursor**: Fully quit and restart Cursor IDE
4. **Check .mcp.json**: Verify token is updated

### API Errors

- **401 Unauthorized**: Token invalid or expired
- **403 Forbidden**: Missing required scopes
- **404 Not Found**: Organization ID incorrect

## Scripts Available

- `scripts/setup/generate-polar-token-guide.js` - Shows required scopes
- `scripts/setup/refresh-polar-mcp.js` - Updates MCP config
- `scripts/test/complete-subscription-test.js` - Tests token validity

## Next Steps

After generating the token:

1. ✅ Update `.env` file
2. ✅ Refresh MCP configuration
3. ✅ Restart Cursor
4. ✅ Test subscription system
5. ✅ Create checkout link for subscription product
