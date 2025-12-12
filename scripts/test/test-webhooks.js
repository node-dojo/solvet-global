#!/usr/bin/env node
/**
 * Test webhook endpoints
 * Tests both Polar and GitHub webhook endpoints
 */

import https from 'https';
import crypto from 'crypto';

// Use the production alias URL (stable across deployments)
const WEBHOOK_BASE_URL = process.env.VERCEL_URL || 'https://solvet-global.vercel.app';
const POLAR_WEBHOOK_URL = `${WEBHOOK_BASE_URL}/api/v1/webhooks/polar`;
const GITHUB_WEBHOOK_URL = `${WEBHOOK_BASE_URL}/api/v1/webhooks/github`;

// Get secrets from environment (use Doppler if available)
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || '';
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

/**
 * Generate Polar webhook signature
 */
function generatePolarSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return `sha256=${digest}`;
}

/**
 * Generate GitHub webhook signature
 */
function generateGitHubSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return `sha256=${digest}`;
}

/**
 * Make HTTP POST request
 */
function makeRequest(url, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(payload);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Test Polar webhook
 */
async function testPolarWebhook() {
  console.log('\n🧪 Testing Polar Webhook...');
  console.log(`   URL: ${POLAR_WEBHOOK_URL}`);

  const testPayload = {
    id: 'test-webhook-id',
    type: 'subscription.created',
    created_at: new Date().toISOString(),
    data: {
      id: 'test-subscription-id',
      customer_id: 'test-customer-id',
      product_id: 'test-product-id',
      status: 'active',
    },
  };

  const payloadString = JSON.stringify(testPayload);
  let signature = '';

  if (POLAR_WEBHOOK_SECRET) {
    signature = generatePolarSignature(payloadString, POLAR_WEBHOOK_SECRET);
    console.log('   ✓ Using signature verification');
  } else {
    console.log('   ⚠️  No secret provided, testing without signature');
  }

  try {
    const response = await makeRequest(POLAR_WEBHOOK_URL, testPayload, {
      'X-Polar-Signature': signature,
    });

    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);

    if (response.statusCode === 200) {
      console.log('   ✅ Polar webhook test PASSED');
      return true;
    } else if (response.statusCode === 401) {
      console.log('   ⚠️  Authentication failed (expected if secret mismatch)');
      return false;
    } else {
      console.log('   ❌ Polar webhook test FAILED');
      return false;
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  }
}

/**
 * Test GitHub webhook
 */
async function testGitHubWebhook() {
  console.log('\n🧪 Testing GitHub Webhook...');
  console.log(`   URL: ${GITHUB_WEBHOOK_URL}`);

  const testPayload = {
    ref: 'refs/heads/main',
    commits: [
      {
        id: 'test-commit-id',
        message: 'Test commit',
        added: ['DojoTest/TestProduct.json'],
        modified: [],
        removed: [],
      },
    ],
    repository: {
      name: 'no3d-tools-library',
      owner: {
        name: 'node-dojo',
      },
    },
  };

  const payloadString = JSON.stringify(testPayload);
  let signature = '';

  if (GITHUB_WEBHOOK_SECRET) {
    signature = generateGitHubSignature(payloadString, GITHUB_WEBHOOK_SECRET);
    console.log('   ✓ Using signature verification');
  } else {
    console.log('   ⚠️  No secret provided, testing without signature');
  }

  try {
    const response = await makeRequest(GITHUB_WEBHOOK_URL, testPayload, {
      'X-Hub-Signature-256': signature,
    });

    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);

    if (response.statusCode === 200) {
      console.log('   ✅ GitHub webhook test PASSED');
      return true;
    } else if (response.statusCode === 401) {
      console.log('   ⚠️  Authentication failed (expected if secret mismatch)');
      return false;
    } else {
      console.log('   ❌ GitHub webhook test FAILED');
      return false;
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  }
}

/**
 * Test endpoint accessibility (GET request)
 */
async function testEndpointAccessibility() {
  console.log('\n🧪 Testing Endpoint Accessibility...');

  const testUrl = (url, name) => {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'GET',
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 405) {
            console.log(`   ✅ ${name} endpoint is accessible (405 = method not allowed, expected for GET)`);
            resolve(true);
          } else {
            console.log(`   ⚠️  ${name} returned status ${res.statusCode}`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error(`   ❌ ${name} error:`, error.message);
        resolve(false);
      });

      req.end();
    });
  };

  const polarOk = await testUrl(POLAR_WEBHOOK_URL, 'Polar');
  const githubOk = await testUrl(GITHUB_WEBHOOK_URL, 'GitHub');

  return polarOk && githubOk;
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Starting Webhook Tests\n');
  console.log('='.repeat(60));

  // Test endpoint accessibility
  await testEndpointAccessibility();

  // Test webhooks with payloads
  const polarResult = await testPolarWebhook();
  const githubResult = await testGitHubWebhook();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`   Polar Webhook: ${polarResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   GitHub Webhook: ${githubResult ? '✅ PASS' : '❌ FAIL'}`);

  if (!POLAR_WEBHOOK_SECRET || !GITHUB_WEBHOOK_SECRET) {
    console.log('\n⚠️  Note: Run with Doppler to test signature verification:');
    console.log('   doppler run -- node scripts/test/test-webhooks.js');
  }

  process.exit(polarResult && githubResult ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});





