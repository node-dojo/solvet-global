#!/usr/bin/env node

/**
 * Check Environment Setup
 * Helps identify where tokens might be stored
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Environment Setup\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check .env file
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const polarToken = envContent.match(/POLAR_API_TOKEN=(.+)/);
  const polarOrg = envContent.match(/POLAR_ORG_ID=(.+)/);
  
  console.log('📄 .env file status:');
  if (polarToken && !polarToken[1].includes('your_') && !polarToken[1].includes('here')) {
    const masked = polarToken[1].length > 8 ? `${polarToken[1].substring(0, 4)}...${polarToken[1].substring(polarToken[1].length - 4)}` : '***';
    console.log(`  ✅ POLAR_API_TOKEN: ${masked} (looks like real token)`);
  } else {
    console.log(`  ⚠️  POLAR_API_TOKEN: ${polarToken ? polarToken[1] : 'Not set'} (placeholder value)`);
  }
  
  if (polarOrg && !polarOrg[1].includes('your_') && !polarOrg[1].includes('here')) {
    console.log(`  ✅ POLAR_ORG_ID: ${polarOrg[1].substring(0, 8)}... (looks like real ID)`);
  } else {
    console.log(`  ⚠️  POLAR_ORG_ID: ${polarOrg ? polarOrg[1] : 'Not set'} (placeholder value)`);
  }
  console.log('');
}

// Check process.env (might be set in shell)
console.log('🔐 Process Environment Variables:');
const processToken = process.env.POLAR_API_TOKEN;
const processOrg = process.env.POLAR_ORG_ID;

if (processToken && !processToken.includes('your_') && !processToken.includes('here')) {
  const masked = processToken.length > 8 ? `${processToken.substring(0, 4)}...${processToken.substring(processToken.length - 4)}` : '***';
  console.log(`  ✅ POLAR_API_TOKEN: ${masked} (set in environment)`);
} else if (processToken) {
  console.log(`  ⚠️  POLAR_API_TOKEN: ${processToken} (placeholder)`);
} else {
  console.log(`  ❌ POLAR_API_TOKEN: Not set in process.env`);
}

if (processOrg && !processOrg.includes('your_') && !processOrg.includes('here')) {
  console.log(`  ✅ POLAR_ORG_ID: ${processOrg.substring(0, 8)}... (set in environment)`);
} else if (processOrg) {
  console.log(`  ⚠️  POLAR_ORG_ID: ${processOrg} (placeholder)`);
} else {
  console.log(`  ❌ POLAR_ORG_ID: Not set in process.env`);
}
console.log('');

// Check .mcp.json
const mcpPath = path.join(__dirname, '../../.mcp.json');
if (fs.existsSync(mcpPath)) {
  try {
    const mcpContent = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    const authHeader = mcpContent?.mcpServers?.Polar?.headers?.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && !authHeader.includes('${')) {
      const token = authHeader.replace('Bearer ', '');
      const masked = token.length > 8 ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : '***';
      console.log(`📋 .mcp.json: Has token ${masked}`);
    } else if (authHeader && authHeader.includes('${')) {
      console.log(`📋 .mcp.json: References environment variable (needs .env)`);
    } else {
      console.log(`📋 .mcp.json: No valid token found`);
    }
  } catch (e) {
    console.log(`📋 .mcp.json: Could not parse`);
  }
  console.log('');
}

// Recommendations
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n💡 Recommendations:\n');

if (!processToken || processToken.includes('your_') || processToken.includes('here')) {
  console.log('1. Update .env file with your actual Polar API token:');
  console.log('   - Get token from: https://polar.sh/settings/api');
  console.log('   - Edit .env and replace "your_polar_api_token_here" with your token');
  console.log('');
}

if (!processOrg || processOrg.includes('your_') || processOrg.includes('here')) {
  console.log('2. Update .env file with your Polar Organization ID:');
  console.log('   - Find it in Polar dashboard or API');
  console.log('   - Edit .env and replace "your_org_id_here" with your org ID');
  console.log('');
}

console.log('3. After updating .env, test again:');
console.log('   node scripts/test/subscription-system-test.js\n');
