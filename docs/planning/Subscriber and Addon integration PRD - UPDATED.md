Product Requirements Document

**NO3D Tools Asset Library**

Subscriber Flow & Blender Add-on System

|                      |                                   |
|----------------------|-----------------------------------|
| **Document Version** | 2.0                               |
| **Date**             | December 2024                     |
| **Product**          | no3dtools.com Subscription System |
| **Target Platform**  | Blender 4.5+ (5.0+ planned)       |
| **Status**           | Updated - Aligned with Codebase   |

---

## 1. Executive Summary

This document outlines the requirements for implementing a comprehensive subscriber flow for no3dtools.com, integrated with Polar for payment processing and subscription management. The system includes a **new** Blender add-on called "NO3D Tools Asset Library" that provides subscribers with gated access to product libraries (bundles) based on their subscription tier.

**Important Note:** This is a NEW consumer add-on (customer-facing product offering), separate from the existing "SOLVET Asset Management Add-on" (internal use, part of SOLVET workflow) which is used for exporting assets TO the library. This new add-on will be used for importing/consuming assets FROM the library.

The add-on will feature an extensible architecture supporting both free and premium features, with seamless integration to the ecommerce platform via API authentication and webhook-driven updates.

**System Architecture:**
- **Backend:** Vercel Serverless Functions (not a separate backend service)
- **Database:** GitHub repository (`no3d-tools-library`) as product database, with Polar metadata for customer/subscription data
- **Website:** Static HTML/CSS/JS on Vercel with serverless API functions
- **Product Structure:** Individual products in `Dojo*/ProductName/` folders, mapped to virtual libraries via metadata tags

---

## 2. Objectives

1. Create a seamless subscriber onboarding and management flow integrated with Polar

2. Develop a Blender 4.5+ compatible add-on (with 5.0+ planned) for library access and asset management

3. Implement tiered access control with free and premium feature separation

4. Enable automatic product catalog synchronization via GitHub repository

5. Build an extensible architecture for future feature additions

6. Provide intuitive asset discovery through multiple access methods

7. Support hybrid model: both subscription-based library access AND one-time product purchases

---

## 3. Stakeholders

|                      |                                           |                                     |
|----------------------|-------------------------------------------|-------------------------------------|
| **Role**             | **Responsibility**                        | **Interest**                        |
| **Product Owner**    | Define requirements, approve deliverables | Business value, user satisfaction   |
| **Developers**       | Implementation, testing, deployment       | Technical feasibility, code quality |
| **Subscribers**      | End users of the add-on                   | Ease of use, asset quality          |
| **Content Creators** | Create and maintain product libraries     | Asset organization, updates         |

---

## 4. System Architecture Overview

### 4.1 High-Level Architecture

The system consists of five primary components that communicate via secure APIs and webhooks:

- **Website Frontend (no3dtools.com):** Static HTML/CSS/JS site deployed on Vercel, with serverless API functions for backend operations. User-facing subscription management, product catalog display, and download portal.

- **Vercel Serverless API Functions:** Backend API endpoints implemented as Vercel serverless functions (Node.js). Handles authentication, license validation, product catalog management, and webhook processing. No separate backend service required.

- **GitHub Repository Database:** The `no3d-tools-library` repository serves as the product database. Products are stored in `Dojo*/ProductName/` folders with `.blend`, `.json`, and icon files. Catalog is generated dynamically from this structure.

- **Polar Integration:** Payment processing, subscription lifecycle management, customer accounts, and webhook events. Polar Customer ID is used as the primary license identifier.

- **Blender Add-on:** Client-side application for asset access and library management. This is the "NO3D Tools Asset Library" add-on (customer-facing), separate from the "SOLVET Asset Management Add-on" (internal export tool).

### 4.2 Data Flow Diagram

The subscription and access flow follows this sequence:

> User → Website → Polar (Payment) → Webhook → Vercel Serverless Function → Polar API → Add-on → Vercel API → License Validation → Asset Access

**Detailed Flow:**
1. User visits website and subscribes via Polar checkout
2. Polar webhook triggers Vercel serverless function
3. Serverless function updates customer entitlements (stored in Polar metadata or lightweight database)
4. User installs Blender add-on and authenticates
5. Add-on queries Vercel API for entitlements
6. Add-on fetches catalog from GitHub API or Vercel API
7. Add-on downloads assets based on subscription tier

### 4.3 Technology Stack

**Frontend:**
- HTML5, Vanilla JavaScript, CSS
- Deployed on Vercel
- Polar Checkout SDK for payments

**Backend:**
- Vercel Serverless Functions (Node.js)
- Polar API for customer/subscription management
- GitHub API for product catalog access
- Optional: Supabase/PlanetScale for additional state if needed

**Database:**
- GitHub repository (`no3d-tools-library`) as product database
- Polar customer metadata for subscription data
- Optional lightweight database for session/state management

**E-commerce:**
- Polar.sh for payments and subscriptions

**Blender Add-on:**
- Python 3.10+ (bundled with Blender 4.5+)
- Blender 4.5+ API (5.0+ planned)
- Traditional ZIP installation initially (Extensions platform in 5.0+)

---

## 5. Subscriber Customer Flow

### 5.1 Registration & Subscription

#### 5.1.1 New User Journey

- **Discovery:** User visits no3dtools.com and browses available product libraries (grouped by metadata tags)

- **Selection:** User selects subscription tier(s) or individual library bundles. Website displays both subscription options and one-time purchase options (hybrid model).

- **Checkout:** Redirect to Polar checkout (embedded modal or redirect) with pre-selected products

- **Account Creation:** Automatic account creation via Polar customer data

- **Confirmation:** Email with setup instructions and link to account management portal

- **Onboarding:** Guided add-on installation and authentication via device authorization flow

#### 5.1.2 Subscription Tiers

**Note:** Products will be mapped to subscription tiers using metadata tags initially. Virtual "libraries" are created by grouping products with matching tags (e.g., all products with tag `shader-nodes` = "Shader Nodes Library").

|                       |                               |                                            |               |
|-----------------------|-------------------------------|--------------------------------------------|---------------|
| **Tier**              | **Access Level**              | **Features**                               | **Price**     |
| **Free**              | Sample libraries, basic tools | Limited assets, community support          | $0/month     |
| **Individual Bundle** | Single library access         | Full library, updates, priority support    | $XX one-time |
| **Pro Monthly**       | All libraries                 | Full access, early releases, premium tools | $XX/month    |
| **Pro Annual**        | All libraries                 | Full access + 2 months free                | $XX/year     |

**Hybrid Model:**
- Subscriptions grant access to product libraries (grouped by tags)
- One-time purchases grant permanent access to individual products
- Both models supported simultaneously

### 5.2 Polar Integration

#### 5.2.1 Webhook Events

Vercel serverless functions must handle the following Polar webhook events:

|                       |                                                                    |
|-----------------------|--------------------------------------------------------------------|
| **Event**             | **Action**                                                         |
| checkout.created      | Initialize pending order, create provisional user record           |
| subscription.created  | Activate user account, assign library access based on subscription |
| subscription.updated  | Update library access based on tier changes                        |
| subscription.canceled | Mark subscription for end-of-period access revocation              |
| subscription.revoked  | Immediately revoke premium library access                          |
| order.created         | Process one-time bundle purchase, grant permanent access           |

**Webhook Implementation:**
- Endpoint: `/api/v1/webhooks/polar` (Vercel serverless function)
- Verify Polar webhook signatures
- Process events asynchronously
- Update customer entitlements in Polar metadata or database

#### 5.2.2 License Identification

**Primary Approach:** Use Polar Customer ID as the license identifier.

- Polar Customer ID is unique and automatically tied to subscription
- No separate license key generation needed initially
- Stored in Blender preferences after authentication
- Validated against Polar API on each entitlement check

**Future Enhancement:** Custom license keys (format: NO3D-XXXX-XXXX-XXXX-XXXX) can be added later if needed for branding. These would map to Polar Customer IDs in the backend.

### 5.3 Account Management Portal

The website will include an account management page (`/account.html`) that provides subscribers with the following capabilities:

- **Subscription Overview:** Current plan, renewal date, payment history (fetched from Polar API)

- **Library Access:** Visual list of accessible libraries with subscription status. Libraries are virtual groupings based on product metadata tags.

- **License Management:** View Polar Customer ID, device deauthorization, authentication status

- **Download Center:** Add-on downloads, version history, installation guides

- **Billing Portal:** Redirect to Polar customer portal for payment method and plan changes

**Implementation:**
- Static HTML page with JavaScript
- Uses Polar Customer API to fetch subscription data
- Client-side authentication (session stored in localStorage/cookies)
- Redirects to login if not authenticated

---

## 6. NO3D Tools Asset Library Blender Add-on

### 6.1 Technical Requirements

|                      |                                                     |
|----------------------|-----------------------------------------------------|
| **Requirement**      | **Specification**                                   |
| **Blender Version**  | 4.5+ (5.0+ planned, Extensions platform support)   |
| **Python Version**   | Python 3.10+ (bundled with Blender 4.5+)           |
| **Architecture**     | Modular, plugin-based for extensibility             |
| **Dependencies**     | requests, PIL (optional for thumbnails)             |
| **Installation**     | Manual ZIP install initially (Extensions platform in 5.0+) |
| **Update Mechanism** | In-app update checker (Extensions platform auto-update in 5.0+) |

**Note:** This is a NEW consumer add-on (customer-facing product offering), separate from the existing "SOLVET Asset Management Add-on" (internal use, part of SOLVET workflow). These should be in separate repositories:
- `no3d-tools-addon` (or `no3d-tools-asset-library-addon`) for this customer-facing add-on
- `solvet-asset-management-addon` (or similar) for the internal export add-on

### 6.2 Add-on Architecture

#### 6.2.1 Module Structure

The add-on follows a modular architecture for maintainability and extensibility:

```
no3d_tools_library/
├── __init__.py          # Main registration, bl_info
├── config.py            # Constants, API endpoints, settings
├── auth/
│   ├── __init__.py
│   ├── license_manager.py  # License validation, storage (uses Polar Customer ID)
│   └── api_client.py      # Backend API communication
├── ui/
│   ├── __init__.py
│   ├── panels.py         # N-Panel UI components
│   ├── menus.py           # Shift+A menu integrations
│   ├── preferences.py     # Add-on preferences
│   └── thumbnail_grid.py # Visual asset browser
├── operators/
│   ├── __init__.py
│   ├── asset_ops.py      # Asset import/append operations
│   ├── library_ops.py    # Library management operations
│   └── utility_ops.py    # Python-enabled utility features
├── core/
│   ├── __init__.py
│   ├── catalog_sync.py    # GitHub catalog synchronization
│   ├── asset_manager.py   # Local asset cache management
│   └── update_checker.py # Version checking and updates
└── utils/
    ├── __init__.py
    ├── icons.py           # Custom icon management
    └── helpers.py         # Utility functions
```

#### 6.2.2 Extension Points

The architecture supports future expansion through:

- **Plugin Registry:** Dynamic registration of new feature modules

- **Hook System:** Pre/post hooks for asset operations

- **Custom Operators:** Base classes for creating new Python-enabled tools

- **UI Templates:** Reusable panel and menu components

### 6.3 User Interface Components

#### 6.3.1 N-Panel (Sidebar Panel)

Located in the 3D View sidebar (N key), the panel provides comprehensive library management:

**User Info Section**

- Display logged-in user email/username (from Polar)
- Current subscription tier badge
- License status indicator (Valid/Expired/Grace Period) - based on Polar Customer ID validation
- Login/Logout button
- Link to web account management

**Library Browser Section**

- Collapsible list of subscribed libraries (virtual groupings from product tags)
- Download/Update status per library
- Visual indicators: Installed, Update Available, Not Downloaded
- One-click download/update buttons
- Storage usage display

**Thumbnail Grid Browser**

- Visual grid layout with adjustable thumbnail size
- Category/tag filtering dropdown
- Search bar with real-time filtering
- Click-to-append or drag-and-drop functionality
- Hover preview with asset details
- Pagination or infinite scroll for large libraries

**Tools & Utilities Section**

- Quick-access buttons for Python-enabled features
- Batch operations panel
- Settings and preferences shortcut
- Help and documentation links

#### 6.3.2 Shift+A Menu Integration

Assets are accessible through Blender's native add menus:

**Node Editor (Shader/Geometry Nodes)**

- Shift+A → NO3D Tools → [Library Name] → [Category] → [Asset]
- Hierarchical menu structure mirroring library organization
- Node groups append directly to active node tree
- Locked items show subscription upgrade prompt

**3D View (Add Mesh Menu)**

- Shift+A → Mesh → NO3D Tools → [Library Name] → [Asset]
- Objects and collections append at 3D cursor
- Option to link vs append

### 6.4 Authentication & License System

#### 6.4.1 Login Flow

Device authorization flow using Polar Customer API:

1. User clicks Login button in N-Panel
2. Opens browser to `no3dtools.com/auth/blender?device_code=XXX`
3. User authenticates with Polar (existing session or login via website)
4. Website displays one-time authorization code
5. User enters code in Blender add-on
6. Add-on exchanges code for access token via Vercel API (`/api/v1/auth/token`)
7. Token stored securely in Blender preferences
8. Polar Customer ID stored for license identification

**Alternative:** Direct Polar customer portal integration (simpler, less control).

#### 6.4.2 Token Management

- **Access Token:** JWT-based, short-lived (1 hour), used for API requests
- **Refresh Token:** Long-lived (30 days), used to obtain new access tokens
- **Polar Customer ID:** Stored as primary license identifier
- **Offline Grace Period:** 72-hour offline access with cached entitlements
- **Revocation:** Tokens invalidated on logout or subscription cancellation

**Token Storage:**
- Tokens stored in Blender's encrypted preferences
- Polar Customer ID stored alongside tokens
- Secure storage using Blender's preference encryption

#### 6.4.3 Entitlement Verification

On each Blender startup and periodically during use, the add-on verifies user entitlements by querying the Vercel API (`/api/v1/user/entitlements`). The response includes:

- List of accessible library IDs (based on product tags)
- Feature flags (premium tools access)
- Subscription tier information
- Expiration dates

This data is cached locally with a timestamp to enable offline functionality while ensuring timely updates when connectivity is restored.

**Entitlement Mapping:**
- Products are mapped to libraries via metadata tags
- Subscription tier determines which libraries are accessible
- One-time purchases grant permanent access to specific products

### 6.5 Product Catalog Synchronization

#### 6.5.1 GitHub Repository as Product Database

The product catalog is maintained in the `no3d-tools-library` GitHub repository with the following **actual** structure:

```
no3d-tools-library/
├── Dojo*/                    # Product category folders
│   ├── ProductName/         # Individual product folders
│   │   ├── ProductName.blend # Main asset file
│   │   ├── ProductName.json  # Product metadata (includes tags, catalog_name)
│   │   ├── icon_ProductName.png # Product thumbnail
│   │   ├── ProductName_desc.md  # Description (optional)
│   │   └── ProductName.mp4      # Video preview (optional)
│   └── ...
└── ...
```

**Catalog Generation:**
- Catalog index (`catalog.json`) is generated dynamically from product folders
- Vercel serverless function or GitHub Actions workflow scans repository
- Products grouped into virtual "libraries" based on metadata tags or `catalog_name` field
- No physical `libraries/` folder structure - libraries are logical groupings

**Product Metadata Structure:**
Each `ProductName.json` file contains:
- Product information (title, description, etc.)
- Tags array (used for library grouping)
- `catalog_name` field (optional, for explicit library assignment)
- Pricing and variant information
- Technical metadata (asset_type, blender_version, etc.)

#### 6.5.2 Synchronization Mechanism

- **Webhook Trigger:** GitHub webhook to `no3d-tools-website` repository on push to main branch
- **Backend Processing:** Vercel serverless function (`/api/v1/webhooks/github`) parses changes and updates catalog
- **Catalog Versioning:** Version number incremented and stored in `catalog.json` or separate `version.json`
- **CDN Update:** Asset files and thumbnails can be pushed to CDN (optional, can use GitHub raw URLs)
- **Client Notification:** Add-on receives update notification on next version check

**Catalog Update Flow:**
1. Product added/updated in `no3d-tools-library` repo
2. GitHub webhook triggers Vercel serverless function
3. Serverless function scans repository via GitHub API
4. Generates/updates `catalog.json` with new product data
5. Increments catalog version
6. Add-on checks version on startup and downloads delta updates

#### 6.5.3 Add-on Catalog Updates

- Automatic check on startup (configurable interval)
- Manual refresh button in N-Panel
- Delta updates: only download changed assets since last version
- Background download with progress indicator
- Catalog cached locally for offline access

### 6.6 Feature Tiering (Free vs Premium)

|                          |                         |                            |
|--------------------------|-------------------------|----------------------------|
| **Feature**              | **Free Users**          | **Premium Subscribers**    |
| Sample Asset Library     | ✓ Full Access           | ✓ Full Access              |
| Premium Libraries        | ✗ Locked (Preview Only) | ✓ Based on Subscription    |
| Thumbnail Browser        | ✓ Available             | ✓ Available                |
| Shift+A Menu Access      | ✓ Free Assets Only      | ✓ All Subscribed Libraries |
| Basic Utility Tools      | ✓ Available             | ✓ Available                |
| Premium Utility Tools    | ✗ Locked                | ✓ Available                |
| Batch Operations         | ✗ Locked                | ✓ Available                |
| Priority Asset Downloads | ✗ Standard Queue        | ✓ Priority Queue           |
| Early Access Releases    | ✗ Not Available         | ✓ Available                |

### 6.7 Python-Enabled Features & Utilities

The add-on includes several utility features accessible via the N-Panel Tools section:

**Free Utilities**

- **Quick Material Assign:** One-click material assignment from library
- **Node Group Organizer:** Auto-arrange and label imported node groups
- **Asset Info Viewer:** Display metadata for selected library assets

**Premium Utilities**

- **Batch Asset Importer:** Import multiple assets with customizable settings
- **Material Swapper:** Bulk replace materials across scene objects
- **Node Tree Analyzer:** Audit and optimize shader/geometry node trees
- **Export Presets:** Quick export with library-optimized settings

---

## 7. Backend API Specifications

### 7.1 Implementation Note

**All API endpoints are implemented as Vercel Serverless Functions (Node.js), not a separate backend service.**

Endpoints are located in the `no3d-tools-website` repository under `/api/v1/` directory.

### 7.2 API Endpoints

|            |                              |                                              |
|------------|------------------------------|----------------------------------------------|
| **Method** | **Endpoint**                 | **Description**                              |
| POST       | /api/v1/auth/token           | Exchange auth code for access/refresh tokens |
| POST       | /api/v1/auth/refresh         | Refresh access token                         |
| GET        | /api/v1/user/entitlements    | Get user's accessible libraries and features (uses Polar Customer ID) |
| GET        | /api/v1/catalog/version      | Get current catalog version number           |
| GET        | /api/v1/catalog/index        | Get full catalog index with asset metadata (generated from GitHub repo) |
| GET        | /api/v1/catalog/delta        | Get changes since specified version          |
| GET        | /api/v1/assets/{id}/download | Get signed download URL for asset file (from GitHub or CDN) |
| POST       | /api/v1/webhooks/polar       | Polar webhook receiver endpoint              |
| POST       | /api/v1/webhooks/github      | GitHub catalog update webhook receiver       |

**Implementation Details:**
- All endpoints are Vercel serverless functions
- Use Polar API for customer/subscription data
- Use GitHub API for product catalog data
- Optional: Use lightweight database (Supabase/PlanetScale) for session state if needed

### 7.3 Response Formats

#### 7.3.1 Entitlements Response

```json
{
  "user": {
    "id": "cus_xxx",
    "email": "user@example.com",
    "subscription_tier": "pro_monthly"
  },
  "entitlements": {
    "libraries": ["lib_shader_nodes", "lib_geo_nodes"],
    "features": ["batch_import", "priority_downloads"],
    "expires_at": "2025-02-15T00:00:00Z"
  },
  "catalog_version": 42
}
```

**Note:** Library IDs are virtual groupings based on product metadata tags.

#### 7.3.2 Catalog Index Response

```json
{
  "version": 42,
  "libraries": [
    {
      "id": "lib_shader_nodes",
      "name": "Shader Nodes Pro",
      "description": "Premium shader node collection",
      "thumbnail_url": "https://raw.githubusercontent.com/.../thumb.png",
      "asset_count": 150,
      "categories": ["Materials", "Effects", "Utilities"]
    }
  ],
  "assets": [
    {
      "id": "asset_001",
      "library_id": "lib_shader_nodes",
      "name": "PBR Metal Shader",
      "category": "Materials",
      "tags": ["metal", "pbr", "realistic"],
      "thumbnail_url": "https://raw.githubusercontent.com/.../asset.png",
      "file_size": 245000,
      "version": "1.2.0",
      "github_path": "DojoShaders/ProductName/ProductName.blend"
    }
  ]
}
```

**Note:** Catalog is generated from GitHub repository structure. Libraries are virtual groupings.

---

## 8. Security Considerations

### 8.1 Authentication Security

- All API communication over HTTPS/TLS 1.3
- Device authorization flow (OAuth 2.0-like) for Blender add-on
- JWT tokens for API authentication
- Tokens stored in Blender's encrypted preferences
- Rate limiting on authentication endpoints (Vercel serverless function limits)

### 8.2 Asset Protection

- Signed, time-limited download URLs (15-minute expiry) for premium assets
- Asset files served from GitHub raw URLs or CDN
- Local cache files not directly redistributable
- Watermarking option for premium assets (future consideration)

### 8.3 Webhook Security

- Polar webhook signature verification
- GitHub webhook secret validation
- IP allowlisting for webhook endpoints (Vercel configuration)

---

## 9. Development Phases

### Phase 1: Foundation (Weeks 1-4)

**Revised to align with codebase:**

- ✅ Set up Vercel serverless functions structure in `no3d-tools-website`
- ✅ Implement Polar webhook receiver (serverless function)
- ✅ Create basic add-on structure (NEW consumer add-on)
- ✅ Map existing products to subscription tiers (using metadata tags)
- ✅ Generate catalog index from GitHub repository (serverless function or GitHub Actions)
- ✅ Implement basic authentication flow (Polar-based, device authorization)
- ✅ Set up product-to-library mapping system

**Dependencies:**
- Vercel account (already have)
- Polar API access (already have)
- GitHub API access (already have)
- Optional: Lightweight database for session state

### Phase 2: Core Features (Weeks 5-8)

- ✅ Build N-Panel UI in Blender add-on
- ✅ Implement Shift+A menu integration
- ✅ Asset download system (from GitHub raw URLs or CDN)
- ✅ Catalog synchronization (GitHub webhook → catalog update)
- ✅ Website account management page (`/account.html`)
- ✅ Subscription tier enforcement in add-on
- ✅ Product library grouping and display

### Phase 3: Polish & Launch (Weeks 9-12)

- ✅ Thumbnail grid browser in add-on
- ✅ Premium utility tools implementation
- ✅ Complete account management portal
- ✅ Onboarding flow and documentation
- ✅ Beta testing with real users
- ✅ Performance optimization
- ✅ Blender 5.0 Extensions platform support (if 5.0 is stable)

---

## 10. Success Metrics

|                            |                         |                    |
|----------------------------|-------------------------|--------------------|
| **Metric**                 | **Target**              | **Measurement**    |
| Add-on Installation Rate   | >80% of subscribers    | Analytics tracking |
| Daily Active Users         | >40% of installed base | API request logs   |
| Asset Downloads/User/Month | >15 assets             | Download tracking  |
| Subscription Retention     | >85% month-over-month  | Polar analytics    |
| Free to Paid Conversion    | >10% within 30 days    | Funnel analysis    |
| Support Ticket Volume      | <5% of user base/month | Help desk metrics  |

---

## 11. Risks and Mitigations

|                         |            |                                                      |
|-------------------------|------------|------------------------------------------------------|
| **Risk**                | **Impact** | **Mitigation**                                       |
| Blender API changes     | High       | Abstract Blender calls, maintain compatibility layer |
| Polar service outage    | High       | Cached entitlements, grace period for validation     |
| GitHub API rate limits  | Medium     | Implement caching, use authenticated requests, CDN fallback |
| Asset piracy            | Medium     | Signed URLs, usage monitoring, DMCA process          |
| Catalog sync failures   | Medium     | Retry logic, manual sync option, status monitoring   |
| Poor offline experience | Low        | Robust local caching, clear offline mode indicators  |
| Vercel serverless limits| Medium     | Monitor function execution time, optimize code, upgrade plan if needed |

---

## 12. Future Considerations

The extensible architecture enables the following future enhancements:

- **User Asset Uploads:** Allow subscribers to submit assets for review and inclusion
- **Community Ratings:** Asset rating and review system within the add-on
- **AI-Powered Search:** Natural language asset discovery
- **Collaboration Features:** Team libraries and shared workspaces
- **Render Farm Integration:** Direct submission to cloud rendering services
- **Asset Versioning:** Track and revert to previous asset versions
- **Mobile Companion App:** Browse and queue assets from mobile device
- **Custom License Keys:** Branded license key generation (if needed)
- **Blender 5.0 Extensions Platform:** Full Extensions platform integration
- **Advanced Database:** Migrate to Supabase/PlanetScale if state management becomes complex

---

## 13. Appendix

### A. Glossary

- **Library:** A virtual collection of related assets grouped by metadata tags or `catalog_name`. Not a physical folder structure.

- **Asset:** Individual item (node group, material, object) within a product folder in the GitHub repository.

- **Entitlement:** User's access rights to specific libraries or features, determined by subscription tier or one-time purchase.

- **N-Panel:** Blender's sidebar panel accessed via N key.

- **Polar:** Third-party payment and subscription management platform.

- **Vercel Serverless Functions:** Backend API endpoints implemented as serverless functions in the Vercel platform.

- **Virtual Library:** A logical grouping of products based on metadata tags, not a physical folder structure.

### B. Reference Links

**Blender Extensions Platform:**
[extensions.blender.org](https://extensions.blender.org)

**Polar Documentation:** [docs.polar.sh](https://docs.polar.sh)

**Blender Python API:**
[docs.blender.org/api](https://docs.blender.org/api/current/)

**Vercel Serverless Functions:**
[docs.vercel.com/functions](https://docs.vercel.com/functions)

**GitHub API:**
[docs.github.com/en/rest](https://docs.github.com/en/rest)

### C. Codebase References

**Current System:**
- `no3d-tools-library` - Product database (GitHub repository)
- `no3d-tools-website` - Website (GitHub, Vercel)
- `solvet-asset-management-addon` - Internal export add-on (GitHub) - separate from this consumer add-on
- `no3d-tools-addon` - Customer-facing asset library add-on (GitHub) - this document describes this add-on
- `solvet-global` - This repository (coordination)

**Key Documentation:**
- `README.md` - System overview
- `docs/architecture/solvet-stack-diagram.md` - Current architecture
- `docs/planning/REPOSITORY_STRUCTURE.md` - Product structure
- `docs/guides/POLAR_CHECKOUT_OPTIONS.md` - Current Polar integration

---

**Document Status:** Updated and Aligned with Codebase  
**Next Action:** Begin Phase 1 implementation
