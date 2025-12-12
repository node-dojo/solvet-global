#!/usr/bin/env node

/**
 * Complete Subscription System Test
 * 
 * Uses Polar MCP and API to test the entire subscription system
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Polar } = require('@polar-sh/sdk');

const { validateEnvVars } = require('../utils/security');

// From Polar MCP results
const ORG_ID = 'f0c16049-5959-42c9-8be8-5952c38c7d63';
const EXISTING_PRODUCT_ID = 'abee39f0-c7d8-4e08-b28b-01a49cd77ec2';

console.log('🧪 Complete Subscription System Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Validate environment
try {
  validateEnvVars(['POLAR_API_TOKEN', 'POLAR_ORG_ID']);
} catch (error) {
  console.log(`❌ ${error.message}\n`);
  console.log('Note: POLAR_ORG_ID has been set from Polar MCP results\n');
  // Continue anyway if org ID is set
  if (!process.env.POLAR_ORG_ID) {
    process.exit(1);
  }
}

const polar = new Polar({ accessToken: process.env.POLAR_API_TOKEN });

async function runCompleteTest() {
  const results = {
    orgVerified: false,
    productVerified: false,
    checkoutLinkFound: false,
    checkoutLinkCreated: false,
    configUpdated: false
  };

  // Step 1: Verify Organization
  console.log('Step 1: Verifying Organization...\n');
  try {
    const products = await polar.products.list({
      organizationId: ORG_ID,
      limit: 1
    });
    results.orgVerified = true;
    console.log(`✅ Organization verified: ${ORG_ID.substring(0, 8)}...\n`);
  } catch (error) {
    console.log(`❌ Organization verification failed: ${error.message}\n`);
    return results;
  }

  // Step 2: Verify Subscription Product
  console.log('Step 2: Verifying Subscription Product...\n');
  try {
    const product = await polar.products.get({ id: EXISTING_PRODUCT_ID });
    results.productVerified = true;
    console.log(`✅ Product: ${product.name}`);
    console.log(`✅ Type: ${product.is_recurring ? 'Subscription' : 'One-time'}`);
    console.log(`✅ Price: $${(product.prices[0]?.price_amount / 100).toFixed(2)}/${product.recurring_interval || 'one-time'}\n`);
  } catch (error) {
    console.log(`❌ Product verification failed: ${error.message}\n`);
    return results;
  }

  // Step 3: Check/Create Checkout Link
  console.log('Step 3: Checking Checkout Link...\n');
  try {
    const links = await polar.checkoutLinks.list({
      organizationId: ORG_ID,
      limit: 100
    });
    
    const productLink = links.result?.items?.find(link => 
      link.product_id === EXISTING_PRODUCT_ID
    );
    
    if (productLink) {
      results.checkoutLinkFound = true;
      console.log(`✅ Checkout link found: ${productLink.url}\n`);
      
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
      };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      results.configUpdated = true;
      console.log('✅ Updated subscription-config.json\n');
    } else {
      console.log('⚠️  No checkout link found');
      console.log('   Creating checkout link...\n');
      
      try {
        const newLink = await polar.checkoutLinks.create({
          organizationId: ORG_ID,
          productId: EXISTING_PRODUCT_ID,
        });
        
        results.checkoutLinkCreated = true;
        console.log(`✅ Created checkout link: ${newLink.url}\n`);
        
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
        results.configUpdated = true;
        console.log('✅ Updated subscription-config.json\n');
      } catch (error) {
        console.log(`❌ Failed to create checkout link: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not check links: ${error.message}\n`);
  }

  // Step 4: Verify API Files
  console.log('Step 4: Verifying API Files...\n');
  const apiFiles = [
    'api/v1/webhooks/polar.js',
    'api/v1/webhooks/github.js',
    'api/v1/library/download.js',
    'api/v1/catalog/version.js',
    'api/v1/user/entitlements.js',
  ];
  
  let allFilesExist = true;
  for (const file of apiFiles) {
    const filePath = path.join(__dirname, '../../', file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - Missing`);
      allFilesExist = false;
    }
  }
  console.log('');

  // Step 5: Verify Website Files
  console.log('Step 5: Verifying Website Files...\n');
  const websiteFiles = [
    'website/subscribe.html',
    'website/success.html',
    'website/account.html',
  ];
  
  for (const file of websiteFiles) {
    const filePath = path.join(__dirname, '../../', file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - Missing`);
      allFilesExist = false;
    }
  }
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Test Summary:\n');
  console.log(`Organization Verified: ${results.orgVerified ? '✅' : '❌'}`);
  console.log(`Product Verified: ${results.productVerified ? '✅' : '❌'}`);
  console.log(`Checkout Link: ${results.checkoutLinkFound ? '✅ Found' : results.checkoutLinkCreated ? '✅ Created' : '❌ Missing'}`);
  console.log(`Config Updated: ${results.configUpdated ? '✅' : '❌'}`);
  console.log(`All Files Exist: ${allFilesExist ? '✅' : '❌'}\n`);

  if (results.orgVerified && results.productVerified && results.configUpdated && allFilesExist) {
    console.log('✅ All core tests passed!\n');
    console.log('Next: Test API endpoints and website pages\n');
    return 0;
  } else {
    console.log('⚠️  Some tests failed - see details above\n');
    return 1;
  }
}

runCompleteTest()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
