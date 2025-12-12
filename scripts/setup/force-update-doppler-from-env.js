#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.join(__dirname, '../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/^POLAR_API_TOKEN=(.+)$/m);
const token = match ? match[1].trim().replace(/^["']|["']$/g, '') : null;

if (!token || token.length < 10) {
  console.error('❌ Invalid token in .env');
  process.exit(1);
}

console.log('🔄 Updating Doppler...');
execSync(`doppler secrets set "POLAR_API_TOKEN=${token}"`, { stdio: 'inherit' });
console.log('✅ Updated!');



