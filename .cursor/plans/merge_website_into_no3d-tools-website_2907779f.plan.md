---
name: Merge website into no3d-tools-website
overview: Merge the subscription-focused website/ directory into the main no3d-tools-website/ codebase, adding account menu functionality and subscription pages while maintaining conditional rendering based on account status.
todos: []
---

# Merge Website into no3d-tools-website

## Overview

Merge `website/` subscription features into `no3d-tools-website/` as the main codebase. Add account menu, subscription pages, and subscription-aware conditional logic without breaking existing functionality.

## Key Differences Identified

### HTML Structure

- `website/index.html` has account menu dropdown (lines 104-119) vs simple ellipsis in `no3d-tools-website/index.html`
- Both share the same core product catalog structure

### Additional Pages in website/

- `account.html` - Account management page with subscription status
- `subscribe.html` - Subscription landing page
- `success.html` - Post-checkout success page

### JavaScript Functions in website/script.js

- `initializeAccountMenu()` - Account menu dropdown functionality
- `openAccountMenu()` / `closeAccountMenu()` - Menu state management
- `checkSubscriptionStatus(customerId)` - API call to verify subscription
- `updateMemberCTAVisibility()` - Hide/show member CTA based on subscription
- `initializeMemberCTA()` - Enhanced version with subscription checking

### CSS Styles

- Account menu dropdown styles (`.account-menu-*` classes) in `website/styles.css`

### Server

- `subscriber-preview-server.js` currently serves from `website/` directory

## Implementation Plan

**CRITICAL: Preserve All Account Management Features from `website/`**

The `website/` directory contains the most up-to-date account management implementation with recent improvements. All account management code should be copied FROM `website/` TO `no3d-tools-website/` to preserve these features.

### Phase 1: Copy Subscription Pages (PRESERVE FROM website/)

1. Copy `website/account.html` → `no3d-tools-website/account.html` (complete file, preserve all recent tweaks)
2. Copy `website/subscribe.html` → `no3d-tools-website/subscribe.html` (complete file)
3. Copy `website/success.html` → `no3d-tools-website/success.html` (complete file)
4. Verify all asset paths work (should be same structure)
5. **Note**: These pages contain the latest account management flow improvements - preserve exactly as-is

### Phase 2: Merge HTML - Account Menu (FROM website/)

1. In `no3d-tools-website/index.html`, replace simple ellipsis icon (line 104) with account menu dropdown structure from `website/index.html` (lines 104-119)
2. Keep all existing header structure intact
3. Account menu should be conditionally visible (always present in DOM, visibility controlled by JS)
4. **Preserve**: The account menu HTML structure from `website/` is the most complete version

### Phase 3: Merge CSS - Account Menu Styles (FROM website/)

1. Copy ALL account menu CSS from `website/styles.css` (all `.account-menu-*` classes, lines ~181-327) to `no3d-tools-website/styles.css`
2. Ensure no style conflicts with existing styles
3. Verify CSS variable usage matches (`--color-*`, `--space-*`, etc.)
4. **Preserve**: All account menu styling improvements from `website/`

### Phase 4: Merge JavaScript - Subscription Functions (PRESERVE FROM website/)

1. Copy `checkSubscriptionStatus()` function from `website/script.js` (lines ~5747-5766) to `no3d-tools-website/script.js` - this is the latest version
2. Copy ALL account menu functions from `website/script.js` (preserve exact implementation):

- `initializeAccountMenu()` (lines ~5910-5962) - includes all recent improvements
- `openAccountMenu()` (lines ~5966-6054) - includes subscription status display, error handling, CTA updates
- `closeAccountMenu()` (lines ~6057-6062)
- Account menu initialization code (lines ~6064-6069)

3. Copy `updateMemberCTAVisibility()` function (lines ~4907-4950) - latest version with subscription checking
4. Replace `initializeMemberCTA()` in `no3d-tools-website/script.js` with the enhanced version from `website/script.js` (lines ~4845-4904) - includes subscription status checking
5. Update `updateButtonVisibility()` in `no3d-tools-website/script.js` to match the subscription-aware version from `website/script.js` (lines ~1438-1508) - includes `checkSubscriptionStatus()` calls
6. **CRITICAL**: Preserve the integration between account menu and member CTA visibility (line 6034 in website/script.js calls `updateMemberCTAVisibility()`)

### Phase 5: Update Subscription-Aware Logic (PRESERVE FROM website/)

1. **Preserve**: The subscription-aware logic from `website/script.js` is the most complete:

- `updateButtonVisibility()` checks for both owned products AND active subscriptions
- `updateMemberCTAVisibility()` hides/shows member CTA based on subscription status
- Account menu automatically calls `updateMemberCTAVisibility()` when subscription is active (line 6034)

2. Ensure all subscription checks use `checkSubscriptionStatus()` consistently (as in `website/script.js`)
3. Ensure account menu initialization happens on page load (preserve initialization pattern from `website/script.js`)
4. **Preserve**: The error handling and fallback logic from `website/script.js` for subscription checks

### Phase 6: Update Subscriber Preview Server

1. Update `website/subscriber-preview-server.js` to serve from `no3d-tools-website/` directory instead
2. Change `BASE_DIR` constant to point to `no3d-tools-website/` directory
3. Or create new server file in `no3d-tools-website/` directory
4. Update any path references

### Phase 7: Verify Conditional Logic

1. Test that account menu shows/hides based on customer_id presence
2. Test that member CTA buttons hide for active subscribers
3. Test that download buttons show for subscribers
4. Test that buy now buttons show for non-subscribers
5. Verify all subscription checks use `checkSubscriptionStatus()` consistently

### Phase 8: Cleanup

1. Document which files were merged
2. Consider deprecating `website/` directory (but don't delete yet - keep as backup)
3. Update any documentation referencing the old structure

## Files to Modify

1. `no3d-tools-website/index.html` - Add account menu dropdown
2. `no3d-tools-website/styles.css` - Add account menu styles
3. `no3d-tools-website/script.js` - Add subscription functions and update existing ones
4. `no3d-tools-website/account.html` - New file (copy from website/)
5. `no3d-tools-website/subscribe.html` - New file (copy from website/)
6. `no3d-tools-website/success.html` - New file (copy from website/)
7. `website/subscriber-preview-server.js` or new server file - Update BASE_DIR

## Testing Checklist

- [ ] Account menu appears in header (preserved from website/)
- [ ] Account menu opens/closes correctly (preserved behavior)
- [ ] Account menu shows subscription status when customer_id present (preserved display logic)
- [ ] Account menu shows "Not signed in" when no customer_id (preserved fallback)
- [ ] Account menu displays email, plan, renewal date correctly (preserved UI)
- [ ] Member CTA buttons hide for active subscribers (preserved visibility logic)
- [ ] Member CTA buttons show for non-subscribers (preserved visibility logic)
- [ ] Download buttons appear for subscribers (preserved button logic)
- [ ] Buy now buttons appear for non-subscribers (preserved button logic)
- [ ] account.html page loads and displays subscription info (preserved account page)
- [ ] account.html shows library files section (preserved features)
- [ ] account.html shows download all functionality (preserved features)
- [ ] subscribe.html page loads (preserved subscription page)
- [ ] success.html page loads (preserved success page)
- [ ] Subscriber preview server serves from correct directory
- [ ] No console errors
- [ ] Existing product catalog functionality still works
- [ ] All account management flow improvements are preserved