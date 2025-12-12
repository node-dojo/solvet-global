#!/usr/bin/env node

/**
 * Guide for Generating Polar API Token with Appropriate Scopes
 * 
 * This script helps identify what scopes are needed and provides
 * instructions for generating a token via Polar dashboard.
 */

require('dotenv').config();

console.log('🔑 Polar API Token Generation Guide\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Organization ID from config
const ORG_ID = process.env.POLAR_ORG_ID || 'f0c16049-5959-42c9-8be8-5952c38c7d63';

console.log('📋 Required Scopes for Subscription System:\n');
console.log('Based on the subscription system implementation, you need:\n');

const requiredScopes = [
  {
    scope: 'products:read',
    description: 'Read product information',
    usedIn: ['api/utils/polar-auth.js', 'scripts/setup/create-subscription-product.js']
  },
  {
    scope: 'products:write',
    description: 'Create and update products',
    usedIn: ['scripts/setup/create-subscription-product.js']
  },
  {
    scope: 'checkout_links:read',
    description: 'Read checkout link information',
    usedIn: ['scripts/setup/create-subscription-product.js']
  },
  {
    scope: 'checkout_links:write',
    description: 'Create checkout links',
    usedIn: ['scripts/setup/create-subscription-product.js']
  },
  {
    scope: 'subscriptions:read',
    description: 'Read subscription status',
    usedIn: ['api/utils/polar-auth.js', 'api/v1/user/entitlements.js']
  },
  {
    scope: 'customers:read',
    description: 'Read customer information',
    usedIn: ['api/utils/polar-auth.js', 'api/v1/user/entitlements.js']
  },
  {
    scope: 'webhooks:read',
    description: 'Read webhook configuration',
    usedIn: ['api/v1/webhooks/polar.js']
  },
  {
    scope: 'webhooks:write',
    description: 'Create/update webhooks',
    usedIn: ['Setup webhooks in dashboard']
  }
];

requiredScopes.forEach((item, index) => {
  console.log(`${index + 1}. ${item.scope}`);
  console.log(`   ${item.description}`);
  console.log(`   Used in: ${item.usedIn.join(', ')}\n`);
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📝 Steps to Generate Token:\n');
console.log('1. Go to Polar Dashboard:');
console.log(`   https://polar.sh/dashboard/settings/api\n`);
console.log('   OR navigate to:');
console.log('   Settings → General → Developers → New Token\n');
console.log('2. Configure Token:\n');
console.log('   Name: "SOLVET Subscription System" (or descriptive name)');
console.log('   Expiration: Set appropriate expiration (90 days recommended)');
console.log('   Scopes: Select all the scopes listed above\n');
console.log('3. Copy Token:\n');
console.log('   Token format: polar_oat_xxxxxxxxxxxxxxxxx');
console.log('   ⚠️  Copy immediately - you won\'t see it again!\n');
console.log('4. Update .env File:\n');
console.log(`   POLAR_API_TOKEN=polar_oat_your_new_token_here`);
console.log(`   POLAR_ORG_ID=${ORG_ID}\n`);
console.log('5. Refresh MCP Configuration:\n');
console.log('   node scripts/setup/refresh-polar-mcp.js\n');
console.log('6. Restart Cursor:\n');
console.log('   Restart Cursor IDE to apply MCP changes\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('💡 Quick Link:\n');
console.log(`   https://polar.sh/dashboard/settings/api\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
