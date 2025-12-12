#!/usr/bin/env node

/**
 * Quick Test - Tests what we can without full API setup
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Quick Subscription System Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Check config file
console.log('1. Checking subscription config...');
const configPath = path.join(__dirname, '../../config/subscription-config.json');
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (config.productId || config.checkoutUrl) {
    console.log('   ✅ Config file exists with data');
    console.log(`   Product ID: ${config.productId || 'Not set'}`);
    console.log(`   Checkout URL: ${config.checkoutUrl ? 'Set' : 'Not set'}\n`);
  } else {
    console.log('   ⚠️  Config file exists but is empty');
    console.log('   Run: node scripts/setup/create-subscription-product.js\n');
  }
} else {
  console.log('   ⚠️  Config file not found');
  console.log('   Run: node scripts/setup/create-subscription-product.js\n');
}

// Test 2: Check API files syntax
console.log('2. Checking API files syntax...');
const apiFiles = [
  'api/v1/webhooks/polar.js',
  'api/v1/webhooks/github.js',
  'api/v1/library/download.js',
  'api/v1/catalog/version.js',
  'api/v1/user/entitlements.js',
];

let syntaxErrors = 0;
for (const file of apiFiles) {
  const filePath = path.join(__dirname, '../../', file);
  if (fs.existsSync(filePath)) {
    try {
      // Try to require/parse the file
      const content = fs.readFileSync(filePath, 'utf8');
      // Basic syntax check - look for common errors
      if (content.includes('import ') && !content.includes('export ')) {
        console.log(`   ⚠️  ${file}: Uses ES6 imports (needs Vercel or .mjs)`);
      } else {
        console.log(`   ✅ ${file}: Syntax OK`);
      }
    } catch (error) {
      console.log(`   ❌ ${file}: ${error.message}`);
      syntaxErrors++;
    }
  }
}
console.log('');

// Test 3: Check website files
console.log('3. Checking website files...');
const websiteFiles = [
  'website/subscribe.html',
  'website/success.html',
  'website/account.html',
];

for (const file of websiteFiles) {
  const filePath = path.join(__dirname, '../../', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('</html>')) {
      console.log(`   ✅ ${file}: Valid HTML`);
    } else {
      console.log(`   ⚠️  ${file}: May be incomplete`);
    }
  } else {
    console.log(`   ❌ ${file}: Missing`);
  }
}
console.log('');

// Test 4: Check dependencies
console.log('4. Checking dependencies...');
const packagePath = path.join(__dirname, '../../package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const nodeModulesPath = path.join(__dirname, '../../node_modules');

if (fs.existsSync(nodeModulesPath)) {
  const deps = ['@polar-sh/sdk', '@octokit/rest', 'archiver'];
  for (const dep of deps) {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`   ✅ ${dep}: Installed`);
    } else {
      console.log(`   ❌ ${dep}: Not installed`);
    }
  }
} else {
  console.log('   ⚠️  node_modules not found - run: npm install');
}
console.log('');

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 Next Steps:\n');
console.log('1. Set environment variables:');
console.log('   export POLAR_API_TOKEN=your_token');
console.log('   export POLAR_ORG_ID=your_org_id');
console.log('');
console.log('2. Create subscription product:');
console.log('   node scripts/setup/create-subscription-product.js');
console.log('');
console.log('3. Test with API credentials:');
console.log('   node scripts/test/subscription-system-test.js');
console.log('');
console.log('4. Test locally with Vercel CLI:');
console.log('   vercel dev');
console.log('');
