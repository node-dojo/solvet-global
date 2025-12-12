#!/usr/bin/env node

/**
 * Create checkout link for existing subscription product
 */

require('dotenv').config();
const { Polar } = require('@polar-sh/sdk');
const fs = require('fs');
const path = require('path');

const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const POLAR_ORG_ID = process.env.POLAR_ORG_ID;
const EXISTING_PRODUCT_ID = 'abee39f0-c7d8-4e08-b28b-01a49cd77ec2';

if (!POLAR_API_TOKEN || !POLAR_ORG_ID) {
  console.error('❌ Missing POLAR_API_TOKEN or POLAR_ORG_ID');
  process.exit(1);
}

const polar = new Polar({ accessToken: POLAR_API_TOKEN });

async function createCheckoutLink() {
  try {
    // Get existing product
    console.log('📦 Getting product details...');
    const product = await polar.products.get({ id: EXISTING_PRODUCT_ID });
    console.log(`✅ Product: ${product.name}`);
    console.log(`   Product ID: ${product.id}\n`);

    // Check for existing checkout link
    console.log('🔗 Checking for existing checkout link...');
    const existingLinks = await polar.checkoutLinks.list({
      organizationId: POLAR_ORG_ID,
      limit: 100
    });

    let checkoutLink = existingLinks.result?.items?.find(link => 
      link.product_id === EXISTING_PRODUCT_ID
    );

    if (checkoutLink) {
      console.log('✅ Found existing checkout link');
      console.log(`   Link ID: ${checkoutLink.id}`);
      console.log(`   URL: ${checkoutLink.url}\n`);
    } else {
      // Create checkout link
      console.log('🔗 Creating new checkout link...');
      checkoutLink = await polar.checkoutLinks.create({
        productId: EXISTING_PRODUCT_ID,
        paymentProcessor: 'stripe',
        label: product.name,
        metadata: {
          source: 'subscription_system_setup'
        }
      });

      console.log('✅ Checkout link created!');
      console.log(`   Link ID: ${checkoutLink.id}`);
      console.log(`   URL: ${checkoutLink.url}\n`);
    }

    // Update config
    const configPath = path.join(__dirname, '../../config/subscription-config.json');
    const config = {
      productId: EXISTING_PRODUCT_ID,
      productName: product.name,
      checkoutLinkId: checkoutLink.id,
      checkoutUrl: checkoutLink.url,
      monthlyPrice: product.prices[0]?.price_amount?.toString() || '1111',
      annualPrice: null,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Updated: ${configPath}\n`);

    console.log('📋 Summary:');
    console.log(`  Product: ${product.name}`);
    console.log(`  Checkout URL: ${checkoutLink.url}`);
    console.log(`  Config saved to: ${configPath}\n`);

    return checkoutLink;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.body) {
      console.error('Details:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

createCheckoutLink();



