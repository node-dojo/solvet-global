#!/usr/bin/env node

/**
 * Complete Setup for Subscription System Testing
 * 
 * Guides through setting up environment and tests the system
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { validateEnvVars } = require('../utils/security');

console.log('🚀 Subscription System Testing Setup\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Step 1: Check .env file
console.log('Step 1: Checking .env file...\n');

const envPath = path.join(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('   Creating from .env.example...\n');
  const examplePath = path.join(__dirname, '../../.env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('✅ Created .env file\n');
  }
}

const envContent = fs.readFileSync(envPath, 'utf8');
const hasPlaceholder = envContent.includes('your_polar_api_token_here') || 
                       envContent.includes('your_org_id_here');

if (hasPlaceholder) {
  console.log('⚠️  .env file has placeholder values\n');
  console.log('📝 Please update .env with your real values:\n');
  console.log('   1. Get Polar API token: https://polar.sh/settings/api');
  console.log('   2. Get Polar Org ID: Check dashboard or use MCP');
  console.log('   3. Edit .env and replace placeholders\n');
  console.log('   Then run this script again\n');
  process.exit(0);
}

// Step 2: Validate environment variables
console.log('Step 2: Validating environment variables...\n');

try {
  validateEnvVars(['POLAR_API_TOKEN', 'POLAR_ORG_ID']);
  console.log('✅ Required environment variables are set\n');
} catch (error) {
  console.log(`❌ ${error.message}\n`);
  process.exit(1);
}

// Step 3: Refresh MCP config
console.log('Step 3: Refreshing Polar MCP configuration...\n');

try {
  require('./refresh-polar-mcp.js');
  console.log('');
} catch (error) {
  console.log(`⚠️  Could not refresh MCP: ${error.message}\n`);
}

async function runTests() {
  // Step 4: Test Polar API connection
  console.log('Step 4: Testing Polar API connection...\n');

  const { Polar } = require('@polar-sh/sdk');
  const polar = new Polar({ accessToken: process.env.POLAR_API_TOKEN });

  try {
    const products = await polar.products.list({
      organizationId: process.env.POLAR_ORG_ID,
      limit: 1
    });
    console.log('✅ Polar API connection successful');
    console.log(`   Found ${products.result?.items?.length || 0} products\n`);
  } catch (error) {
    console.log(`❌ Polar API error: ${error.message}\n`);
    console.log('   Check that:');
    console.log('   - Token is valid and not expired');
    console.log('   - Org ID is correct\n');
    process.exit(1);
  }

  // Step 5: Check for existing subscription product
  console.log('Step 5: Checking for existing subscription product...\n');

  const configPath = path.join(__dirname, '../../config/subscription-config.json');
  let needsProduct = true;

  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.productId) {
      try {
        const product = await polar.products.get({ id: config.productId });
        if (product.type === 'subscription') {
          console.log('✅ Subscription product already exists');
          console.log(`   Product ID: ${config.productId}`);
          console.log(`   Name: ${product.name}\n`);
          needsProduct = false;
        }
      } catch (error) {
        console.log('⚠️  Config has product ID but product not found');
        console.log('   Will create new product\n');
      }
    }
  }

  if (needsProduct) {
    console.log('📦 No subscription product found');
    console.log('   Run: node scripts/setup/create-subscription-product.js\n');
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ Setup Complete!\n');
  console.log('Next steps:');
  if (needsProduct) {
    console.log('1. Create subscription product:');
    console.log('   node scripts/setup/create-subscription-product.js');
    console.log('');
  }
  console.log('2. Test the system:');
  console.log('   node scripts/test/subscription-system-test.js');
  console.log('');
  console.log('3. Test locally with Vercel:');
  console.log('   vercel dev');
  console.log('');
}

// Run async tests
runTests().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
