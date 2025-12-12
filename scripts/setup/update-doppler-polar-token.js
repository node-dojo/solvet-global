#!/usr/bin/env node

/**
 * Update Doppler POLAR_API_TOKEN from .env file
 * Reads .env and updates Doppler directly
 */

require('dotenv').config();
const { execSync } = require('child_process');

const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;

if (!POLAR_API_TOKEN) {
  console.error('❌ POLAR_API_TOKEN not found in .env');
  process.exit(1);
}

// Check if it's a placeholder
const isPlaceholder = 
  POLAR_API_TOKEN.includes('your_') ||
  POLAR_API_TOKEN.includes('placeholder') ||
  POLAR_API_TOKEN.includes('example') ||
  POLAR_API_TOKEN === 'your_polar_api_token_here';

if (isPlaceholder) {
  console.error('❌ POLAR_API_TOKEN in .env appears to be a placeholder');
  console.error('   Please update .env with your actual Polar API token');
  console.error('   Get token from: https://polar.sh/dashboard/settings/api');
  process.exit(1);
}

console.log('🔄 Updating Doppler POLAR_API_TOKEN...');
console.log(`   Token preview: ${POLAR_API_TOKEN.substring(0, 15)}...`);

try {
  // Update Doppler secret
  execSync(`doppler secrets set POLAR_API_TOKEN="${POLAR_API_TOKEN}"`, {
    stdio: 'inherit',
    encoding: 'utf8'
  });
  
  console.log('\n✅ Successfully updated POLAR_API_TOKEN in Doppler');
  console.log('\nVerify with: doppler secrets get POLAR_API_TOKEN --plain');
} catch (error) {
  console.error('\n❌ Failed to update Doppler');
  console.error('   Make sure you are logged in: doppler login');
  process.exit(1);
}





