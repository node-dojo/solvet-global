/**
 * Polar Webhook Receiver
 * 
 * Receives and processes webhook events from Polar.sh
 * Handles subscription lifecycle events: created, updated, canceled, revoked
 */

import { Polar } from '@polar-sh/sdk';
import crypto from 'crypto';

const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

/**
 * Verify Polar webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Signature from X-Polar-Signature header
 * @returns {boolean} True if signature is valid
 */
function verifyWebhookSignature(payload, signature) {
  if (!POLAR_WEBHOOK_SECRET) {
    console.warn('⚠️  POLAR_WEBHOOK_SECRET not set, skipping signature verification');
    return true; // In development, allow without secret
  }

  const hmac = crypto.createHmac('sha256', POLAR_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  const expectedSignature = `sha256=${digest}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Process webhook event
 * @param {object} event - Webhook event data
 */
async function processWebhookEvent(event) {
  const { type, data } = event;

  console.log(`📥 Received webhook event: ${type}`);
  console.log(`   Event ID: ${event.id || 'unknown'}`);
  console.log(`   Timestamp: ${event.created_at || new Date().toISOString()}`);

  switch (type) {
    case 'subscription.created':
      await handleSubscriptionCreated(data);
      break;
    
    case 'subscription.updated':
      await handleSubscriptionUpdated(data);
      break;
    
    case 'subscription.canceled':
      await handleSubscriptionCanceled(data);
      break;
    
    case 'subscription.revoked':
      await handleSubscriptionRevoked(data);
      break;
    
    case 'checkout.created':
      await handleCheckoutCreated(data);
      break;
    
    case 'order.created':
      await handleOrderCreated(data);
      break;
    
    default:
      console.log(`   ⚠️  Unhandled event type: ${type}`);
  }
}

/**
 * Handle subscription.created event
 */
async function handleSubscriptionCreated(data) {
  console.log(`   ✅ Subscription created`);
  console.log(`   Customer ID: ${data.customer_id}`);
  console.log(`   Subscription ID: ${data.id}`);
  console.log(`   Product ID: ${data.product_id}`);
  
  // TODO: Store subscription in database or Polar metadata
  // For MVP, we'll just log and use Polar API for verification
}

/**
 * Handle subscription.updated event
 */
async function handleSubscriptionUpdated(data) {
  console.log(`   🔄 Subscription updated`);
  console.log(`   Subscription ID: ${data.id}`);
  console.log(`   Status: ${data.status}`);
  
  // TODO: Update subscription status in database
}

/**
 * Handle subscription.canceled event
 */
async function handleSubscriptionCanceled(data) {
  console.log(`   ❌ Subscription canceled`);
  console.log(`   Subscription ID: ${data.id}`);
  console.log(`   Customer ID: ${data.customer_id}`);
  
  // TODO: Mark subscription for end-of-period revocation
  // Access remains until period ends
}

/**
 * Handle subscription.revoked event
 */
async function handleSubscriptionRevoked(data) {
  console.log(`   🚫 Subscription revoked`);
  console.log(`   Subscription ID: ${data.id}`);
  console.log(`   Customer ID: ${data.customer_id}`);
  
  // TODO: Immediately revoke access
}

/**
 * Handle checkout.created event
 */
async function handleCheckoutCreated(data) {
  console.log(`   🛒 Checkout created`);
  console.log(`   Checkout ID: ${data.id}`);
  
  // TODO: Initialize pending order if needed
}

/**
 * Handle order.created event
 */
async function handleOrderCreated(data) {
  console.log(`   📦 Order created`);
  console.log(`   Order ID: ${data.id}`);
  console.log(`   Customer ID: ${data.customer_id}`);
  
  // TODO: Process one-time purchase if applicable
}

/**
 * Vercel serverless function handler
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get signature from header
    const signature = req.headers['x-polar-signature'];
    if (!signature && POLAR_WEBHOOK_SECRET) {
      console.warn('⚠️  Missing X-Polar-Signature header');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);

    // Verify webhook signature
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process webhook event
    await processWebhookEvent(req.body);

    // Return success
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
