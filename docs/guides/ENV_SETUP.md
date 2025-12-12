# Environment Variables Setup

This project uses `.env` files for managing environment variables and secrets.

## Quick Start

1. **Create a `.env` file** in the project root:
   ```bash
   # .env file
   POLAR_API_TOKEN=your_polar_token_here
   POLAR_ORG_ID=your_org_id_here
   GITHUB_TOKEN=your_github_token_here
   GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
   POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here
   ```

2. **Run scripts normally** - they automatically load from `.env`:
   ```bash
   node scripts/update-product-prices.js
   ```

## How It Works

- Scripts use `dotenv` package to automatically load `.env` files
- The `.env` file is already in `.gitignore` - it won't be committed
- You can also set environment variables directly:
  ```bash
  POLAR_API_TOKEN=xxx node scripts/update-product-prices.js
  ```

## Required Variables

Common environment variables used by scripts:

- `POLAR_API_TOKEN` - Polar API access token
- `POLAR_ORG_ID` - Polar organization ID
- `POLAR_WEBHOOK_SECRET` - Polar webhook secret
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GITHUB_WEBHOOK_SECRET` - GitHub webhook secret

## Security Notes

- ✅ `.env` files are in `.gitignore` - never committed
- ✅ Never share your `.env` file
- ✅ Rotate tokens regularly
- ✅ Use different tokens for development/production

## Getting Secrets

See `docs/guides/GET_ENV_SECRETS.md` for instructions on obtaining each secret.

## Testing Your Setup

Verify your `.env` file is working:

```bash
node -e "require('dotenv').config(); console.log('POLAR_API_TOKEN:', process.env.POLAR_API_TOKEN ? 'Set' : 'Missing');"
```

## Note on Doppler

Doppler has been disabled for this project. All scripts now use `.env` files directly via `dotenv`. The Doppler configuration file (`.doppler.yaml`) has been disabled but can be re-enabled if needed in the future.

