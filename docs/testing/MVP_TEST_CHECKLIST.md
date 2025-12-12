# MVP Subscription System - Test Checklist

**Date Created:** January 2025  
**System Version:** MVP 1.0  
**Purpose:** Comprehensive testing checklist for MVP subscription system validation

---

## Test Environment Setup

- [ ] Vercel deployment configured with all environment variables
- [ ] Polar test account created with test subscription product
- [ ] GitHub webhook configured and pointing to correct endpoint
- [ ] Test customer accounts created in Polar
- [ ] Test products available in `no3d-tools-library` repository
- [ ] Local development environment set up for manual testing
- [ ] API testing tool configured (Postman/Insomnia/curl)

---

## 1. Polar Subscription Setup

### 1.1 Subscription Product Configuration
- [ ] Subscription product exists in Polar dashboard
- [ ] Product type is set to "subscription" (not one-time)
- [ ] Product name: "NO3D Tools Library - Full Access"
- [ ] Monthly pricing configured correctly
- [ ] Checkout link generated and accessible
- [ ] Product ID stored in `config/subscription-config.json`
- [ ] Checkout link ID stored in configuration

### 1.2 Configuration Script
- [ ] `scripts/setup/create-subscription-product.js` runs without errors
- [ ] Script creates product if it doesn't exist
- [ ] Script generates checkout link
- [ ] Configuration file is created/updated correctly
- [ ] Script handles errors gracefully (existing product, API failures)

---

## 2. Webhook Receivers

### 2.1 Polar Webhook Endpoint (`/api/v1/webhooks/polar`)

#### 2.1.1 Webhook Security
- [ ] Webhook signature verification works correctly
- [ ] Invalid signatures are rejected (401/403)
- [ ] Missing signatures are rejected
- [ ] Webhook secret configured in environment variables

#### 2.1.2 Event Handling
- [ ] `subscription.created` event is received and logged
- [ ] `subscription.updated` event is received and logged
- [ ] `subscription.canceled` event is received and logged
- [ ] `subscription.revoked` event is received and logged
- [ ] `checkout.created` event is received and logged
- [ ] `order.created` event is received and logged
- [ ] Unknown event types are logged but don't cause errors
- [ ] All events return 200 status code

#### 2.1.3 Event Processing
- [ ] Subscription created handler executes correctly
- [ ] Subscription updated handler executes correctly
- [ ] Subscription canceled handler executes correctly
- [ ] Subscription revoked handler executes correctly
- [ ] Checkout created handler executes correctly
- [ ] Order created handler executes correctly
- [ ] Event data is logged with sufficient detail for debugging

#### 2.1.4 Error Handling
- [ ] Invalid JSON payloads are handled gracefully
- [ ] Missing required fields don't crash the endpoint
- [ ] API errors from Polar are logged and handled
- [ ] Timeout errors are handled appropriately

### 2.2 GitHub Webhook Endpoint (`/api/v1/webhooks/github`)

#### 2.2.1 Webhook Security
- [ ] GitHub webhook signature verification works correctly
- [ ] Invalid signatures are rejected
- [ ] Missing signatures are rejected
- [ ] Webhook secret configured in environment variables

#### 2.2.2 Event Handling
- [ ] `push` events to main branch are processed
- [ ] Push events to other branches are ignored (or handled appropriately)
- [ ] Catalog version is incremented on product changes
- [ ] Version file is updated in repository
- [ ] Product count is updated correctly
- [ ] Last updated timestamp is set correctly

#### 2.2.3 Version Update Logic
- [ ] Version increments correctly (1 → 2 → 3, etc.)
- [ ] Version persists across webhook calls
- [ ] Multiple rapid pushes don't cause version conflicts
- [ ] Version file format is valid JSON

#### 2.2.4 Error Handling
- [ ] Invalid webhook payloads are handled gracefully
- [ ] GitHub API errors are logged and handled
- [ ] Repository access errors are handled
- [ ] File write errors are handled

---

## 3. Website Pages

### 3.1 Subscription Landing Page (`/subscribe.html`)

#### 3.1.1 UI/UX
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] Benefits list is visible and formatted correctly
- [ ] Pricing information displays correctly
- [ ] Product count displays correctly (fetched from API)
- [ ] Subscribe button is visible and clickable
- [ ] Page is responsive on mobile devices
- [ ] Page is responsive on tablet devices
- [ ] Page is responsive on desktop

#### 3.1.2 Functionality
- [ ] Subscribe button links to Polar checkout
- [ ] Checkout link is correct (from configuration)
- [ ] Product count API call succeeds
- [ ] Product count displays even if API is slow
- [ ] Error handling if product count API fails

#### 3.1.3 Content
- [ ] All text content is accurate
- [ ] No placeholder text remains
- [ ] Benefits are clearly stated
- [ ] Pricing is accurate

### 3.2 Success Page (`/success.html`)

#### 3.2.1 UI/UX
- [ ] Page loads without errors
- [ ] Thank you message displays correctly
- [ ] Account page link is visible
- [ ] Page is responsive on all devices

#### 3.2.2 Functionality
- [ ] Link to account page works correctly
- [ ] URL parameters are handled (if used for customer ID)
- [ ] Page can be accessed directly (not just from redirect)

#### 3.2.3 Content
- [ ] Thank you message is appropriate
- [ ] Instructions are clear
- [ ] Next steps are clearly communicated

### 3.3 Account Page (`/account.html`)

#### 3.3.1 UI/UX
- [ ] Page loads without errors
- [ ] Subscription status section displays correctly
- [ ] Download section displays correctly
- [ ] Update badge displays when updates are available
- [ ] Update badge hides when no updates available
- [ ] Page is responsive on all devices
- [ ] Loading states display during API calls

#### 3.3.2 Authentication
- [ ] Unauthenticated users are redirected appropriately
- [ ] Customer ID is retrieved from session/storage
- [ ] Authentication state persists across page refreshes
- [ ] Logout functionality works (if implemented)

#### 3.3.3 Subscription Status Display
- [ ] Active subscription status displays correctly
- [ ] Expired subscription status displays correctly
- [ ] Subscription expiration date displays correctly
- [ ] Subscription tier/plan displays correctly
- [ ] Customer email displays correctly (if shown)
- [ ] Status updates when subscription changes

#### 3.3.4 Download Functionality
- [ ] Download button is visible for active subscribers
- [ ] Download button is hidden/disabled for expired subscriptions
- [ ] Download button triggers download API call
- [ ] Download progress indicator shows (if implemented)
- [ ] Download completes successfully
- [ ] ZIP file is valid and can be extracted
- [ ] ZIP file contains all expected products
- [ ] Error messages display if download fails

#### 3.3.5 Update Detection
- [ ] Update badge appears when catalog version is newer
- [ ] Update badge disappears after re-download
- [ ] Version comparison logic works correctly
- [ ] Last download version is stored correctly
- [ ] Version check API call succeeds

#### 3.3.6 Error Handling
- [ ] API errors display user-friendly messages
- [ ] Network errors are handled gracefully
- [ ] Invalid customer ID errors are handled
- [ ] Missing subscription errors are handled

---

## 4. API Endpoints

### 4.1 User Entitlements (`GET /api/v1/user/entitlements`)

#### 4.1.1 Request Handling
- [ ] Endpoint accepts `customer_id` query parameter
- [ ] Missing `customer_id` returns 400 error
- [ ] Invalid `customer_id` format is handled

#### 4.1.2 Response Format
- [ ] Response is valid JSON
- [ ] Response includes user object with correct fields
- [ ] Response includes entitlements object
- [ ] Response includes catalog_version (or null)
- [ ] Response structure matches API documentation

#### 4.1.3 Subscription Verification
- [ ] Active subscription returns correct entitlements
- [ ] Expired subscription returns appropriate status
- [ ] Canceled subscription returns appropriate status
- [ ] Non-existent customer returns 404 error
- [ ] Polar API integration works correctly

#### 4.1.4 Error Handling
- [ ] Polar API errors are handled gracefully
- [ ] Network timeouts are handled
- [ ] Invalid API responses are handled
- [ ] Error responses include appropriate status codes
- [ ] Error responses include helpful error messages

### 4.2 Library Download (`GET /api/v1/library/download`)

#### 4.2.1 Request Handling
- [ ] Endpoint accepts `customer_id` query parameter
- [ ] Missing `customer_id` returns 400 error
- [ ] Invalid `customer_id` format is handled

#### 4.2.2 Authorization
- [ ] Active subscription allows download (200 status)
- [ ] Expired subscription blocks download (403 status)
- [ ] Canceled subscription blocks download (403 status)
- [ ] Non-existent customer returns 404 error
- [ ] Subscription verification works correctly

#### 4.2.3 ZIP Generation
- [ ] ZIP file is generated successfully
- [ ] ZIP file includes all products from repository
- [ ] ZIP file structure is correct (Dojo*/ folders)
- [ ] ZIP file includes .blend files
- [ ] ZIP file includes .json metadata files
- [ ] ZIP file includes icon files
- [ ] ZIP file is valid and can be extracted
- [ ] ZIP file size is reasonable

#### 4.2.4 Response Headers
- [ ] Content-Type is `application/zip`
- [ ] Content-Disposition header includes filename
- [ ] Filename includes catalog version
- [ ] X-Catalog-Version header is present
- [ ] CORS headers are set correctly (if needed)

#### 4.2.5 Performance
- [ ] ZIP generation completes within reasonable time (< 30 seconds for 100 products)
- [ ] Large libraries don't cause timeouts
- [ ] Caching works correctly (if implemented)
- [ ] Concurrent downloads are handled

#### 4.2.6 Error Handling
- [ ] GitHub API errors are handled gracefully
- [ ] File system errors are handled
- [ ] ZIP generation errors are handled
- [ ] Network errors are handled
- [ ] Error responses include appropriate status codes

### 4.3 Catalog Version (`GET /api/v1/catalog/version`)

#### 4.3.1 Request Handling
- [ ] Endpoint accepts GET requests
- [ ] No authentication required (public endpoint)
- [ ] Endpoint is accessible

#### 4.3.2 Response Format
- [ ] Response is valid JSON
- [ ] Response includes `version` field (number)
- [ ] Response includes `lastUpdated` field (ISO timestamp)
- [ ] Response includes `productCount` field (number)
- [ ] Response structure matches API documentation

#### 4.3.3 Data Accuracy
- [ ] Version number is current
- [ ] Last updated timestamp is accurate
- [ ] Product count matches actual repository count
- [ ] Data updates when GitHub webhook fires

#### 4.3.4 Error Handling
- [ ] File read errors are handled
- [ ] Invalid JSON in version file is handled
- [ ] Missing version file is handled
- [ ] Error responses include appropriate status codes

### 4.4 Authentication Utilities (`api/utils/polar-auth.js`)

#### 4.4.1 Helper Functions
- [ ] `verifySubscription()` function works correctly
- [ ] `getCustomerInfo()` function works correctly
- [ ] Functions handle API errors gracefully
- [ ] Functions return expected data structures
- [ ] Functions cache results appropriately (if implemented)

---

## 5. Download System

### 5.1 ZIP File Generation
- [ ] All products are included in ZIP
- [ ] Product folder structure is preserved
- [ ] Required files (.blend, .json, icons) are included
- [ ] Unnecessary files are excluded
- [ ] ZIP file can be extracted on Windows
- [ ] ZIP file can be extracted on macOS
- [ ] ZIP file can be extracted on Linux
- [ ] File paths in ZIP are correct
- [ ] No duplicate files in ZIP

### 5.2 GitHub Integration
- [ ] Repository access works correctly
- [ ] GitHub API authentication works
- [ ] Product listing from repository works
- [ ] File fetching from repository works
- [ ] Rate limiting is handled
- [ ] Large files are handled correctly

### 5.3 Caching (if implemented)
- [ ] ZIP files are cached appropriately
- [ ] Cache invalidation works when products change
- [ ] Cache doesn't serve stale data
- [ ] Cache storage limits are respected

### 5.4 Performance
- [ ] Download completes within acceptable time
- [ ] System handles concurrent downloads
- [ ] Memory usage is reasonable
- [ ] No memory leaks during ZIP generation

---

## 6. Version Tracking & Update Notifications

### 6.1 Version File
- [ ] Version file exists in repository
- [ ] Version file format is valid JSON
- [ ] Version increments correctly
- [ ] Version persists across deployments
- [ ] Version file is accessible via API

### 6.2 Version Comparison
- [ ] Frontend fetches current version correctly
- [ ] Frontend stores last download version correctly
- [ ] Version comparison logic works correctly
- [ ] Update badge appears when version is newer
- [ ] Update badge disappears when versions match

### 6.3 Update Flow
- [ ] User can re-download after update
- [ ] Re-download includes all products (including new ones)
- [ ] Last download version updates after download
- [ ] Update badge clears after download

---

## 7. Authentication Flow

### 7.1 Polar Customer Portal Integration
- [ ] Login redirect to Polar portal works
- [ ] Authentication callback works
- [ ] Customer ID is stored in session
- [ ] Session persists across page refreshes
- [ ] Logout clears session

### 7.2 Session Management
- [ ] Session storage works correctly (localStorage/cookies)
- [ ] Session expiration is handled
- [ ] Invalid sessions are cleared
- [ ] Session data is secure

---

## 8. Error Handling

### 8.1 API Error Handling
- [ ] All API endpoints handle errors gracefully
- [ ] Error responses include appropriate HTTP status codes
- [ ] Error messages are user-friendly
- [ ] Error logging works correctly
- [ ] Sensitive information is not exposed in errors

### 8.2 Frontend Error Handling
- [ ] Network errors display user-friendly messages
- [ ] API errors display user-friendly messages
- [ ] Invalid responses are handled
- [ ] Timeout errors are handled
- [ ] Error states don't break the UI

### 8.3 Webhook Error Handling
- [ ] Webhook processing errors are logged
- [ ] Failed webhook processing doesn't crash the system
- [ ] Retry logic works (if implemented)
- [ ] Dead letter queue works (if implemented)

---

## 9. Performance & Optimization

### 9.1 API Performance
- [ ] API endpoints respond within acceptable time (< 2 seconds for most)
- [ ] Download endpoint handles large files efficiently
- [ ] Database queries are optimized (if database is used)
- [ ] API rate limiting is respected

### 9.2 Frontend Performance
- [ ] Pages load quickly (< 3 seconds)
- [ ] API calls don't block UI
- [ ] Images and assets are optimized
- [ ] No unnecessary API calls

### 9.3 Caching
- [ ] Static assets are cached
- [ ] API responses are cached appropriately
- [ ] Cache invalidation works correctly

---

## 10. Integration Testing

### 10.1 End-to-End Subscription Flow
- [ ] User visits subscription page
- [ ] User clicks subscribe button
- [ ] User completes Polar checkout
- [ ] User is redirected to success page
- [ ] User navigates to account page
- [ ] Subscription status displays correctly
- [ ] User can download library
- [ ] Download completes successfully

### 10.2 End-to-End Update Flow
- [ ] New product is added to repository
- [ ] GitHub webhook fires
- [ ] Catalog version increments
- [ ] User visits account page
- [ ] Update badge appears
- [ ] User clicks download
- [ ] New product is included in ZIP
- [ ] Update badge disappears

### 10.3 Subscription Lifecycle
- [ ] New subscription activates correctly
- [ ] Subscription renewal works correctly
- [ ] Subscription cancellation is handled
- [ ] Subscription expiration is handled
- [ ] Revoked subscription blocks access immediately

### 10.4 Error Scenarios
- [ ] Expired subscription blocks download
- [ ] Network errors are handled gracefully
- [ ] Invalid customer ID is handled
- [ ] Missing products are handled
- [ ] API failures don't crash the system

---

## 11. Security Testing

### 11.1 Authentication Security
- [ ] Customer IDs cannot be spoofed
- [ ] Session tokens are secure
- [ ] Authentication state cannot be bypassed

### 11.2 API Security
- [ ] Webhook signatures are verified
- [ ] API endpoints validate input
- [ ] SQL injection is prevented (if applicable)
- [ ] XSS attacks are prevented
- [ ] CORS is configured correctly

### 11.3 Data Security
- [ ] Sensitive data is not exposed in responses
- [ ] API keys are stored securely
- [ ] Environment variables are not exposed

---

## 12. Browser Compatibility

### 12.1 Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 12.2 Mobile Browsers
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)

### 12.3 Functionality
- [ ] All features work in all browsers
- [ ] UI displays correctly in all browsers
- [ ] Downloads work in all browsers

---

## 13. Documentation

### 13.1 User Documentation
- [ ] User guide exists and is accurate
- [ ] Instructions are clear
- [ ] Screenshots are up to date (if included)

### 13.2 Developer Documentation
- [ ] API reference is complete
- [ ] Setup guide is accurate
- [ ] Environment variables are documented
- [ ] Webhook setup is documented

### 13.3 Code Documentation
- [ ] Code comments are helpful
- [ ] Function documentation is present
- [ ] README files are up to date

---

## 14. Launch Readiness

### 14.1 Pre-Launch Checklist
- [ ] All critical tests pass
- [ ] All environment variables are set in production
- [ ] Polar webhook is configured in production
- [ ] GitHub webhook is configured in production
- [ ] Domain is configured correctly
- [ ] SSL certificate is valid
- [ ] Monitoring is set up (if applicable)
- [ ] Error tracking is set up (if applicable)

### 14.2 Post-Launch Monitoring
- [ ] Monitor webhook processing
- [ ] Monitor API response times
- [ ] Monitor error rates
- [ ] Monitor download success rates
- [ ] Monitor subscription activations

---

## Test Results Summary

**Test Date:** _______________  
**Tester:** _______________  
**Environment:** _______________ (Development/Staging/Production)

### Overall Status
- [ ] All critical tests pass
- [ ] System is ready for production
- [ ] Known issues documented
- [ ] Performance is acceptable

### Critical Issues Found
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

### Non-Critical Issues Found
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

### Notes
_________________________________________________
_________________________________________________
_________________________________________________

---

## Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Approved By:** _______________  
**Date:** _______________
