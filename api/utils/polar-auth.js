/**
 * Polar Authentication Utilities
 * 
 * Helper functions for verifying Polar subscriptions and customer access
 */

import { Polar } from '@polar-sh/sdk';

const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const POLAR_ORG_ID = process.env.POLAR_ORG_ID;

const polar = new Polar({ accessToken: POLAR_API_TOKEN });

/**
 * Verify if a customer has an active subscription
 * @param {string} customerId - Polar customer ID
 * @returns {Promise<object|null>} Subscription object if active, null otherwise
 */
export async function verifyActiveSubscription(customerId) {
  if (!customerId || !POLAR_API_TOKEN || !POLAR_ORG_ID) {
    return null;
  }

  try {
    // Get customer subscriptions
    const subscriptions = await polar.subscriptions.list({
      organizationId: POLAR_ORG_ID,
      customerId: customerId,
    });

    // Find active subscription
    const activeSubscription = subscriptions.result?.items?.find(
      sub => sub.status === 'active'
    );

    return activeSubscription || null;
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return null;
  }
}

/**
 * Get customer information from Polar
 * @param {string} customerId - Polar customer ID
 * @returns {Promise<object|null>} Customer object or null
 */
export async function getCustomer(customerId) {
  if (!customerId || !POLAR_API_TOKEN) {
    return null;
  }

  try {
    const customer = await polar.customers.get({ id: customerId });
    return customer;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

/**
 * Check if customer has access to library
 * @param {string} customerId - Polar customer ID
 * @returns {Promise<boolean>} True if customer has active subscription
 */
export async function hasLibraryAccess(customerId) {
  const subscription = await verifyActiveSubscription(customerId);
  return subscription !== null;
}
