# Doppler Secrets Management Setup

This guide will help you set up Doppler to manage all API keys and secrets for the SOLVET system.

## What is Doppler?

Doppler is a unified secrets management platform that:
- Centralizes all API keys and secrets in one place
- Syncs secrets across all environments (dev, staging, production)
- Provides CLI tools to inject secrets into your scripts
- Integrates with CI/CD (GitHub Actions, Vercel, etc.)
- Offers audit logs and access controls

## Prerequisites

1. **Doppler Account**: Sign up at [doppler.com](https://doppler.com) (free tier available)
2. **Doppler CLI**: Install the CLI tool

```bash
# macOS
brew install doppler

# Or using npm
npm install -g doppler-cli
```

## Quick Start

### 1. Login to Doppler

```bash
doppler login
```

This will open your browser to authenticate.

### 2. Initialize Doppler in Your Project

Run the setup script:

```bash
./scripts/setup/setup-doppler.sh
```

This script will:
- Create a Doppler project (if needed)
- Set up environments (dev, staging, production)
- Guide you through adding all required secrets
- Create `.doppler.yaml` configuration file

### 3. Verify Setup

```bash
doppler secrets
```

You should see all your secrets listed (values are masked).

## Required Secrets

The SOLVET system requires these secrets:

### Polar API
- `POLAR_API_TOKEN` - Your Polar API access token
- `POLAR_ORG_ID` - Your Polar organization ID
- `POLAR_WEBHOOK_SECRET` - Secret for verifying Polar webhooks

### GitHub API
- `GITHUB_TOKEN` - GitHub Personal Access Token (with `repo` scope)
- `GITHUB_WEBHOOK_SECRET` - Secret for verifying GitHub webhooks

### Vercel (Optional)
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Using Doppler

### Running Scripts with Doppler

Instead of:
```bash
POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/update-product-prices.js
```

Use:
```bash
doppler run -- node scripts/update-product-prices.js
```

Doppler automatically injects all secrets as environment variables.

### Setting Secrets

```bash
# Set a single secret
doppler secrets set POLAR_API_TOKEN=your_token_here

# Set multiple secrets
doppler secrets set POLAR_API_TOKEN=xxx POLAR_ORG_ID=yyy

# Set from file
doppler secrets set POLAR_API_TOKEN -- < .env.local
```

### Viewing Secrets

```bash
# List all secrets (values masked)
doppler secrets

# Get a specific secret value
doppler secrets get POLAR_API_TOKEN --plain

# Download secrets as .env file
doppler secrets download --no-file --format env > .env.local
```

### Environments

Doppler supports multiple environments. Switch between them:

```bash
# Use dev environment
doppler setup --project solvet-global --config dev

# Use production environment
doppler setup --project solvet-global --config prd
```

## Migration from .env Files

If you have existing `.env` files, use the migration script:

```bash
./scripts/setup/migrate-env-to-doppler.sh
```

This script will:
1. Read your existing `.env` file
2. Upload all secrets to Doppler
3. Create a backup of your `.env` file
4. Optionally remove the `.env` file (after verification)

## CI/CD Integration

### GitHub Actions

Update your workflows to use Doppler:

```yaml
- name: Setup Doppler
  uses: dopplerhq/github-action@v3
  with:
    token: ${{ secrets.DOPPLER_TOKEN }}

- name: Run script
  run: doppler run -- node scripts/update-product-prices.js
```

### Vercel

1. Install Doppler Vercel integration
2. Connect your Doppler project
3. Secrets automatically sync to Vercel environment variables

## Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use different projects/configs** for different environments
3. **Rotate secrets regularly** - Update in Doppler, not in code
4. **Use Doppler CLI in scripts** - Replace manual env var passing
5. **Review access logs** - Check who accessed what secrets

## Troubleshooting

### "doppler: command not found"
Install Doppler CLI: `brew install doppler` or `npm install -g doppler-cli`

### "Project not found"
Run `doppler setup` to configure your project and config.

### "Permission denied"
Check your Doppler account has access to the project. Run `doppler login` again.

### Scripts still looking for .env
Update scripts to use `doppler run --` instead of reading `.env` directly.

## Security Notes

- Doppler encrypts all secrets at rest
- Secrets are only decrypted when accessed via CLI or API
- Access is logged and auditable
- Use least-privilege access controls
- Rotate secrets if exposed

## Next Steps

1. ✅ Complete Doppler setup
2. ✅ Migrate existing secrets
3. ✅ Update scripts to use `doppler run`
4. ✅ Set up CI/CD integration
5. ✅ Remove `.env` files (after verification)

## Additional Resources

- [Doppler Documentation](https://docs.doppler.com)
- [Doppler CLI Reference](https://docs.doppler.com/docs/cli)
- [CI/CD Integration Guide](https://docs.doppler.com/docs/integrations)





