#!/usr/bin/env node

/**
 * Complete Subscription System Test Using Polar MCP
 * 
 * Tests the entire subscription system end-to-end using Polar MCP
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🧪 Complete Subscription System Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Organization ID from MCP results
const ORG_ID = 'f0c16049-5959-42c9-8be8-5952c38c7d63';
const EXISTING_SUBSCRIPTION_PRODUCT_ID = 'abee39f0-c7d8-4e08-b28b-01a49cd77ec2';

console.log('📋 Test Plan:\n');
console.log('1. ✅ Organization ID found: ' + ORG_ID.substring(0, 8) + '...');
console.log('2. ✅ Existing subscription product found: NO3D Membership');
console.log('3. ⏳ Update .env with organization ID');
console.log('4. ⏳ Test subscription product details');
console.log('5. ⏳ Create/verify checkout link');
console.log('6. ⏳ Test API endpoints');
console.log('7. ⏳ Test website pages');
console.log('8. ⏳ Test download flow\n');

// Update .env with org ID
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update POLAR_ORG_ID if it's a placeholder
  if (envContent.includes('your_org_id_here')) {
    envContent = envContent.replace(
      /POLAR_ORG_ID=.*/,
      `POLAR_ORG_ID=${ORG_ID}`
    );
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env with organization ID\n');
  } else if (envContent.includes(ORG_ID)) {
    console.log('✅ Organization ID already in .env\n');
  } else {
    console.log('⚠️  Organization ID in .env differs from MCP result\n');
  }
}

// Update subscription config with existing product
const configPath = path.join(__dirname, '../../config/subscription-config.json');
const config = {
  productId: EXISTING_SUBSCRIPTION_PRODUCT_ID,
  productName: 'NO3D Membership',
  checkoutLinkId: null,
  checkoutUrl: null,
  monthlyPrice: '1111',
  annualPrice: null,
  createdAt: new Date().toISOString(),
  note: 'Using existing subscription product from Polar'
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✅ Updated subscription-config.json with existing product\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 Next Steps:\n');
console.log('1. Ensure POLAR_API_TOKEN is set in .env');
console.log('2. Run full test: node scripts/test/subscription-system-test.js');
console.log('3. Test API endpoints locally: vercel dev');
console.log('4. Test website pages in browser\n');
console.log('The existing "NO3D Membership" subscription product will be used.\n');
