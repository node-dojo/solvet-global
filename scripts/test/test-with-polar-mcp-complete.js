#!/usr/bin/env node

/**
 * Complete Subscription Testing with Polar MCP
 * 
 * Uses Polar MCP to:
 * 1. Get organization ID ✅
 * 2. Find existing subscription product ✅
 * 3. Get product details ✅
 * 4. Create/verify checkout link
 * 5. Update configuration
 * 6. Test API endpoints
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Polar } = require('@polar-sh/sdk');

const { validateEnvVars } = require('../utils/security');

console.log('🧪 Complete Subscription Test with Polar MCP\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// From MCP results
const ORG_ID = 'f0c16049-5959-42c9-8be8-5952c38c7d63';
const EXISTING_PRODUCT_ID = 'abee39f0-c7d8-4e08-b28b-01a49cd77ec2';

// Validate environment
try {
  validateEnvVars(['POLAR_API_TOKEN']);
} catch (error) {
  console.log(`❌ ${error.message}\n`);
  console.log('Please set POLAR_API_TOKEN in .env file\n');
  process.exit(1);
}

const polar = new Polar({ accessToken: process.env.POLAR_API_TOKEN });

async function testComplete() {
  console.log('Step 1: Verifying organization ID...\n');
  console.log(`   Organization ID: ${ORG_ID.substring(0, 8)}...\n`);

  console.log('Step 2: Checking existing subscription product...\n');
  try {
    const product = await polar.products.get({ id: EXISTING_PRODUCT_ID });
    console.log(`   ✅ Product: ${product.name}`);
    console.log(`   ✅ Type: ${product.is_recurring ? 'Subscription' : 'One-time'}`);
    console.log(`   ✅ Price: $${(product.prices[0]?.price_amount / 100).toFixed(2)}/${product.recurring_interval || 'one-time'}`);
    console.log(`   ✅ Description: ${product.description}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    process.exit(1);
  }

  console.log('Step 3: Checking for checkout link...\n');
  try {
    const links = await polar.checkoutLinks.list({
      organizationId: ORG_ID,
      limit: 100
    });
    
    const productLink = links.result?.items?.find(link => 
      link.product_id === EXISTING_PRODUCT_ID
    );
    
    if (productLink) {
      console.log(`   ✅ Checkout link exists: ${productLink.url}\n`);
      
      // Update config
      const configPath = path.join(__dirname, '../../config/subscription-config.json');
      const config = {
        productId: EXISTING_PRODUCT_ID,
        productName: 'NO3D Membership',
        checkoutLinkId: productLink.id,
        checkoutUrl: productLink.url,
        monthlyPrice: '1111',
        annualPrice: null,
        createdAt: new Date().toISOString(),
        note: 'Using existing subscription product and checkout link'
      };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('   ✅ Updated subscription-config.json\n');
    } else {
      console.log('   ⚠️  No checkout link found for this product');
      console.log('   Creating checkout link...\n');
      
      try {
        const newLink = await polar.checkoutLinks.create({
          organizationId: ORG_ID,
          productId: EXISTING_PRODUCT_ID,
        });
        
        console.log(`   ✅ Created checkout link: ${newLink.url}\n`);
        
        // Update config
        const configPath = path.join(__dirname, '../../config/subscription-config.json');
        const config = {
          productId: EXISTING_PRODUCT_ID,
          productName: 'NO3D Membership',
          checkoutLinkId: newLink.id,
          checkoutUrl: newLink.url,
          monthlyPrice: '1111',
          annualPrice: null,
          createdAt: new Date().toISOString(),
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('   ✅ Updated subscription-config.json\n');
      } catch (error) {
        console.log(`   ❌ Error creating link: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check links: ${error.message}\n`);
  }

  console.log('Step 4: Testing API endpoints (requires Vercel dev server)...\n');
  console.log('   To test API endpoints:');
  console.log('   1. Start Vercel dev: vercel dev');
  console.log('   2. Test: curl http://localhost:3000/api/v1/catalog/version');
  console.log('   3. Test: curl http://localhost:3000/api/v1/user/entitlements?customer_id=test\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ Subscription Product Setup Complete!\n');
  console.log('Configuration:');
  console.log(`  Product ID: ${EXISTING_PRODUCT_ID}`);
  console.log(`  Product Name: NO3D Membership`);
  console.log(`  Organization ID: ${ORG_ID}\n`);
  console.log('Next: Test the website and API endpoints\n');
}

testComplete().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
