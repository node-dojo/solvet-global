#!/usr/bin/env node

/**
 * Load Environment Variables Test
 * Tests if .env file exists and can be loaded
 */

require('dotenv').config();
const { validateEnvVars } = require('../utils/security');

console.log('🔍 Checking Environment Variables\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../../.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists\n');
} else {
  console.log('⚠️  .env file not found');
  console.log('   Create it from .env.example:\n');
  console.log('   cp .env.example .env');
  console.log('   # Then edit .env and add your tokens\n');
  process.exit(1);
}

// Check environment variables
const vars = {
  'POLAR_API_TOKEN': process.env.POLAR_API_TOKEN,
  'POLAR_ORG_ID': process.env.POLAR_ORG_ID,
  'GITHUB_TOKEN': process.env.GITHUB_TOKEN,
};

console.log('Environment Variables Status:\n');

for (const [name, value] of Object.entries(vars)) {
  if (value) {
    const masked = value.length > 8 ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : '***';
    console.log(`  ✅ ${name}: ${masked} (${value.length} chars)`);
  } else {
    console.log(`  ❌ ${name}: Not set`);
  }
}

console.log('');

// Try to validate Polar vars
try {
  validateEnvVars(['POLAR_API_TOKEN', 'POLAR_ORG_ID']);
  console.log('✅ Required Polar variables are set\n');
  console.log('You can now run:');
  console.log('  node scripts/setup/create-subscription-product.js');
  console.log('  node scripts/test/subscription-system-test.js\n');
} catch (error) {
  console.log('❌ Missing required variables:', error.message);
  console.log('\nPlease add them to your .env file:\n');
  console.log('POLAR_API_TOKEN=your_token_here');
  console.log('POLAR_ORG_ID=your_org_id_here\n');
  process.exit(1);
}
