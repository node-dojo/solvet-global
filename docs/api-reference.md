# NO3D Tools Subscription API Reference

## Overview

The NO3D Tools subscription system uses Vercel serverless functions for backend API endpoints. All endpoints are located under `/api/v1/`.

## Authentication

Most endpoints require a Polar Customer ID passed as a query parameter or in the request body.

## Endpoints

### GET /api/v1/user/entitlements

Get user's subscription status and entitlements.

**Query Parameters:**
- `customer_id` (required) - Polar Customer ID

**Response:**
```json
{
  "user": {
    "id": "cus_xxx",
    "email": "user@example.com",
    "subscription_tier": "pro_monthly"
  },
  "entitlements": {
    "libraries": ["all"],
    "features": [],
    "expires_at": "2025-02-15T00:00:00Z"
  },
  "catalog_version": null
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing customer_id
- `404` - Customer not found
- `500` - Server error

---

### GET /api/v1/library/download

Download the complete library as a ZIP file.

**Query Parameters:**
- `customer_id` (required) - Polar Customer ID

**Response:**
- `200` - ZIP file (Content-Type: application/zip)
- Headers:
  - `Content-Disposition: attachment; filename="no3d-tools-library-{version}.zip"`
  - `X-Catalog-Version: {version}`

**Status Codes:**
- `200` - ZIP file download
- `400` - Missing customer_id
- `403` - Active subscription required
- `500` - Server error

**Notes:**
- ZIP file includes all products from the repository
- File may be large; download may take time
- ZIP is cached for performance

---

### GET /api/v1/catalog/version

Get current catalog version number.

**Response:**
```json
{
  "version": 42,
  "lastUpdated": "2025-01-15T00:00:00Z",
  "productCount": 150
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### POST /api/v1/webhooks/polar

Receive webhook events from Polar.sh.

**Headers:**
- `X-Polar-Signature` (required) - Webhook signature for verification

**Request Body:**
Polar webhook event payload (varies by event type)

**Supported Events:**
- `subscription.created` - New subscription created
- `subscription.updated` - Subscription updated
- `subscription.canceled` - Subscription canceled
- `subscription.revoked` - Subscription revoked
- `checkout.created` - Checkout session created
- `order.created` - Order created

**Response:**
```json
{
  "received": true
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid signature
- `405` - Method not allowed
- `500` - Server error

---

### POST /api/v1/webhooks/github

Receive webhook events from GitHub when products are updated.

**Headers:**
- `X-Hub-Signature-256` (required) - Webhook signature for verification

**Request Body:**
GitHub webhook payload (push event)

**Response:**
```json
{
  "received": true
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid signature
- `405` - Method not allowed
- `500` - Server error

**Notes:**
- Only processes pushes to main branch
- Updates catalog version when products are modified
- Creates/updates `catalog.json` in repository

---

## Environment Variables

Required environment variables (set in Vercel dashboard):

- `POLAR_API_TOKEN` - Polar API access token
- `POLAR_ORG_ID` - Polar organization ID
- `POLAR_WEBHOOK_SECRET` - Secret for verifying Polar webhooks
- `GITHUB_TOKEN` - GitHub personal access token (repo scope)
- `GITHUB_WEBHOOK_SECRET` - Secret for verifying GitHub webhooks

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Rate Limiting

- API endpoints: No explicit rate limiting (Vercel handles this)
- GitHub API: 5,000 requests/hour (authenticated)
- Polar API: Rate limits apply per Polar's documentation

## Webhook Setup

### Polar Webhook

1. Go to Polar dashboard → Settings → Webhooks
2. Add webhook URL: `https://no3dtools.com/api/v1/webhooks/polar`
3. Select events: `subscription.*`, `checkout.created`, `order.created`
4. Copy webhook secret to `POLAR_WEBHOOK_SECRET`

### GitHub Webhook

1. Go to `no3d-tools-library` repository → Settings → Webhooks
2. Add webhook URL: `https://no3dtools.com/api/v1/webhooks/github`
3. Content type: `application/json`
4. Select event: `push`
5. Generate secret and set as `GITHUB_WEBHOOK_SECRET`

## Testing

### Local Development

Use Vercel CLI for local testing:

```bash
npm install -g vercel
vercel dev
```

### Testing Webhooks

Use tools like:
- ngrok for local webhook testing
- Polar webhook testing in dashboard
- GitHub webhook delivery testing

## Support

For API issues or questions:
- Check logs in Vercel dashboard
- Review webhook delivery logs
- Contact: dev@no3dtools.com
