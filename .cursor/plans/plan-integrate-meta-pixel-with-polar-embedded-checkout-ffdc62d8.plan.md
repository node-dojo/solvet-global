<!-- ffdc62d8-c280-43a5-8dc9-9d5905cd7ed2 45f4d90a-82cc-4624-a710-fe6d16fcdbea -->
# Plan: Integrate Meta Pixel with Polar Embedded Checkout

## Overview

To enable robust analytics for Meta (Facebook) ads, we will integrate the Meta Pixel using Polar's Embedded Checkout. This approach keeps the user on your site during the purchase flow, allowing us to fire Pixel events (`InitiateCheckout`, `Purchase`) directly from your own JavaScript code, ensuring accurate tracking without relying on external redirects or limited hosted page configurations.

## Implementation Steps

1.  **Add Meta Pixel Base Code**

    - Insert the standard Meta Pixel initialization script into the `<head>` of `no3d-tools-website/index.html`.
    - This ensures the Pixel is loaded on every page view (`PageView`).

2.  **Update Checkout Flow to Embedded**

    - Modify `no3d-tools-website/script.js` to import and use `@polar-sh/checkout/embed`.
    - Replace the current "Checkout Link" behavior (redirect) with an `onClick` handler that opens the Polar checkout modal.

3.  **Implement Event Tracking**

    - **InitiateCheckout**: Fire this event when the user clicks the "Buy" button and the modal opens.
    - **Purchase**: Listen for the `checkout.on('success', ...)` event. Inside this callback, fire the `fbq('track', 'Purchase', ...)` event.
    - **Data Handling**: We will inspect the `success` event data to retrieve the transaction value/currency if available; otherwise, we may need to update `polar-products.js` to include static prices for accurate ROAS tracking.

## Verification

- Use the "Meta Pixel Helper" browser extension to verify `PageView` fires on load.
- Test a checkout flow (using a test mode if available, or stopping before payment) to verify `InitiateCheckout` fires.

## Todo List

- [ ] Add Meta Pixel base code to `no3d-tools-website/index.html`
- [ ] Install `@polar-sh/checkout` package (or add via CDN if using vanilla JS)
- [ ] Update `no3d-tools-website/script.js` to handle Embedded Checkout
- [ ] Add `fbq` tracking calls for `InitiateCheckout` and `Purchase`

### To-dos

- [ ] Add Meta Pixel base code to no3d-tools-website/index.html
- [ ] Update script.js to support Polar Embedded Checkout and tracking
- [ ] Verify tracking implementation with mock events