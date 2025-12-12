# Webhook Testing Guide

## Current Status

✅ **Webhooks Configured:**
- Polar webhook URL: `https://solvet-global-e88opqdfs-node-dojos-projects.vercel.app/api/v1/webhooks/polar`
- GitHub webhook URL: `https://solvet-global-e88opqdfs-node-dojos-projects.vercel.app/api/v1/webhooks/github`

✅ **Secrets Added:**
- `POLAR_WEBHOOK_SECRET` - Added to Vercel and Doppler
- `GITHUB_WEBHOOK_SECRET` - Added to Vercel and Doppler

## Testing Methods

### Method 1: Test Locally (Recommended)

1. **Start Vercel dev server:**
   ```bash
   doppler run -- vercel dev
   ```

2. **Run test script:**
   ```bash
   ./scripts/test/test-webhooks.sh local
   ```

3. **Or test manually with curl:**
   ```bash
   # Test Polar webhook
   curl -X POST http://localhost:3000/api/v1/webhooks/polar \
     -H "Content-Type: application/json" \
     -H "X-Polar-Signature: sha256=..." \
     -d '{"type":"subscription.created","data":{"id":"test"}}'
   
   # Test GitHub webhook
   curl -X POST http://localhost:3000/api/v1/webhooks/github \
     -H "Content-Type: application/json" \
     -H "X-Hub-Signature-256: sha256=..." \
     -d '{"ref":"refs/heads/main","commits":[]}'
   ```

### Method 2: Test via Polar/GitHub Dashboards

#### Polar Webhook Testing

1. **Go to Polar Dashboard:**
   - Navigate to Settings → Webhooks
   - Find your webhook
   - Click "Test" or "Recent Deliveries"
   - Check delivery status and response

2. **Trigger a test event:**
   - Create a test subscription
   - Or use Polar's webhook testing feature
   - Check delivery logs in Polar dashboard

#### GitHub Webhook Testing

1. **Go to GitHub Repository:**
   - Navigate to `node-dojo/no3d-tools-library`
   - Settings → Webhooks
   - Find your webhook
   - Click "Recent Deliveries"
   - Check delivery status

2. **Trigger a test event:**
   - Make a test commit to main branch
   - Or use GitHub's "Redeliver" feature
   - Check delivery logs in GitHub

### Method 3: Check Vercel Function Logs

After a webhook is delivered (from Polar or GitHub):

```bash
# View recent logs
vercel logs <deployment-url>

# Or check in Vercel dashboard:
# https://vercel.com/node-dojos-projects/solvet-global/logs
```

## Expected Responses

### Success Response
```json
{
  "received": true
}
```
Status: `200 OK`

### Error Responses

**401 Unauthorized:**
- Missing or invalid webhook signature
- Check that webhook secret matches

**405 Method Not Allowed:**
- Wrong HTTP method (must be POST)

**500 Internal Server Error:**
- Check Vercel function logs for details

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook URL is correct:**
   - Polar: `https://solvet-global-e88opqdfs-node-dojos-projects.vercel.app/api/v1/webhooks/polar`
   - GitHub: `https://solvet-global-e88opqdfs-node-dojos-projects.vercel.app/api/v1/webhooks/github`

2. **Verify secrets match:**
   ```bash
   # Check Doppler
   doppler secrets get POLAR_WEBHOOK_SECRET --plain
   doppler secrets get GITHUB_WEBHOOK_SECRET --plain
   
   # Check Vercel
   vercel env ls production
   ```

3. **Check Vercel deployment protection:**
   - Webhooks should bypass protection
   - If blocked, check Vercel project settings

### Signature Verification Failing

1. **Verify secret is correct:**
   - Secret in Polar/GitHub must match Vercel/Doppler
   - No extra spaces or characters

2. **Check signature format:**
   - Polar: `X-Polar-Signature: sha256=<hash>`
   - GitHub: `X-Hub-Signature-256: sha256=<hash>`

### Deployment Protection Blocking

If Vercel protection is blocking webhooks:

1. **Disable for API routes** (in Vercel dashboard):
   - Project Settings → Deployment Protection
   - Add exception for `/api/*` routes

2. **Or use bypass token** (for testing only):
   - Get bypass token from Vercel dashboard
   - Add to webhook URL: `?x-vercel-protection-bypass=<token>`

## Next Steps

1. ✅ Webhooks configured
2. ✅ Secrets added
3. ⏳ Test with real events (Polar subscription, GitHub push)
4. ⏳ Monitor logs for successful deliveries
5. ⏳ Verify catalog updates work correctly
