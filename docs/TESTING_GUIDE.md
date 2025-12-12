# Subscription System Testing Guide

## Quick Start Testing

### 1. File Structure Test (No credentials needed)

```bash
node scripts/test/test-file-structure.js
```

This verifies all files are in place.

### 2. Full System Test (Requires API credentials)

```bash
POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx [GITHUB_TOKEN=xxx] node scripts/test/subscription-system-test.js
```

## Step-by-Step Testing

### Step 1: Set Up Environment Variables

Create a `.env` file or export variables:

```bash
export POLAR_API_TOKEN=your_polar_token
export POLAR_ORG_ID=your_org_id
export GITHUB_TOKEN=your_github_token  # Optional
```

Or create `.env` file:
```env
POLAR_API_TOKEN=your_polar_token
POLAR_ORG_ID=your_org_id
GITHUB_TOKEN=your_github_token
```

### Step 2: Create Subscription Product

First, create the subscription product in Polar:

```bash
POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/setup/create-subscription-product.js
```

This will:
- Create subscription product in Polar
- Generate checkout link
- Save config to `config/subscription-config.json`

**Dry run mode:**
```bash
DRY_RUN=true POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/setup/create-subscription-product.js
```

### Step 3: Test API Endpoints Locally

#### Option A: Using Vercel CLI (Recommended)

```bash
npm install -g vercel
vercel dev
```

Then test endpoints:
- `http://localhost:3000/api/v1/catalog/version`
- `http://localhost:3000/api/v1/user/entitlements?customer_id=test`

#### Option B: Manual Testing

Test individual endpoints with curl:

```bash
# Test version endpoint
curl http://localhost:3000/api/v1/catalog/version

# Test entitlements (requires customer ID)
curl "http://localhost:3000/api/v1/user/entitlements?customer_id=cus_xxx"
```

### Step 4: Test Website Pages

Open in browser:
- `website/subscribe.html` - Should show subscription page
- `website/success.html` - Should show success page
- `website/account.html` - Should show account page (may need API running)

### Step 5: Test Webhooks

#### Polar Webhook Testing

1. Set up webhook in Polar dashboard pointing to your local URL (use ngrok)
2. Trigger a test subscription
3. Check logs for webhook events

#### GitHub Webhook Testing

1. Set up webhook in GitHub repo pointing to your local URL
2. Make a test commit to the repository
3. Check logs for webhook events

### Step 6: Test Download Flow

1. Ensure you have an active subscription in Polar
2. Get your Polar Customer ID
3. Test download endpoint:
   ```bash
   curl "http://localhost:3000/api/v1/library/download?customer_id=cus_xxx" \
     --output library.zip
   ```
4. Verify ZIP file contains products

## Testing Checklist

### Pre-Deployment Tests

- [ ] File structure test passes
- [ ] Subscription product created in Polar
- [ ] Checkout link generated
- [ ] API endpoints respond correctly
- [ ] Website pages load
- [ ] Download endpoint works
- [ ] Webhooks receive events
- [ ] Version tracking works

### Integration Tests

- [ ] Complete subscription flow:
  1. Visit subscribe page
  2. Click subscribe
  3. Complete Polar checkout
  4. Redirect to success page
  5. Access account page
  6. Download library

- [ ] Update notification flow:
  1. Add product to repository
  2. GitHub webhook triggers
  3. Catalog version updates
  4. Account page shows update badge
  5. Re-download includes new products

### Error Handling Tests

- [ ] Invalid customer ID returns 400
- [ ] Expired subscription returns 403
- [ ] Missing webhook secret logs warning
- [ ] API errors return proper status codes
- [ ] Frontend handles API errors gracefully

## Using Polar MCP for Testing

If you have Polar MCP configured, you can use it to:

1. **Create test subscription:**
   ```bash
   # Use Polar MCP to create subscription
   ```

2. **Check subscription status:**
   ```bash
   # Use Polar MCP to verify subscription
   ```

3. **Test webhook events:**
   ```bash
   # Use Polar MCP to trigger test events
   ```

## Troubleshooting

### "Missing required environment variables"

- Check `.env` file exists
- Verify variable names match exactly
- Restart terminal after updating `.env`

### "Polar API error"

- Verify token is valid
- Check token hasn't expired
- Verify org ID is correct

### "GitHub API error"

- Verify token has `repo` scope
- Check repository access
- Verify token hasn't expired

### Webhooks not working

- Check webhook URL is correct
- Verify webhook secret matches
- Check Vercel function logs
- Test webhook delivery in Polar/GitHub dashboards

### Download fails

- Verify subscription is active
- Check GitHub token has access
- Verify repository structure
- Check function logs for errors

## Next Steps

After testing:
1. Fix any issues found
2. Deploy to Vercel
3. Configure production webhooks
4. Test production deployment
5. Monitor logs and errors
