#!/usr/bin/env node

/**
 * File Structure Test
 * Tests that all required files exist without needing API credentials
 */

const fs = require('fs');
const path = require('path');

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '../../', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`${description} not found: ${filePath}`);
  }
  return fullPath;
}

async function runTests() {
  console.log('📁 Testing File Structure\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('✅ All file structure tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some files are missing');
    process.exit(1);
  }
}

// Test API files
test('API endpoint files exist', () => {
  checkFile('api/v1/webhooks/polar.js', 'Polar webhook endpoint');
  checkFile('api/v1/webhooks/github.js', 'GitHub webhook endpoint');
  checkFile('api/v1/library/download.js', 'Download endpoint');
  checkFile('api/v1/catalog/version.js', 'Version endpoint');
  checkFile('api/v1/user/entitlements.js', 'Entitlements endpoint');
  checkFile('api/utils/polar-auth.js', 'Polar auth utilities');
});

// Test website files
test('Website files exist', () => {
  checkFile('website/subscribe.html', 'Subscribe page');
  checkFile('website/success.html', 'Success page');
  checkFile('website/account.html', 'Account page');
});

// Test scripts
test('Setup scripts exist', () => {
  checkFile('scripts/setup/create-subscription-product.js', 'Subscription product script');
});

// Test config files
test('Configuration files exist', () => {
  checkFile('config/subscription-config.json', 'Subscription config');
  checkFile('vercel.json', 'Vercel config');
  checkFile('package.json', 'Package.json');
});

// Test documentation
test('Documentation files exist', () => {
  checkFile('docs/user-guide.md', 'User guide');
  checkFile('docs/api-reference.md', 'API reference');
  checkFile('docs/setup-guide.md', 'Setup guide');
});

// Test package.json has dependencies
test('Package.json has required dependencies', () => {
  const packagePath = checkFile('package.json', 'Package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = ['@polar-sh/sdk', '@octokit/rest', 'archiver'];
  const missing = requiredDeps.filter(dep => !pkg.dependencies || !pkg.dependencies[dep]);
  
  if (missing.length > 0) {
    throw new Error(`Missing dependencies: ${missing.join(', ')}`);
  }
});

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
