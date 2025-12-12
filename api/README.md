# API Endpoints

Vercel serverless functions for the NO3D Tools subscription system.

## Structure

```
api/
├── v1/
│   ├── webhooks/
│   │   ├── polar.js      - Polar webhook receiver
│   │   └── github.js     - GitHub webhook receiver
│   ├── library/
│   │   └── download.js   - Library download endpoint
│   ├── catalog/
│   │   └── version.js    - Catalog version endpoint
│   └── user/
│       └── entitlements.js - User entitlements endpoint
└── utils/
    └── polar-auth.js      - Polar authentication utilities
```

## Deployment

These functions are automatically deployed to Vercel when pushed to the repository.

## Environment Variables

Required in Vercel:
- `POLAR_API_TOKEN`
- `POLAR_ORG_ID`
- `POLAR_WEBHOOK_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_WEBHOOK_SECRET`

## Local Development

Use Vercel CLI:
```bash
vercel dev
```

## Testing

Test endpoints locally or use Vercel preview deployments.
