#!/usr/bin/env node

/**
 * Create Subscription Product in Polar
 *
 * Creates a single "All Libraries" subscription product in Polar
 * and generates a checkout link for it.
 */

// Load environment variables from .env file
require('dotenv').config();

const { Polar } = require('@polar-sh/sdk');
const fs = require('fs');
const path = require('path');

const { validateEnvVars, logTokenInfo, sanitizeError } = require('../utils/security');

const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const POLAR_ORG_ID = process.env.POLAR_ORG_ID;
const DRY_RUN = process.env.DRY_RUN === 'true';

// Subscription product configuration
const SUBSCRIPTION_CONFIG = {
  name: 'NO3D Tools Library - Full Access',
  description: 'Get full access to all NO3D Tools products, including all future additions while your subscription is active.',
  monthlyPrice: process.env.SUBSCRIPTION_MONTHLY_PRICE || '1999', // Default: $19.99 in cents
  annualPrice: process.env.SUBSCRIPTION_ANNUAL_PRICE || null, // Optional: annual pricing
};

// Validate required environment variables
try {
  validateEnvVars(['POLAR_API_TOKEN', 'POLAR_ORG_ID']);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nUsage: POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx [SUBSCRIPTION_MONTHLY_PRICE=1999] node scripts/setup/create-subscription-product.js');
  process.exit(1);
}

// Log token info (masked)
logTokenInfo('POLAR_API_TOKEN', POLAR_API_TOKEN);
console.log(`POLAR_ORG_ID: ${POLAR_ORG_ID}\n`);

const polar = new Polar({ accessToken: POLAR_API_TOKEN });

async function createSubscriptionProduct() {
  console.log('📦 Setting up Subscription Product in Polar...\n');
  console.log(`Product Name: ${SUBSCRIPTION_CONFIG.name}`);
  console.log(`Monthly Price: $${(SUBSCRIPTION_CONFIG.monthlyPrice / 100).toFixed(2)}\n`);

  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No product will be created\n');
    return;
  }

  try {
    // Check if subscription product already exists
    const existingProducts = await polar.products.list({
      organizationId: POLAR_ORG_ID,
      is_recurring: true,
      limit: 10
    });

    let product = existingProducts.result?.items?.find(p => 
      p.name.toLowerCase().includes('no3d') || 
      p.name.toLowerCase().includes('membership') ||
      p.name.toLowerCase().includes('library')
    );

    if (product) {
      console.log(`✅ Found existing subscription product: ${product.name}`);
      console.log(`   Product ID: ${product.id}\n`);
    } else {
      // Create subscription product
      console.log('📦 Creating new subscription product...\n');
      product = await polar.products.create({
        organizationId: POLAR_ORG_ID,
        name: SUBSCRIPTION_CONFIG.name,
        description: SUBSCRIPTION_CONFIG.description,
        recurring_interval: 'month',
        recurring_interval_count: 1,
        prices: [
          {
            amount_type: 'fixed',
            price_amount: parseInt(SUBSCRIPTION_CONFIG.monthlyPrice),
            price_currency: 'usd',
          },
          ...(SUBSCRIPTION_CONFIG.annualPrice ? [{
            amount_type: 'fixed',
            price_amount: parseInt(SUBSCRIPTION_CONFIG.annualPrice),
            price_currency: 'usd',
            recurring_interval: 'year',
          }] : []),
        ],
      });

      console.log('✅ Subscription product created successfully!');
      console.log(`Product ID: ${product.id}`);
      console.log(`Product Name: ${product.name}\n`);
    }

    // Check for existing checkout link
    console.log('🔗 Checking for existing checkout link...');
    const existingLinks = await polar.checkoutLinks.list({
      organizationId: POLAR_ORG_ID,
      limit: 100
    });

    let checkoutLink = existingLinks.result?.items?.find(link => 
      link.product_id === product.id
    );

    if (checkoutLink) {
      console.log('✅ Found existing checkout link');
      console.log(`Checkout Link ID: ${checkoutLink.id}`);
      console.log(`Checkout URL: ${checkoutLink.url}\n`);
    } else {
      // Create checkout link
      console.log('🔗 Creating new checkout link...');
      checkoutLink = await polar.checkoutLinks.create({
        organizationId: POLAR_ORG_ID,
        productId: product.id,
        successUrl: `${process.env.SUCCESS_URL || 'https://no3dtools.com'}/success.html`,
      });

      console.log('✅ Checkout link created successfully!');
      console.log(`Checkout Link ID: ${checkoutLink.id}`);
      console.log(`Checkout URL: ${checkoutLink.url}\n`);
    }

    // Save configuration to file
    const configDir = path.join(__dirname, '../../config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.join(configDir, 'subscription-config.json');
    const config = {
      productId: product.id,
      productName: product.name,
      checkoutLinkId: checkoutLink.id,
      checkoutUrl: checkoutLink.url,
      monthlyPrice: SUBSCRIPTION_CONFIG.monthlyPrice,
      annualPrice: SUBSCRIPTION_CONFIG.annualPrice,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration saved to: ${configPath}\n`);

    console.log('📋 Summary:');
    console.log(`  Product ID: ${product.id}`);
    console.log(`  Checkout Link: ${checkoutLink.url}`);
    console.log(`  Config File: ${configPath}\n`);

    return config;
  } catch (error) {
    console.error('❌ Error creating subscription product:');
    console.error(sanitizeError(error));
    process.exit(1);
  }
}

async function main() {
  await createSubscriptionProduct();
}

if (require.main === module) {
  main();
}

module.exports = { createSubscriptionProduct };
