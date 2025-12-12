# PRD Modification Recommendations
## Subscriber and Addon Integration PRD - Codebase Alignment

**Date:** December 2024  
**Document:** Subscriber and Addon integration PRD.md  
**Status:** Recommendations for Alignment

---

## Executive Summary

The PRD was written without full knowledge of the existing SOLVET codebase. This document outlines critical modifications needed to align the PRD with the current system architecture, technology stack, and product structure.

**Key Findings:**
- No backend API currently exists (PRD assumes one)
- Products are individual items, not organized into "libraries/bundles"
- Current system uses one-time purchases, not subscriptions
- Blender add-on is for EXPORTING assets, not consuming them
- Website is static HTML/JS, not a full-stack application
- No authentication or license management system exists

---

## 1. Architecture Modifications

### 1.1 Backend API - DOES NOT EXIST

**PRD Assumption:** Backend API with endpoints for authentication, entitlements, catalog management

**Reality:** 
- Website is static HTML/CSS/JS deployed on Vercel
- No backend server exists
- No database exists
- Products are stored in GitHub repository (`no3d-tools-library`)
- Website fetches products via GitHub API

**Recommendation:**
- **Option A (Recommended):** Use Vercel Serverless Functions for API endpoints
  - Create `/api/v1/` endpoints as Vercel serverless functions
  - Use Polar API directly from serverless functions (no separate database needed initially)
  - Store minimal state in Polar's customer metadata or use a lightweight database (Supabase/PlanetScale)
  
- **Option B:** Build separate backend service
  - Deploy Express.js/Node.js backend (Vercel, Railway, or Fly.io)
  - Add database (PostgreSQL via Supabase or similar)
  - More complex but provides full control

**PRD Section to Update:** Section 4.1, Section 7 (Backend API Specifications)

### 1.2 Product Structure - Individual Products vs Libraries

**PRD Assumption:** Products organized into "libraries" or "bundles" (e.g., "Shader Nodes Pro", "Geometry Nodes Pro")

**Reality:**
- Products are individual items in folders: `Dojo*/ProductName/`
- Each product has its own `.blend`, `.json`, icon files
- No bundle/library concept exists
- Products are tagged but not grouped into subscription tiers

**Recommendation:**
- **Phase 1:** Map existing products to subscription tiers using metadata tags
  - Use `catalog_name` or `tags` in product JSON to group products
  - Create virtual "libraries" based on product metadata
  - Example: All products with tag `shader-nodes` = "Shader Nodes Library"
  
- **Phase 2:** Implement actual bundle products in Polar
  - Create bundle products in Polar that include multiple individual products
  - Update product JSON schema to include `bundle_id` field
  - Website displays both individual products and bundles

**PRD Section to Update:** Section 5.1.2 (Subscription Tiers), Section 6.5.1 (GitHub Repository Structure)

### 1.3 Website Technology Stack

**PRD Assumption:** Full-stack application with account management portal

**Reality:**
- Static HTML5 + Vanilla JavaScript
- Deployed on Vercel
- No server-side rendering
- No user accounts or authentication
- Products fetched via GitHub API client-side

**Recommendation:**
- Keep static site architecture but add:
  - Vercel serverless functions for API endpoints
  - Client-side authentication using Polar's customer API
  - Account management page (`/account.html`) that uses Polar API
  - Store auth tokens in localStorage (with security considerations)

**PRD Section to Update:** Section 4.1, Section 5.3 (Account Management Portal)

---

## 2. Blender Add-on Modifications

### 2.1 Add-on Purpose - Export vs Import

**PRD Assumption:** Add-on for consuming/importing assets from library

**Reality:**
- Current add-on (SOLVET Asset Management Add-on, in `solvet-asset-management-addon` or similar repo) is for EXPORTING assets TO the library
- No add-on exists for importing/consuming assets FROM the library
- This is a completely new add-on that needs to be built

**Recommendation:**
- **Clarify in PRD:** This is a NEW add-on, separate from the export add-on
- **Naming:** 
  - Customer-facing add-on: "NO3D Tools Asset Library" (consumer, product offering)
  - Internal add-on: "SOLVET Asset Management Add-on" (producer, internal use, part of SOLVET workflow)
- **Repository:** Should be in separate repositories:
  - `no3d-tools-addon` (or `no3d-tools-asset-library-addon`) for customer-facing add-on
  - `solvet-asset-management-addon` (or similar) for internal export add-on
- **Architecture:** The PRD's add-on architecture (Section 6.2) is appropriate for the NEW consumer add-on

**PRD Section to Update:** Section 1 (Executive Summary), Section 6 (NO3D Tools Asset Library Blender Add-on)

### 2.2 Blender Version Compatibility

**PRD Assumption:** Blender 5.0+ with Extensions platform

**Reality:**
- Current system targets Blender 4.5+
- Blender 5.0 is not yet released (as of Dec 2024)
- Extensions platform is new in Blender 5.0

**Recommendation:**
- **Target Blender 4.5+ initially** for broader compatibility
- **Plan for Blender 5.0+** as future enhancement
- Use traditional add-on installation (ZIP install) initially
- Add Extensions platform support when Blender 5.0 is stable

**PRD Section to Update:** Section 6.1 (Technical Requirements), Document header

---

## 3. Subscription Model Modifications

### 3.1 Current Purchase Model

**PRD Assumption:** Subscription-based model with tiers (Free, Individual Bundle, Pro Monthly, Pro Annual)

**Reality:**
- Current system uses one-time purchases via Polar
- No subscription products exist
- No free tier exists
- Products are sold individually

**Recommendation:**
- **Phase 1:** Implement subscription products in Polar
  - Create subscription products for different tiers
  - Map existing individual products to subscription access
  - Implement free tier with sample products
  
- **Phase 2:** Hybrid model
  - Support both one-time purchases AND subscriptions
  - Subscriptions grant access to product libraries
  - One-time purchases grant permanent access to individual products

**PRD Section to Update:** Section 5.1.2 (Subscription Tiers), Section 5.2 (Polar Integration)

### 3.2 License Key System

**PRD Assumption:** License keys generated and managed (format: NO3D-XXXX-XXXX-XXXX-XXXX)

**Reality:**
- No license key system exists
- Polar handles customer accounts but no custom license keys

**Recommendation:**
- **Option A:** Use Polar Customer ID as license identifier
  - Simpler, leverages Polar's existing system
  - No separate license key generation needed
  - Customer ID is already unique and tied to subscription
  
- **Option B:** Generate custom license keys
  - More control and branding
  - Requires backend to generate/store keys
  - Map keys to Polar Customer IDs

**Recommendation:** Start with Option A, add Option B later if needed for branding

**PRD Section to Update:** Section 5.2.2 (License Key Generation)

---

## 4. Catalog Structure Modifications

### 4.1 GitHub Repository Structure

**PRD Assumption:** Catalog structure with `catalog.json`, `libraries/`, `assets/`, `thumbnails/`

**Reality:**
- Products stored as: `Dojo*/ProductName/ProductName.blend`
- Each product folder contains: `.blend`, `.json`, `icon_*.png`
- No master catalog file exists
- No library/bundle organization

**Recommendation:**
- **Phase 1:** Generate catalog index dynamically
  - Create serverless function or script to scan `no3d-tools-library` repo
  - Generate `catalog.json` on-demand or via GitHub Actions
  - Use product JSON metadata to build catalog structure
  
- **Phase 2:** Implement library organization
  - Add `library_id` field to product JSON schema
  - Group products by library in catalog
  - Maintain backward compatibility with existing structure

**PRD Section to Update:** Section 6.5.1 (GitHub Repository as Product Database)

### 4.2 Catalog Synchronization

**PRD Assumption:** Webhook-driven catalog updates with versioning

**Reality:**
- GitHub Actions exist but no catalog webhook system
- No versioning system for catalog
- Website fetches products directly from GitHub API

**Recommendation:**
- **Implement GitHub webhook** to `no3d-tools-website` repository
- **Add catalog versioning:**
  - Increment version on each product change
  - Store version in `catalog.json` or separate `version.json`
  - Add-on checks version on startup
- **Delta updates:** Track changes since last sync version

**PRD Section to Update:** Section 6.5.2 (Synchronization Mechanism), Section 7.1 (API Endpoints - `/api/v1/catalog/delta`)

---

## 5. Authentication & Authorization Modifications

### 5.1 OAuth Flow

**PRD Assumption:** OAuth 2.0 PKCE flow with device authorization

**Reality:**
- No authentication system exists
- Polar handles customer accounts but no integration

**Recommendation:**
- **Use Polar's Customer API** for authentication
  - Polar provides customer management
  - Use Polar's webhook to sync customer data
  - Implement device authorization flow:
    1. User clicks "Login" in add-on
    2. Opens browser to `no3dtools.com/auth/blender?device_code=XXX`
    3. User authenticates with Polar (via website)
    4. Website displays authorization code
    5. User enters code in add-on
    6. Add-on exchanges code for access token (via backend API)
  
- **Alternative:** Use Polar's existing customer portal
  - Redirect to Polar customer portal for account management
  - Use Polar API to check subscription status

**PRD Section to Update:** Section 6.4.1 (Login Flow), Section 7.1 (API Endpoints)

### 5.2 Token Management

**PRD Assumption:** Access tokens (1 hour) and refresh tokens (30 days)

**Reality:**
- No token system exists
- Need to design from scratch

**Recommendation:**
- **Implement JWT-based tokens:**
  - Backend generates JWT tokens
  - Access token: 1 hour expiry
  - Refresh token: 30 days expiry, stored securely
  - Tokens stored in Blender preferences (encrypted)
  
- **Or use Polar's API tokens:**
  - Generate API tokens per customer
  - Store in Blender preferences
  - Rotate periodically

**PRD Section to Update:** Section 6.4.2 (Token Management)

---

## 6. Website Modifications

### 6.1 Account Management Portal

**PRD Assumption:** Full account management portal with subscription overview, library access, license management

**Reality:**
- Static website with no user accounts
- No account pages exist

**Recommendation:**
- **Create `/account.html` page:**
  - Use Polar Customer API to fetch subscription data
  - Display current subscriptions
  - Show accessible products/libraries
  - Link to Polar customer portal for billing
  
- **Authentication:**
  - Use Polar's customer authentication
  - Store session in localStorage or cookies
  - Redirect to login if not authenticated

**PRD Section to Update:** Section 5.3 (Account Management Portal)

### 6.2 Product Catalog Display

**PRD Assumption:** Website displays libraries/bundles for subscription

**Reality:**
- Website displays individual products
- Products fetched from GitHub API
- No library/bundle grouping

**Recommendation:**
- **Add library/bundle view:**
  - Group products by `catalog_name` or tags
  - Display as "libraries" on website
  - Show subscription requirements
  - Link to Polar checkout for subscription

**PRD Section to Update:** Section 5.1.1 (New User Journey)

---

## 7. Implementation Phases - Revised

### Phase 1: Foundation (Weeks 1-4) - REVISED

**Original PRD:** Backend API scaffolding, Polar webhook integration, basic add-on structure

**Revised for Codebase:**
- ✅ Set up Vercel serverless functions for API endpoints
- ✅ Implement Polar webhook receiver (serverless function)
- ✅ Create basic add-on structure (NEW consumer add-on)
- ✅ Map existing products to subscription tiers (using metadata)
- ✅ Generate catalog index from GitHub repository
- ✅ Implement basic authentication flow (Polar-based)

**New Dependencies:**
- Vercel account (already have)
- Polar API access (already have)
- Lightweight database OR use Polar metadata only

### Phase 2: Core Features (Weeks 5-8) - REVISED

**Original PRD:** N-Panel UI, Shift+A menu, asset download, catalog sync

**Revised for Codebase:**
- ✅ Build N-Panel UI in Blender add-on
- ✅ Implement Shift+A menu integration
- ✅ Asset download system (from GitHub or CDN)
- ✅ Catalog synchronization (GitHub webhook → catalog update)
- ✅ Website account management page
- ✅ Subscription tier enforcement in add-on

### Phase 3: Polish & Launch (Weeks 9-12) - REVISED

**Original PRD:** Thumbnail grid, premium utilities, account portal, documentation

**Revised for Codebase:**
- ✅ Thumbnail grid browser in add-on
- ✅ Premium utility tools
- ✅ Complete account management portal
- ✅ Onboarding flow and documentation
- ✅ Beta testing with real users
- ✅ Performance optimization

**PRD Section to Update:** Section 9 (Development Phases)

---

## 8. Technology Stack Alignment

### Current Stack (from codebase):
- **Website:** HTML5, Vanilla JS, CSS (Vercel)
- **Backend:** None (need to add)
- **Database:** GitHub repository (need to add proper DB)
- **E-commerce:** Polar.sh
- **Blender:** 4.5+ (PRD says 5.0+)

### PRD Assumptions:
- Backend API (Express.js implied)
- Database (PostgreSQL implied)
- Full authentication system
- Blender 5.0+

### Recommended Stack:
- **Website:** Keep static HTML/JS, add Vercel serverless functions
- **Backend:** Vercel serverless functions (Node.js)
- **Database:** Start with Polar metadata, add Supabase/PlanetScale if needed
- **E-commerce:** Polar.sh (already using)
- **Blender:** 4.5+ initially, plan for 5.0+

**PRD Section to Update:** Section 4.1, Section 6.1

---

## 9. Critical Path Items

### Must-Have Before Launch:
1. ✅ Vercel serverless API endpoints
2. ✅ Polar webhook integration
3. ✅ Basic Blender add-on (authentication + catalog fetch)
4. ✅ Product-to-subscription mapping
5. ✅ Account management page on website

### Can Defer:
- License key generation (use Polar Customer ID)
- Advanced catalog versioning (start simple)
- Premium utility tools (add post-launch)
- Blender 5.0 Extensions platform (target 4.5+ first)

---

## 10. Specific PRD Section Updates

### Section 1: Executive Summary
- **Add:** "This add-on is separate from the existing export add-on"
- **Clarify:** Backend will be Vercel serverless functions, not separate service
- **Update:** Blender version to 4.5+ (with 5.0+ as future)

### Section 4.1: High-Level Architecture
- **Change:** "Backend API" → "Vercel Serverless API Functions"
- **Add:** "GitHub Repository as product database"
- **Clarify:** Website is static with serverless functions

### Section 5.1.2: Subscription Tiers
- **Add:** "Products will be mapped to tiers using metadata tags initially"
- **Note:** Hybrid model (subscriptions + one-time purchases)

### Section 5.2.2: License Key Generation
- **Change:** Use Polar Customer ID as primary identifier
- **Note:** Custom license keys can be added later if needed

### Section 6.1: Technical Requirements
- **Change:** Blender Version to "4.5+ (5.0+ planned)"
- **Change:** Installation to "Manual ZIP install (Extensions platform in 5.0+)"

### Section 6.2.1: Module Structure
- **Keep:** Architecture is good, but clarify this is NEW add-on
- **Add:** Note about separation from export add-on

### Section 6.5.1: GitHub Repository Structure
- **Update:** Match actual structure: `Dojo*/ProductName/` folders
- **Add:** Catalog generation from existing product structure
- **Note:** Libraries are virtual groupings, not physical folders

### Section 7: Backend API Specifications
- **Add:** "All endpoints implemented as Vercel serverless functions"
- **Update:** Endpoints to match serverless function patterns
- **Add:** GitHub API integration for catalog endpoints

### Section 9: Development Phases
- **Revise:** All phases to account for starting from scratch
- **Add:** Product mapping and catalog generation tasks
- **Extend:** Timeline to 12 weeks (from 8 weeks)

---

## 11. Questions to Resolve

Before finalizing PRD, clarify:

1. **Database:** Use Polar metadata only, or add Supabase/PlanetScale?
2. **License Keys:** Required for branding, or can use Polar Customer ID?
3. **Blender Version:** Must support 5.0+ only, or need 4.5+ compatibility?
4. **Product Structure:** Create actual bundle products in Polar, or virtual grouping?
5. **Add-on Repository:** Separate repo for consumer add-on, or same as export add-on?
6. **Free Tier:** Which products should be free? How to implement?
7. **Hybrid Model:** Support both subscriptions AND one-time purchases?

---

## 12. Recommended Next Steps

1. **Review this document** with team
2. **Resolve questions** in Section 11
3. **Update PRD** with modifications from this document
4. **Create technical design document** for serverless API architecture
5. **Plan product-to-subscription mapping** strategy
6. **Design add-on architecture** (separate from export add-on)
7. **Set up development environment** for Vercel serverless functions

---

## Appendix: Codebase References

### Key Files to Review:
- `README.md` - System overview
- `docs/architecture/solvet-stack-diagram.md` - Current architecture
- `docs/planning/REPOSITORY_STRUCTURE.md` - Product structure
- `docs/guides/POLAR_CHECKOUT_OPTIONS.md` - Current Polar integration
- `config/libraries.config.json` - Library configuration (if exists)

### Current Repositories:
- `no3d-tools-library` - Product database (GitHub)
- `no3d-tools-website` - Website (GitHub, Vercel)
- `solvet-asset-management-addon` - Internal export add-on (GitHub) - SOLVET Asset Management Add-on
- `no3d-tools-addon` - Customer-facing asset library add-on (GitHub) - NO3D Tools Asset Library
- `solvet-global` - This repository (coordination)

---

**Document Status:** Ready for Review  
**Next Action:** Update PRD with these recommendations



