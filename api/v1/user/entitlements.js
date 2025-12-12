/**
 * User Entitlements Endpoint
 * 
 * Returns user's subscription status and entitlements
 * Uses Polar Customer ID to verify subscription
 */

import { verifyActiveSubscription, getCustomer } from '../../utils/polar-auth.js';

/**
 * Vercel serverless function handler
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get customer ID from query parameter
    const customerId = req.query.customer_id;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }

    // Get customer information
    const customer = await getCustomer(customerId);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Verify active subscription
    const subscription = await verifyActiveSubscription(customerId);

    // Build entitlements response
    const entitlements = {
      user: {
        id: customer.id,
        email: customer.email,
        subscription_tier: subscription ? 'pro_monthly' : null,
      },
      entitlements: {
        libraries: subscription ? ['all'] : [],
        features: subscription ? [] : [],
        expires_at: subscription?.current_period_end || null,
      },
      catalog_version: null, // Will be fetched separately
    };

    return res.status(200).json(entitlements);
  } catch (error) {
    console.error('Error in entitlements endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
