---
name: MVP Subscription System Implementation
overview: Implement MVP subscription system with single "All Libraries" subscription, account portal, ZIP downloads, and update notifications. This validates the subscription business model before adding bundles and Blender add-on.
todos:
  - id: mvp-1-polar-setup
    content: Create subscription product in Polar and generate checkout link
    status: completed
  - id: mvp-2-webhook-basic
    content: Create basic Polar webhook receiver endpoint with logging
    status: completed
  - id: mvp-3-subscription-ui
    content: Build subscription landing page with benefits and CTA
    status: completed
  - id: mvp-4-success-page
    content: Create checkout success page with account link
    status: completed
  - id: mvp-5-account-page
    content: Build account management page structure
    status: completed
  - id: mvp-6-polar-customer-api
    content: Integrate Polar Customer API to fetch subscription status
    status: completed
  - id: mvp-7-auth-flow
    content: Implement basic authentication using Polar customer portal
    status: completed
  - id: mvp-8-download-api
    content: Create download API endpoint with subscription verification
    status: completed
  - id: mvp-9-zip-generation
    content: Implement ZIP file generation from GitHub repository
    status: completed
  - id: mvp-10-download-ui
    content: Add download button and flow to account page
    status: completed
  - id: mvp-11-version-tracking
    content: Create catalog version tracking system
    status: completed
  - id: mvp-12-github-webhook
    content: Create GitHub webhook receiver for version updates
    status: completed
  - id: mvp-13-update-detection
    content: Implement update detection and badge on account page
    status: completed
  - id: mvp-14-version-api
    content: Create version API endpoint for frontend checks
    status: completed
  - id: mvp-15-testing
    content: End-to-end testing of all flows
    status: completed
  - id: mvp-16-optimization
    content: Performance optimization and error handling
    status: completed
  - id: mvp-17-documentation
    content: Create user and developer documentation
    status: completed
---

# MVP Subscription System Implementation Plan

## Overview

Implement a minimal viable subscription system to validate the business model. Single "All Libraries" subscription only - no bundles, no Blender add-on. Users subscribe and download entire library as ZIP file.

**Timeline:** 3-4 weeks

**Repository:** `no3d-tools-website` (separate GitHub repo)

---

## Phase 1: Polar Subscription Setup (Week 1)

### 1.1 Create Subscription Product in Polar

- Create single subscription product: "NO3D Tools Library - Full Access"
- Set monthly pricing (annual optional later)
- **Important:** This is a recurring subscription that grants ongoing access to the entire library, including all future products added while subscription is active
- Generate checkout link
- Document product ID and checkout link ID

**Files to create:**

- `scripts/setup/create-subscription-product.js` - Script to create subscription product in Polar
- `config/subscription-config.json` - Store subscription product IDs and checkout links

**Tools to use:**

- **Polar MCP** - Test product creation and checkout link generation before writing script
- **Context7 MCP** - Look up Polar SDK documentation for subscription product creation

**Key code:**

```javascript
// scripts/setup/create-subscription-product.js
const { Polar } = require('@polar-sh/sdk');
// Create subscription product with type: 'subscription'
// Store product ID and checkout link ID in config
```

### 1.2 Basic Webhook Receiver

- Create Vercel serverless function: `api/v1/webhooks/polar.js`
- Verify Polar webhook signatures
- Log webhook events (subscription.created, subscription.updated, subscription.canceled)
- Store minimal state (can use Polar metadata initially)

**Files to create:**

- `api/v1/webhooks/polar.js` - Webhook endpoint
- `.env.example` - Add `POLAR_WEBHOOK_SECRET`

**Tools to use:**

- **Vercel CLI** - Test webhook endpoint locally with `vercel dev`
- **Polar MCP** - Test webhook signature verification and event handling
- **Context7 MCP** - Look up webhook verification examples and best practices

**Key code:**

```javascript
// api/v1/webhooks/polar.js
import { verifyPolarWebhook } from '@polar-sh/sdk';
// Verify signature, log events, return 200
```

---

## Phase 2: Website Subscription UI (Week 1)

### 2.1 Subscription Landing Page

- Create subscription page or section on homepage
- Display subscription benefits
- Show product count (fetch from GitHub API)
- Add "Subscribe" CTA button
- Integrate Polar checkout (use existing checkout link system)

**Files to modify/create:**

- `index.html` or `subscribe.html` - Subscription landing page
- `styles.css` - Subscription UI styles
- `script.js` - Add subscription UI logic and product count fetch

**Key features:**

- Hero section: "Get Full Access to All NO3D Tools"
- Benefits list
- Pricing display
- Subscribe button linking to Polar checkout
- Product count: "X+ products available" (fetch from GitHub API)

### 2.2 Success Page

- Create `success.html` - Post-checkout confirmation
- Thank user for subscribing
- Link to account page
- Instructions for accessing downloads

**Files to create:**

- `success.html` - Checkout success page

---

## Phase 3: Account Management Portal (Week 2)

### 3.1 Account Page Structure

- Create `account.html` - Account management page
- Basic layout with subscription status section
- Download section
- Link to Polar customer portal

**Files to create:**

- `account.html` - Account management page
- `styles.css` - Add account page styles (or separate `account.css`)

### 3.2 Polar Customer API Integration

- Integrate Polar Customer API to fetch subscription status
- Display active subscription status
- Show subscription expiration date
- Handle unauthenticated users (redirect to login/Polar portal)

**Files to modify:**

- `account.html` - Add subscription status display
- `script.js` - Add Polar Customer API integration

**Key code:**

```javascript
// Fetch customer subscription from Polar API
// Display: Active/Expired status, expiration date
// Show download link if active
```

### 3.3 Basic Authentication Flow

- Simple authentication using Polar customer portal
- Store session in localStorage/cookies
- Redirect to Polar login if not authenticated
- Handle authentication callback

**Files to modify:**

- `script.js` - Add authentication logic
- `account.html` - Add login/logout buttons

**Implementation:**

- Use Polar customer portal redirect for login
- Store customer ID in session after authentication
- Check authentication on account page load

---

## Phase 4: Download System (Week 2-3)

### 4.1 Download API Endpoint

- Create Vercel serverless function: `api/v1/library/download.js`
- Verify Polar subscription before allowing download
- Fetch all products from GitHub repository
- Generate ZIP file with all products
- Return signed download URL (time-limited, 15 minutes)

**Files to create:**

- `api/v1/library/download.js` - Download endpoint
- `package.json` - Add dependencies: `archiver`, `@octokit/rest`

**Tools to use:**

- **Vercel CLI** - Test serverless function locally, test ZIP generation
- **Polar MCP** - Verify subscription status checks work correctly
- **Context7 MCP** - Look up GitHub API examples for fetching repository contents, archiver usage

**Key code:**

```javascript
// api/v1/library/download.js
import archiver from 'archiver';
import { Octokit } from '@octokit/rest';
// 1. Verify subscription via Polar API
// 2. Fetch all products from GitHub
// 3. Generate ZIP file
// 4. Upload to temporary storage or stream
// 5. Return signed download URL
```

### 4.2 ZIP Generation Logic

- Fetch product list from GitHub API (`no3d-tools-library` repo)
- Iterate through `Dojo*/` folders
- Include `.blend`, `.json`, icon files for each product
- **Always include ALL current products** - subscription grants access to entire library, not a snapshot
- Create ZIP archive
- Handle large files (streaming, caching)

**Optimization:**

- Cache ZIP file (regenerate on product updates)
- Use GitHub raw URLs for file access
- Stream large ZIP files
- Show download progress

**Note:** Each download includes all products available at download time. As new products are added to the library, subscribers can re-download to get the updated collection.

### 4.3 Download Authorization

- Verify user has active Polar subscription
- Use Polar Customer ID from session
- Check subscription status via Polar API
- Return 403 if subscription invalid

**Files to modify:**

- `api/v1/library/download.js` - Add authorization check
- `api/utils/polar-auth.js` - Helper function for subscription verification

### 4.4 Frontend Download Integration

- Add download button to account page
- Call download API endpoint
- Handle download URL redirect
- Show download progress/status

**Files to modify:**

- `account.html` - Add download button
- `script.js` - Add download functionality

---

## Phase 5: Update Notification System (Week 3)

### 5.1 Catalog Version Tracking

- Create version tracking system
- Store version in `catalog.json` or `version.json` in GitHub repo
- Increment version on product changes

**Files to create:**

- `scripts/sync/update-catalog-version.js` - Script to update catalog version
- `catalog.json` - Version file (in `no3d-tools-library` repo or website repo)

**Key structure:**

```json
{
  "version": 1,
  "last_updated": "2025-01-15T00:00:00Z",
  "product_count": 150
}
```

### 5.2 GitHub Webhook Receiver

- Create Vercel serverless function: `api/v1/webhooks/github.js`
- Receive webhook on product changes
- Increment catalog version
- Update version file

**Files to create:**

- `api/v1/webhooks/github.js` - GitHub webhook endpoint
- `.env.example` - Add `GITHUB_WEBHOOK_SECRET`

**Tools to use:**

- **Vercel CLI** - Test webhook endpoint locally, simulate GitHub webhook payloads
- **Context7 MCP** - Look up GitHub webhook verification examples, GitHub API for file updates

**Setup:**

- Configure GitHub webhook in `no3d-tools-library` repo
- Webhook URL: `https://no3dtools.com/api/v1/webhooks/github`
- Events: `push` to main branch

### 5.3 Update Detection

- Store user's last download version
- Compare with current catalog version
- Show "Update Available" badge on account page when new products are added
- Enable re-download with updated library (includes all products, including new ones)

**Files to modify:**

- `account.html` - Add update badge
- `script.js` - Add version comparison logic
- `api/v1/library/download.js` - Store download version in response

**Implementation:**

- Store last download version in localStorage or user metadata
- Fetch current version from catalog.json
- Compare versions and show badge if newer version available
- Clear badge after re-download
- **Key behavior:** Re-download always includes ALL current products, not just new ones. Subscription grants ongoing access to entire library.

### 5.4 Version API Endpoint

- Create endpoint: `api/v1/catalog/version.js`
- Return current catalog version
- Used by frontend to check for updates

**Files to create:**

- `api/v1/catalog/version.js` - Version endpoint

---

## Phase 6: Testing & Launch Prep (Week 4)

### 6.1 End-to-End Testing

- Test subscription flow: website → Polar checkout → account page
- Test download flow: account page → API → ZIP download
- Test update notification: product change → webhook → version update → badge
- Test error handling: expired subscription, failed downloads, etc.

**Test scenarios:**

- New user subscription flow
- Download with active subscription
- Download with expired subscription (should fail)
- Update detection and re-download
- Webhook processing

**Tools to use:**

- **Vercel CLI** - Local testing of all serverless functions before deployment
- **Polar MCP** - Test subscription creation, webhook events, customer API calls
- **Context7 MCP** - Look up testing best practices, error handling patterns

### 6.2 Performance Optimization

- Optimize ZIP generation (caching, streaming)
- Optimize GitHub API calls (rate limiting, caching)
- Optimize frontend loading
- Test with large library (100+ products)

**Tools to use:**

- **Vercel CLI** - Monitor function execution times, test performance locally
- **Context7 MCP** - Look up optimization techniques for serverless functions, ZIP streaming, API rate limiting

### 6.3 Documentation

- User documentation: How to subscribe and download
- Developer documentation: API endpoints, webhook setup
- Configuration guide: Environment variables, Polar setup

**Files to create:**

- `docs/user-guide.md` - User instructions
- `docs/api-reference.md` - API documentation
- `docs/setup-guide.md` - Setup instructions

### 6.4 Launch Checklist

- [ ] Polar subscription product created
- [ ] Webhook endpoints configured
- [ ] GitHub webhook configured
- [ ] Environment variables set in Vercel
- [ ] Download system tested
- [ ] Update system tested
- [ ] Account page functional
- [ ] Documentation complete
- [ ] Beta testing completed

---

## Technical Requirements

### Dependencies

- `@polar-sh/sdk` - Polar API client
- `@octokit/rest` - GitHub API client
- `archiver` - ZIP file generation
- Vercel serverless functions support

### Development Tools (Use Judiciously)

- **Context7 MCP** - For documentation and code examples (library APIs, best practices)
- **Polar MCP** - For Polar API interactions (creating products, managing subscriptions, webhook testing)
- **Vercel CLI** - For local development, testing serverless functions, and deployment
- Use these tools strategically during development to:
  - Look up API documentation and examples
  - Test Polar operations without writing full scripts
  - Test serverless functions locally before deployment
  - Verify webhook configurations

### Environment Variables

- `POLAR_API_TOKEN` - Polar API token
- `POLAR_ORG_ID` - Polar organization ID
- `POLAR_WEBHOOK_SECRET` - Polar webhook secret
- `GITHUB_TOKEN` - GitHub API token (for accessing no3d-tools-library)
- `GITHUB_WEBHOOK_SECRET` - GitHub webhook secret

### API Endpoints

- `POST /api/v1/webhooks/polar` - Polar webhook receiver
- `POST /api/v1/webhooks/github` - GitHub webhook receiver
- `GET /api/v1/library/download` - Library download endpoint
- `GET /api/v1/catalog/version` - Catalog version endpoint

---

## Success Criteria

- Users can subscribe via website
- Subscribers can access account page
- Subscribers can download entire library as ZIP
- Update notifications work correctly
- Webhooks process events successfully
- System handles errors gracefully

---

## Next Steps After MVP

Once MVP is validated with positive metrics:

1. Add bundle management system (Full Phase)
2. Build Blender add-on (Full Phase)
3. Add multiple subscription tiers
4. Enhance download system with incremental updates