#!/usr/bin/env node

/**
 * Complete Test Using Polar MCP Results
 * 
 * Uses information gathered from Polar MCP to complete testing
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Complete Subscription System Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Information from Polar MCP
const ORG_ID = 'f0c16049-5959-42c9-8be8-5952c38c7d63';
const EXISTING_PRODUCT_ID = 'abee39f0-c7d8-4e08-b28b-01a49cd77ec2';
const PRODUCT_NAME = 'NO3D Membership';
const MONTHLY_PRICE = 1111; // $11.11

console.log('📋 Test Results from Polar MCP:\n');
console.log(`✅ Organization ID: ${ORG_ID}`);
console.log(`✅ Subscription Product: ${PRODUCT_NAME}`);
console.log(`✅ Product ID: ${EXISTING_PRODUCT_ID}`);
console.log(`✅ Monthly Price: $${(MONTHLY_PRICE / 100).toFixed(2)}\n`);

// Update .env
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes(ORG_ID) || envContent.includes('your_org_id_here')) {
    envContent = envContent.replace(
      /POLAR_ORG_ID=.*/,
      `POLAR_ORG_ID=${ORG_ID}`
    );
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env with organization ID\n');
  } else {
    console.log('✅ Organization ID already in .env\n');
  }
}

// Update subscription config
const configPath = path.join(__dirname, '../../config/subscription-config.json');
const config = {
  productId: EXISTING_PRODUCT_ID,
  productName: PRODUCT_NAME,
  checkoutLinkId: null, // Will be created/retrieved via script
  checkoutUrl: null,
  monthlyPrice: MONTHLY_PRICE.toString(),
  annualPrice: null,
  createdAt: new Date().toISOString(),
  note: 'Using existing subscription product from Polar - checkout link needs to be created'
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✅ Updated subscription-config.json\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 Testing Checklist:\n');
console.log('✅ Organization ID: Found via Polar MCP');
console.log('✅ Subscription Product: Found (NO3D Membership)');
console.log('⏳ Checkout Link: Need to create/verify');
console.log('⏳ API Endpoints: Test with vercel dev');
console.log('⏳ Website Pages: Test in browser');
console.log('⏳ Download Flow: Test end-to-end\n');

console.log('Next Steps:\n');
console.log('1. Create checkout link:');
console.log('   node scripts/setup/create-subscription-product.js');
console.log('   (or use Polar dashboard)\n');
console.log('2. Test API endpoints:');
console.log('   vercel dev');
console.log('   curl http://localhost:3000/api/v1/catalog/version\n');
console.log('3. Test website:');
console.log('   Open website/subscribe.html in browser\n');
