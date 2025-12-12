Product Requirements Document

**NO3D Tools Asset Library**

Subscriber Flow & Blender Add-on System

|                      |                                   |
|----------------------|-----------------------------------|
| **Document Version** | 1.0                               |
| **Date**             | December 11, 2025                 |
| **Product**          | no3dtools.com Subscription System |
| **Target Platform**  | Blender 5.0+                      |
| **Status**           | Draft                             |

1\. Executive Summary

This document outlines the requirements for implementing a comprehensive
subscriber flow for no3dtools.com, integrated with Polar for payment
processing and subscription management. The system includes a custom
Blender add-on called "NO3D Tools Asset Library" (customer-facing product offering) that provides subscribers
with gated access to product libraries (bundles) based on their
subscription tier.

**Important Note:** This is a NEW consumer add-on, separate from the existing "SOLVET Asset Management Add-on" (internal use, part of SOLVET workflow) which is used for exporting assets TO the library.

The add-on will feature an extensible architecture supporting both free
and premium features, with seamless integration to the ecommerce
platform via API authentication and webhook-driven updates.

2\. Objectives

1.  Create a seamless subscriber onboarding and management flow
    integrated with Polar

2.  Develop a Blender 5.0+ compatible add-on for library access and
    asset management

3.  Implement tiered access control with free and premium feature
    separation

4.  Enable automatic product catalog synchronization via GitHub
    repository

5.  Build an extensible architecture for future feature additions

6.  Provide intuitive asset discovery through multiple access methods

3\. Stakeholders

|                      |                                           |                                     |
|----------------------|-------------------------------------------|-------------------------------------|
| **Role**             | **Responsibility**                        | **Interest**                        |
| **Product Owner**    | Define requirements, approve deliverables | Business value, user satisfaction   |
| **Developers**       | Implementation, testing, deployment       | Technical feasibility, code quality |
| **Subscribers**      | End users of the add-on                   | Ease of use, asset quality          |
| **Content Creators** | Create and maintain product libraries     | Asset organization, updates         |

4\. System Architecture Overview

4.1 High-Level Architecture

The system consists of four primary components that communicate via
secure APIs and webhooks:

- **Website Frontend (no3dtools.com):** User-facing subscription
  management, product catalog display, and download portal

- **Polar Integration:** Payment processing, subscription lifecycle
  management, and webhook events

- **Backend API:** Authentication, license validation, and product
  catalog management

- **Blender Add-on:** Client-side application for asset access and
  library management

4.2 Data Flow Diagram

The subscription and access flow follows this sequence:

> User → Website → Polar (Payment) → Webhook → Backend → Database Add-on
> → Backend API → License Validation → Asset Access

5\. Subscriber Customer Flow

5.1 Registration & Subscription

5.1.1 New User Journey

- **Discovery:** User visits no3dtools.com and browses available product
  libraries

- **Selection:** User selects subscription tier(s) or individual library
  bundles

- **Checkout:** Redirect to Polar checkout with pre-selected products

- **Account Creation:** Automatic account creation via Polar customer
  data

- **Confirmation:** Email with license key, download link, and setup
  instructions

- **Onboarding:** Guided add-on installation and authentication

5.1.2 Subscription Tiers

|                       |                               |                                            |               |
|-----------------------|-------------------------------|--------------------------------------------|---------------|
| **Tier**              | **Access Level**              | **Features**                               | **Price**     |
| **Free**              | Sample libraries, basic tools | Limited assets, community support          | \$0/month     |
| **Individual Bundle** | Single library access         | Full library, updates, priority support    | \$XX one-time |
| **Pro Monthly**       | All libraries                 | Full access, early releases, premium tools | \$XX/month    |
| **Pro Annual**        | All libraries                 | Full access + 2 months free                | \$XX/year     |

5.2 Polar Integration

5.2.1 Webhook Events

The backend must handle the following Polar webhook events:

|                       |                                                                    |
|-----------------------|--------------------------------------------------------------------|
| **Event**             | **Action**                                                         |
| checkout.created      | Initialize pending order, create provisional user record           |
| subscription.created  | Activate user account, assign library access, generate license key |
| subscription.updated  | Update library access based on tier changes                        |
| subscription.canceled | Mark subscription for end-of-period access revocation              |
| subscription.revoked  | Immediately revoke premium library access                          |
| order.created         | Process one-time bundle purchase, grant permanent access           |

5.2.2 License Key Generation

License keys are generated upon successful subscription or purchase.
Each key is a unique identifier linking the user's Polar customer ID to
their no3dtools account. Keys follow the format:
NO3D-XXXX-XXXX-XXXX-XXXX where X represents alphanumeric characters.
Keys are stored hashed in the database and validated against Polar's
customer records on each authentication request.

5.3 Account Management Portal

The website dashboard provides subscribers with the following
capabilities:

- **Subscription Overview:** Current plan, renewal date, payment history

- **Library Access:** Visual list of accessible libraries with
  subscription status

- **License Management:** View/regenerate license keys, device
  deauthorization

- **Download Center:** Add-on downloads, version history, installation
  guides

- **Billing Portal:** Redirect to Polar for payment method and plan
  changes

6\. NO3D Tools Asset Library Blender Add-on

6.1 Technical Requirements

|                      |                                                     |
|----------------------|-----------------------------------------------------|
| **Requirement**      | **Specification**                                   |
| **Blender Version**  | 5.0+ (utilizing extensions platform)                |
| **Python Version**   | Python 3.11+ (bundled with Blender 5.0)             |
| **Architecture**     | Modular, plugin-based for extensibility             |
| **Dependencies**     | requests, PIL (optional for thumbnails)             |
| **Installation**     | Blender Extensions platform or manual ZIP           |
| **Update Mechanism** | Auto-update via Blender Extensions or in-app update |

6.2 Add-on Architecture

6.2.1 Module Structure

The add-on follows a modular architecture for maintainability and
extensibility:

> no3d_tools_library/ ├── \_\_init\_\_.py \# Main registration, bl_info
> ├── config.py \# Constants, API endpoints, settings ├── auth/ │ ├──
> \_\_init\_\_.py │ ├── license_manager.py \# License validation,
> storage │ └── api_client.py \# Backend API communication ├── ui/ │ ├──
> \_\_init\_\_.py │ ├── panels.py \# N-Panel UI components │ ├──
> menus.py \# Shift+A menu integrations │ ├── preferences.py \# Add-on
> preferences │ └── thumbnail_grid.py \# Visual asset browser ├──
> operators/ │ ├── \_\_init\_\_.py │ ├── asset_ops.py \# Asset
> import/append operations │ ├── library_ops.py \# Library management
> operations │ └── utility_ops.py \# Python-enabled utility features ├──
> core/ │ ├── \_\_init\_\_.py │ ├── catalog_sync.py \# GitHub catalog
> synchronization │ ├── asset_manager.py \# Local asset cache management
> │ └── update_checker.py \# Version checking and updates └── utils/ ├──
> \_\_init\_\_.py ├── icons.py \# Custom icon management └── helpers.py
> \# Utility functions

6.2.2 Extension Points

The architecture supports future expansion through:

- **Plugin Registry:** Dynamic registration of new feature modules

- **Hook System:** Pre/post hooks for asset operations

- **Custom Operators:** Base classes for creating new Python-enabled
  tools

- **UI Templates:** Reusable panel and menu components

6.3 User Interface Components

6.3.1 N-Panel (Sidebar Panel)

Located in the 3D View sidebar (N key), the panel provides comprehensive
library management:

**User Info Section**

- Display logged-in user email/username

- Current subscription tier badge

- License status indicator (Valid/Expired/Grace Period)

- Login/Logout button

- Link to web account management

**Library Browser Section**

- Collapsible list of subscribed libraries

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

6.3.2 Shift+A Menu Integration

Assets are accessible through Blender's native add menus:

**Node Editor (Shader/Geometry Nodes)**

- Shift+A → NO3D Tools → \[Library Name\] → \[Category\] → \[Asset\]

- Hierarchical menu structure mirroring library organization

- Node groups append directly to active node tree

- Locked items show subscription upgrade prompt

**3D View (Add Mesh Menu)**

- Shift+A → Mesh → NO3D Tools → \[Library Name\] → \[Asset\]

- Objects and collections append at 3D cursor

- Option to link vs append

6.4 Authentication & License System

6.4.1 Login Flow

- User clicks Login button in N-Panel

- Opens browser to no3dtools.com/auth/blender

- User authenticates (existing session or login)

- Website displays one-time authorization code

- User enters code in Blender add-on

- Add-on exchanges code for access token

- Token stored securely in Blender preferences

6.4.2 Token Management

- **Access Token:** Short-lived (1 hour), used for API requests

- **Refresh Token:** Long-lived (30 days), used to obtain new access
  tokens

- **Offline Grace Period:** 72-hour offline access with cached
  entitlements

- **Revocation:** Tokens invalidated on logout or subscription
  cancellation

6.4.3 Entitlement Verification

On each Blender startup and periodically during use, the add-on verifies
user entitlements by querying the backend API. The response includes a
list of accessible library IDs and feature flags. This data is cached
locally with a timestamp to enable offline functionality while ensuring
timely updates when connectivity is restored.

6.5 Product Catalog Synchronization

6.5.1 GitHub Repository as Product Database

The product catalog is maintained in a GitHub repository with the
following structure:

> no3d-tools-catalog/ ├── catalog.json \# Master catalog index ├──
> libraries/ │ ├── shader-nodes-pro/ │ │ ├── manifest.json \# Library
> metadata │ │ ├── assets/ │ │ │ ├── asset-001/ │ │ │ │ ├── meta.json │
> │ │ │ ├── thumbnail.png │ │ │ │ └── asset.blend │ │ │ └── ... │ │ └──
> categories.json │ └── ... └── thumbnails/ \# CDN-cached thumbnail
> images

6.5.2 Synchronization Mechanism

- **Webhook Trigger:** GitHub Actions workflow on push to main branch

- **Backend Processing:** Webhook handler parses changes and updates
  database

- **CDN Update:** Asset files and thumbnails pushed to CDN

- **Version Increment:** Catalog version number updated

- **Client Notification:** Add-on receives update notification on next
  check

6.5.3 Add-on Catalog Updates

- Automatic check on startup (configurable interval)

- Manual refresh button in N-Panel

- Delta updates: only download changed assets

- Background download with progress indicator

6.6 Feature Tiering (Free vs Premium)

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

6.7 Python-Enabled Features & Utilities

The add-on includes several utility features accessible via the N-Panel
Tools section:

**Free Utilities**

- **Quick Material Assign:** One-click material assignment from library

- **Node Group Organizer:** Auto-arrange and label imported node groups

- **Asset Info Viewer:** Display metadata for selected library assets

**Premium Utilities**

- **Batch Asset Importer:** Import multiple assets with customizable
  settings

- **Material Swapper:** Bulk replace materials across scene objects

- **Node Tree Analyzer:** Audit and optimize shader/geometry node trees

- **Export Presets:** Quick export with library-optimized settings

7\. Backend API Specifications

7.1 API Endpoints

|            |                              |                                              |
|------------|------------------------------|----------------------------------------------|
| **Method** | **Endpoint**                 | **Description**                              |
| POST       | /api/v1/auth/token           | Exchange auth code for access/refresh tokens |
| POST       | /api/v1/auth/refresh         | Refresh access token                         |
| GET        | /api/v1/user/entitlements    | Get user's accessible libraries and features |
| GET        | /api/v1/catalog/version      | Get current catalog version number           |
| GET        | /api/v1/catalog/index        | Get full catalog index with asset metadata   |
| GET        | /api/v1/catalog/delta        | Get changes since specified version          |
| GET        | /api/v1/assets/{id}/download | Get signed download URL for asset file       |
| POST       | /api/v1/webhooks/polar       | Polar webhook receiver endpoint              |
| POST       | /api/v1/webhooks/github      | GitHub catalog update webhook receiver       |

7.2 Response Formats

7.2.1 Entitlements Response

> { "user": { "id": "usr_xxx", "email": "user@example.com",
> "subscription_tier": "pro_monthly" }, "entitlements": { "libraries":
> \["lib_shader_nodes", "lib_geo_nodes"\], "features": \["batch_import",
> "priority_downloads"\], "expires_at": "2025-02-15T00:00:00Z" },
> "catalog_version": 42 }

7.2.2 Catalog Index Response

> { "version": 42, "libraries": \[{ "id": "lib_shader_nodes", "name":
> "Shader Nodes Pro", "description": "Premium shader node collection",
> "thumbnail_url": "https://cdn.../thumb.png", "asset_count": 150,
> "categories": \["Materials", "Effects", "Utilities"\] }\], "assets":
> \[{ "id": "asset_001", "library_id": "lib_shader_nodes", "name": "PBR
> Metal Shader", "category": "Materials", "tags": \["metal", "pbr",
> "realistic"\], "thumbnail_url": "https://cdn.../asset.png",
> "file_size": 245000, "version": "1.2.0" }\] }

8\. Security Considerations

8.1 Authentication Security

- All API communication over HTTPS/TLS 1.3

- OAuth 2.0 PKCE flow for device authorization

- Tokens stored in Blender's encrypted preferences

- Rate limiting on authentication endpoints

8.2 Asset Protection

- Signed, time-limited download URLs (15-minute expiry)

- Asset files encrypted at rest on CDN

- Local cache files not directly redistributable

- Watermarking option for premium assets (future consideration)

8.3 Webhook Security

- Polar webhook signature verification

- GitHub webhook secret validation

- IP allowlisting for webhook endpoints

9\. Development Phases

Phase 1: Foundation (Weeks 1-3)

- Backend API scaffolding and database schema

- Polar webhook integration

- Basic add-on structure with authentication

- GitHub catalog repository setup

Phase 2: Core Features (Weeks 4-6)

- N-Panel UI implementation

- Shift+A menu integration

- Asset download and caching system

- Catalog synchronization pipeline

Phase 3: Polish & Launch (Weeks 7-8)

- Thumbnail grid browser

- Premium utility tools

- Website account management portal

- Documentation and onboarding flow

- Beta testing and bug fixes

10\. Success Metrics

|                            |                         |                    |
|----------------------------|-------------------------|--------------------|
| **Metric**                 | **Target**              | **Measurement**    |
| Add-on Installation Rate   | \>80% of subscribers    | Analytics tracking |
| Daily Active Users         | \>40% of installed base | API request logs   |
| Asset Downloads/User/Month | \>15 assets             | Download tracking  |
| Subscription Retention     | \>85% month-over-month  | Polar analytics    |
| Free to Paid Conversion    | \>10% within 30 days    | Funnel analysis    |
| Support Ticket Volume      | \<5% of user base/month | Help desk metrics  |

11\. Risks and Mitigations

|                         |            |                                                      |
|-------------------------|------------|------------------------------------------------------|
| **Risk**                | **Impact** | **Mitigation**                                       |
| Blender API changes     | High       | Abstract Blender calls, maintain compatibility layer |
| Polar service outage    | High       | Cached entitlements, grace period for validation     |
| Asset piracy            | Medium     | Signed URLs, usage monitoring, DMCA process          |
| Catalog sync failures   | Medium     | Retry logic, manual sync option, status monitoring   |
| Poor offline experience | Low        | Robust local caching, clear offline mode indicators  |

12\. Future Considerations

The extensible architecture enables the following future enhancements:

- **User Asset Uploads:** Allow subscribers to submit assets for review
  and inclusion

- **Community Ratings:** Asset rating and review system within the
  add-on

- **AI-Powered Search:** Natural language asset discovery

- **Collaboration Features:** Team libraries and shared workspaces

- **Render Farm Integration:** Direct submission to cloud rendering
  services

- **Asset Versioning:** Track and revert to previous asset versions

- **Mobile Companion App:** Browse and queue assets from mobile device

13\. Appendix

A. Glossary

- **Library:** A collection of related assets sold as a bundle

- **Asset:** Individual item (node group, material, object) within a
  library

- **Entitlement:** User's access rights to specific libraries or
  features

- **N-Panel:** Blender's sidebar panel accessed via N key

- **Polar:** Third-party payment and subscription management platform

B. Reference Links

**Blender Extensions Platform:**
[extensions.blender.org](https://extensions.blender.org)

**Polar Documentation:** [docs.polar.sh](https://docs.polar.sh)

**Blender Python API:**
[docs.blender.org/api](https://docs.blender.org/api/current/)
