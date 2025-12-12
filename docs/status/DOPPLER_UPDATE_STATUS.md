# Doppler Update Status

## Current Status

✅ **Doppler is configured** and connected to project `solvet-global` (config: `dev`)

### Secrets in Doppler:

| Secret | Current Value | Status |
|--------|--------------|--------|
| `POLAR_API_TOKEN` | `your_polar_api_token_here` | ⚠️ **Placeholder - needs update** |
| `POLAR_ORG_ID` | `f0c16049-5959-42c9-8be8-5952c38c7d63` | ✅ **Updated** |

## Update Required

The `POLAR_API_TOKEN` in Doppler is still a placeholder. You need to update it with your actual token.

### Option 1: Update via Doppler CLI (Recommended)

```bash
# Set the token directly
doppler secrets set POLAR_API_TOKEN=polar_oat_your_actual_token_here
```

### Option 2: Use Sync Script

If your `.env` file has the real token:

```bash
./scripts/setup/sync-env-to-doppler.sh POLAR_API_TOKEN
```

### Option 3: Update via Doppler Dashboard

1. Go to https://dashboard.doppler.com
2. Select project: `solvet-global`
3. Select config: `dev`
4. Find `POLAR_API_TOKEN`
5. Click edit and paste your token
6. Save

## Verify Update

After updating, verify:

```bash
# Check the token (first few chars only)
doppler secrets get POLAR_API_TOKEN --plain | head -c 20 && echo "..."

# List all secrets
doppler secrets
```

## Using Doppler Secrets

Once updated, you can use Doppler to inject secrets:

```bash
# Run scripts with Doppler secrets
doppler run -- node scripts/setup/create-subscription-product.js

# Or use the wrapper script
./scripts/utils/doppler-run.sh node scripts/test/complete-subscription-test.js
```

## Next Steps

1. ✅ Update `POLAR_API_TOKEN` in Doppler (see options above)
2. ✅ Verify token works: `doppler run -- node scripts/test/complete-subscription-test.js`
3. ✅ Create checkout link: `doppler run -- node scripts/setup/create-subscription-product.js`

## Notes

- Doppler secrets are separate from `.env` file
- Both can coexist - scripts can use either
- Doppler is better for CI/CD and team collaboration
- `.env` is fine for local development

