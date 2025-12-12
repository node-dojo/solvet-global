#!/usr/bin/env node

/**
 * Subscription System Test Script
 * 
 * Tests the MVP subscription system components
 */

// Load environment variables from .env file
require('dotenv').config();

const { Polar } = require('@polar-sh/sdk');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const { validateEnvVars, logTokenInfo } = require('../utils/security');

const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const POLAR_ORG_ID = process.env.POLAR_ORG_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const polar = new Polar({ accessToken: POLAR_API_TOKEN });
const octokit = new Octokit({ auth: GITHUB_TOKEN });

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  console.log('🧪 Testing NO3D Tools Subscription System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Validate environment
  try {
    validateEnvVars(['POLAR_API_TOKEN', 'POLAR_ORG_ID']);
    if (GITHUB_TOKEN) {
      console.log('✅ GitHub token found');
    } else {
      console.log('⚠️  GitHub token not set (some tests will be skipped)');
    }
  } catch (error) {
    console.error('❌ Missing required environment variables:', error.message);
    console.error('\nSet environment variables:');
    console.error('  POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx [GITHUB_TOKEN=xxx] node scripts/test/subscription-system-test.js');
    process.exit(1);
  }

  logTokenInfo('POLAR_API_TOKEN', POLAR_API_TOKEN);
  console.log(`POLAR_ORG_ID: ${POLAR_ORG_ID}\n`);

  // Run all tests
  for (const { name, fn } of tests) {
    try {
      console.log(`Testing: ${name}...`);
      await fn();
      console.log(`  ✅ PASSED\n`);
      passed++;
    } catch (error) {
      console.log(`  ❌ FAILED: ${error.message}\n`);
      failed++;
    }
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nTest Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Test 1: Check subscription config file exists
test('Subscription config file exists', async () => {
  const configPath = path.join(__dirname, '../../config/subscription-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('subscription-config.json not found. Run create-subscription-product.js first.');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!config.productId && !config.checkoutUrl) {
    throw new Error('Config file exists but is empty. Run create-subscription-product.js.');
  }
});

// Test 2: Verify Polar API connection
test('Polar API connection', async () => {
  try {
    const orgs = await polar.organizations.list();
    if (!orgs.result || orgs.result.items.length === 0) {
      throw new Error('No organizations found');
    }
    const org = orgs.result.items.find(o => o.id === POLAR_ORG_ID);
    if (!org) {
      throw new Error(`Organization ${POLAR_ORG_ID} not found`);
    }
  } catch (error) {
    throw new Error(`Polar API error: ${error.message}`);
  }
});

// Test 3: Check subscription product exists
test('Subscription product exists in Polar', async () => {
  const configPath = path.join(__dirname, '../../config/subscription-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  if (!config.productId) {
    throw new Error('No product ID in config. Run create-subscription-product.js.');
  }

  try {
    const product = await polar.products.get({ id: config.productId });
    if (product.type !== 'subscription') {
      throw new Error('Product exists but is not a subscription type');
    }
    if (product.name !== 'NO3D Tools Library - Full Access') {
      throw new Error('Product name mismatch');
    }
  } catch (error) {
    if (error.status === 404) {
      throw new Error('Product not found in Polar. Run create-subscription-product.js.');
    }
    throw error;
  }
});

// Test 4: Check checkout link exists
test('Checkout link exists', async () => {
  const configPath = path.join(__dirname, '../../config/subscription-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  if (!config.checkoutLinkId) {
    throw new Error('No checkout link ID in config');
  }

  try {
    const link = await polar.checkoutLinks.get({ id: config.checkoutLinkId });
    if (!link.url) {
      throw new Error('Checkout link has no URL');
    }
  } catch (error) {
    if (error.status === 404) {
      throw new Error('Checkout link not found in Polar');
    }
    throw error;
  }
});

// Test 5: GitHub API connection (if token provided)
if (GITHUB_TOKEN) {
  test('GitHub API connection', async () => {
    try {
      const { data } = await octokit.repos.get({
        owner: 'node-dojo',
        repo: 'no3d-tools-library',
      });
      if (!data) {
        throw new Error('Repository not found');
      }
    } catch (error) {
      throw new Error(`GitHub API error: ${error.message}`);
    }
  });

  // Test 6: Can access repository contents
  test('Can access repository contents', async () => {
    try {
      const { data } = await octokit.repos.getContent({
        owner: 'node-dojo',
        repo: 'no3d-tools-library',
        path: '',
      });
      if (!Array.isArray(data)) {
        throw new Error('Repository contents not accessible');
      }
      const productFolders = data.filter(item => 
        item.type === 'dir' && item.name.startsWith('Dojo')
      );
      if (productFolders.length === 0) {
        throw new Error('No product folders found');
      }
    } catch (error) {
      throw new Error(`Cannot access repository: ${error.message}`);
    }
  });
}

// Test 7: Check API files exist
test('API endpoint files exist', async () => {
  const apiFiles = [
    'api/v1/webhooks/polar.js',
    'api/v1/webhooks/github.js',
    'api/v1/library/download.js',
    'api/v1/catalog/version.js',
    'api/v1/user/entitlements.js',
    'api/utils/polar-auth.js',
  ];

  for (const file of apiFiles) {
    const filePath = path.join(__dirname, '../../', file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`API file missing: ${file}`);
    }
  }
});

// Test 8: Check website files exist
test('Website files exist', async () => {
  const websiteFiles = [
    'website/subscribe.html',
    'website/success.html',
    'website/account.html',
  ];

  for (const file of websiteFiles) {
    const filePath = path.join(__dirname, '../../', file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Website file missing: ${file}`);
    }
  }
});

// Test 9: Check vercel.json exists
test('Vercel configuration exists', async () => {
  const vercelPath = path.join(__dirname, '../../vercel.json');
  if (!fs.existsSync(vercelPath)) {
    throw new Error('vercel.json not found');
  }
  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  if (!config.builds || !config.routes) {
    throw new Error('vercel.json missing required configuration');
  }
});

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
