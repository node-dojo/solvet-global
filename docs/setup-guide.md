# NO3D Tools Subscription System - Setup Guide

## Prerequisites

- Node.js 20+ and npm 10+
- Vercel account
- Polar.sh account
- GitHub account with access to `no3d-tools-library` repository

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/node-dojo/no3d-tools-website.git
cd no3d-tools-website
```

### 2. Install Dependencies

```bash
npm install
```

Required packages:
- `@polar-sh/sdk` - Polar API client
- `@octokit/rest` - GitHub API client
- `archiver` - ZIP file generation

### 3. Environment Variables

Create `.env.local` file (for local development):

```env
POLAR_API_TOKEN=your_polar_api_token
POLAR_ORG_ID=your_org_id
POLAR_WEBHOOK_SECRET=your_webhook_secret
GITHUB_TOKEN=your_github_token
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
```

### 4. Create Subscription Product

Run the setup script to create the subscription product in Polar:

```bash
POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/setup/create-subscription-product.js
```

This will:
- Create subscription product in Polar
- Generate checkout link
- Save configuration to `config/subscription-config.json`

### 5. Configure Vercel

#### Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

#### Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

- `POLAR_API_TOKEN`
- `POLAR_ORG_ID`
- `POLAR_WEBHOOK_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_WEBHOOK_SECRET`

### 6. Configure Webhooks

#### Polar Webhook

1. Go to Polar dashboard → Settings → Webhooks
2. Add webhook: `https://your-domain.vercel.app/api/v1/webhooks/polar`
3. Select events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.revoked`
   - `checkout.created`
   - `order.created`
4. Copy webhook secret → Set as `POLAR_WEBHOOK_SECRET`

#### GitHub Webhook

1. Go to `no3d-tools-library` repository → Settings → Webhooks
2. Add webhook: `https://your-domain.vercel.app/api/v1/webhooks/github`
3. Content type: `application/json`
4. Select event: `push`
5. Generate secret → Set as `GITHUB_WEBHOOK_SECRET`

### 7. Update Website Configuration

Update `website/subscribe.html` and `website/account.html`:
- Replace placeholder URLs with your domain
- Update Polar customer portal URLs if needed
- Configure success page redirect URL

## File Structure

```
no3d-tools-website/
├── api/
│   └── v1/
│       ├── webhooks/
│       │   ├── polar.js
│       │   └── github.js
│       ├── library/
│       │   └── download.js
│       ├── catalog/
│       │   └── version.js
│       └── user/
│           └── entitlements.js
├── api/
│   └── utils/
│       └── polar-auth.js
├── website/
│   ├── subscribe.html
│   ├── success.html
│   └── account.html
├── scripts/
│   └── setup/
│       └── create-subscription-product.js
├── config/
│   └── subscription-config.json
├── vercel.json
└── package.json
```

## Testing

### Local Testing

1. Start Vercel dev server:
```bash
vercel dev
```

2. Test endpoints:
- `http://localhost:3000/api/v1/catalog/version`
- Test webhooks using ngrok or similar

### Production Testing

1. Test subscription flow:
   - Visit subscribe page
   - Complete checkout
   - Verify webhook received
   - Check account page

2. Test download:
   - Sign in to account
   - Click download
   - Verify ZIP file received

3. Test updates:
   - Add product to repository
   - Verify GitHub webhook received
   - Check catalog version updated
   - Verify update badge appears

## Troubleshooting

### Webhooks Not Working

- Check webhook URLs are correct
- Verify secrets match
- Check Vercel function logs
- Test webhook delivery in Polar/GitHub dashboards

### Download Fails

- Check GitHub token has repo access
- Verify subscription is active
- Check Vercel function logs
- Test GitHub API access

### Version Not Updating

- Verify GitHub webhook is configured
- Check webhook secret matches
- Verify catalog.json is writable
- Check function logs for errors

## Maintenance

### Updating Dependencies

```bash
npm update
```

### Monitoring

- Vercel dashboard → Functions → View logs
- Polar dashboard → Webhooks → Delivery logs
- GitHub → Webhooks → Recent deliveries

### Backup

- `config/subscription-config.json` - Store securely
- Environment variables - Backup from Vercel
- Webhook secrets - Store securely

## Support

For setup issues:
- Check Vercel documentation
- Review Polar API docs
- Check GitHub API docs
- Contact: dev@no3dtools.com
