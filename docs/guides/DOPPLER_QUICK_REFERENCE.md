# Doppler Quick Reference

Quick commands for managing secrets with Doppler in the SOLVET system.

## Installation

```bash
# macOS
brew install doppler

# Or npm
npm install -g doppler-cli
```

## Initial Setup

```bash
# Login to Doppler
doppler login

# Run setup script
./scripts/setup/setup-doppler.sh

# Or migrate existing .env file
./scripts/setup/migrate-env-to-doppler.sh
```

## Daily Usage

### Running Scripts

```bash
# Run any script with secrets injected
doppler run -- node scripts/update-product-prices.js

# Or use the wrapper
./scripts/utils/doppler-run.sh node scripts/update-product-prices.js
```

### Managing Secrets

```bash
# List all secrets (values masked)
doppler secrets

# Get a specific secret value
doppler secrets get POLAR_API_TOKEN --plain

# Set a secret
doppler secrets set POLAR_API_TOKEN=your_token_here

# Set multiple secrets
doppler secrets set POLAR_API_TOKEN=xxx POLAR_ORG_ID=yyy

# Download secrets as .env file
doppler secrets download --no-file --format env > .env.local
```

### Environments

```bash
# Switch to dev environment (default)
doppler setup --project solvet-global --config dev

# Switch to production
doppler setup --project solvet-global --config prd

# Check current config
doppler configure get
```

## Required Secrets

The SOLVET system needs these secrets:

- `POLAR_API_TOKEN` - Polar API access token
- `POLAR_ORG_ID` - Polar organization ID
- `POLAR_WEBHOOK_SECRET` - Polar webhook secret
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GITHUB_WEBHOOK_SECRET` - GitHub webhook secret
- `VERCEL_TOKEN` - Vercel API token (optional)
- `VERCEL_ORG_ID` - Vercel org ID (optional)
- `VERCEL_PROJECT_ID` - Vercel project ID (optional)

## Common Workflows

### Update a Secret

```bash
doppler secrets set POLAR_API_TOKEN=new_token_here
```

### View All Secrets

```bash
doppler secrets
```

### Run Script with Secrets

```bash
doppler run -- node scripts/update-product-prices.js
```

### Export to .env (for local testing)

```bash
doppler secrets download --no-file --format env > .env.local
```

## Troubleshooting

### "doppler: command not found"
```bash
brew install doppler
```

### "Not logged in"
```bash
doppler login
```

### "Project not found"
```bash
doppler setup --project solvet-global --config dev
```

## Integration with CI/CD

### GitHub Actions

```yaml
- uses: dopplerhq/github-action@v3
  with:
    token: ${{ secrets.DOPPLER_TOKEN }}
- run: doppler run -- node scripts/update-product-prices.js
```

### Vercel

Install Doppler Vercel integration to automatically sync secrets.

## More Information

- Full setup guide: [DOPPLER_SETUP.md](./DOPPLER_SETUP.md)
- Doppler docs: https://docs.doppler.com





