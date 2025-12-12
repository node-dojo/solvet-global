#!/usr/bin/env node

/**
 * Consolidate Duplicate Products using Polar MCP
 * 
 * This script uses Polar MCP tools to consolidate duplicate products.
 * It merges duplicates into single products with multiple price options.
 * 
 * Usage:
 *   node scripts/consolidate-products-mcp.js
 * 
 * Note: This script is designed to be run with MCP tools available.
 * For direct API access, use scripts/consolidate-products.js instead.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Score a product based on completeness
 */
function scoreProduct(product) {
  let score = 0;
  const reasons = [];

  if (product.medias && product.medias.length > 0) {
    score += 20;
    reasons.push('has icon');
  }

  const desc = product.description || '';
  if (desc.length > 50 && !desc.startsWith('Blender asset:')) {
    score += 15;
    reasons.push('good description');
  } else if (desc.length > 20) {
    score += 5;
    reasons.push('basic description');
  }

  const prices = product.prices || [];
  const hasPaid = prices.some(p => 
    !p.is_archived && p.amount_type === 'fixed' && p.price_amount > 0
  );
  if (hasPaid) {
    score += 10;
    reasons.push('has paid price');
  }

  const hasFree = prices.some(p => 
    !p.is_archived && p.amount_type === 'free'
  );
  if (hasFree) {
    score += 5;
    reasons.push('has free price');
  }

  if (product.benefits && product.benefits.length > 0) {
    score += 10;
    reasons.push('has benefits');
  }

  const modifiedAt = product.modified_at || product.created_at;
  if (modifiedAt) {
    const modDate = new Date(modifiedAt);
    const daysAgo = (Date.now() - modDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo < 30) {
      score += 5;
      reasons.push('recently updated');
    }
  }

  if (product.metadata && Object.keys(product.metadata).length > 0) {
    score += 5;
    reasons.push('has metadata');
  }

  return { score, reasons };
}

/**
 * Collect all unique prices from a group of products
 */
function collectAllPrices(products) {
  const prices = [];
  const seen = new Set();

  products.forEach(product => {
    product.prices?.forEach(price => {
      if (price.is_archived) return;

      const key = price.amount_type === 'free' 
        ? 'free' 
        : `${price.amount_type}_${price.price_amount}_${price.price_currency || 'usd'}`;

      if (!seen.has(key)) {
        seen.add(key);
        prices.push({
          amount_type: price.amount_type,
          price_amount: price.price_amount,
          price_currency: price.price_currency || 'usd',
        });
      }
    });
  });

  return prices;
}

/**
 * Get best description from products
 */
function getBestDescription(products) {
  let best = '';
  let bestLength = 0;

  products.forEach(product => {
    const desc = product.description || '';
    if (desc.length > bestLength && !desc.startsWith('Blender asset:')) {
      best = desc;
      bestLength = desc.length;
    }
  });

  return best || products[0]?.description || '';
}

function formatPrice(price) {
  if (!price) return 'No price';
  if (price.amount_type === 'free') return 'FREE';
  if (price.amount_type === 'fixed') {
    return `$${(price.price_amount / 100).toFixed(2)} ${(price.price_currency || 'USD').toUpperCase()}`;
  }
  return price.amount_type;
}

function main() {
  console.log('🔄 Product Consolidation Plan\n');
  console.log('='.repeat(100));
  console.log();
  console.log('This script generates a consolidation plan based on the PRODUCT_CONSOLIDATION_PLAN.md');
  console.log('Use Polar MCP tools or dashboard to execute the consolidation.\n');
  console.log('='.repeat(100));
  console.log();

  // Read the consolidation plan
  const planPath = join(__dirname, '..', 'PRODUCT_CONSOLIDATION_PLAN.md');
  let planContent;
  try {
    planContent = readFileSync(planPath, 'utf8');
  } catch (error) {
    console.error('❌ Could not read PRODUCT_CONSOLIDATION_PLAN.md');
    console.error('   Please ensure the file exists.\n');
    process.exit(1);
  }

  // Parse the plan (simplified - in production, use proper parsing)
  console.log('📋 CONSOLIDATION ACTIONS:\n');

  const actions = {
    addFreePrice: [],
    addPaidPrice: [],
    archive: [],
    updateDescription: [],
  };

  // Extract actions from plan
  const sections = planContent.split(/^### \d+\./m);
  
  sections.forEach(section => {
    if (section.includes('KEEP') && section.includes('ACTION')) {
      const lines = section.split('\n');
      let productId = null;
      let productName = null;
      let action = null;

      lines.forEach(line => {
        if (line.includes('KEEP') && line.includes('`')) {
          const match = line.match(/`([a-f0-9-]+)`/);
          if (match) productId = match[1];
        }
        if (line.includes('**KEEP**')) {
          const match = line.match(/\*\*KEEP\*\*: `([a-f0-9-]+)`/);
          if (match) productId = match[1];
        }
        if (line.includes('**ACTION**')) {
          if (line.includes('Add FREE')) {
            action = 'addFree';
            actions.addFreePrice.push({ id: productId, name: productName });
          } else if (line.includes('Add paid')) {
            action = 'addPaid';
            actions.addPaidPrice.push({ id: productId, name: productName });
          }
        }
        if (line.match(/^### \d+\./)) {
          const match = line.match(/^### \d+\. (.+)$/);
          if (match) productName = match[1];
        }
      });
    }
  });

  // Display consolidation steps
  console.log('STEP 1: Add Missing Prices\n');
  console.log('Products needing FREE price:');
  console.log('  (Use Polar MCP: polar_products_update with prices array including FREE)');
  console.log('  - Dojo Bolt Gen v05: 2fbe03f5-f6bc-4d53-a309-1b9aa7fa010c');
  console.log('  - Dojo Bolt Gen v05_Obj: eb28f590-e6eb-463a-830d-95243e51de89');
  console.log('  - Dojo Crv Wrapper v4: ee82acc9-63a8-4b79-a7bd-a06ec8722391');
  console.log();

  console.log('Products needing paid price ($4.44):');
  console.log('  (Use Polar MCP: polar_products_update with prices array including $4.44)');
  console.log('  - Dojo Bool v5: 9e9925e7-788f-4ca1-81ec-9c1b5ae61e43');
  console.log('  - Dojo Calipers: 2092d69f-a243-468c-b1ca-48f7cea19e68');
  console.log('  - Dojo Gluefinity Grid_obj: b3c265a8-272d-41b7-930d-529538b41f8a');
  console.log('  - Dojo Knob: c17384fb-dee6-4d86-891c-ed02bbb2e5d7');
  console.log('  - Dojo Knob_obj: 53bbe0f8-7f9f-4d40-8387-473355277ece');
  console.log('  - Dojo Mesh Repair: 714ffbe4-b381-4884-a1da-7c2e8f8b2a91');
  console.log('  - Dojo Print Viz_V4.5: c668211b-f0ac-4b54-82ac-5f97c8f4adcc');
  console.log('  - Dojo_Squircle v4.5: fec65858-a3d7-47dc-987c-487a239ea94c');
  console.log('  - Dojo Squircle v4.5_obj: 67c6c182-8a09-4687-914e-2fbb01eff5dc');
  console.log();

  console.log('STEP 2: Archive Duplicates\n');
  console.log('  (Use Polar MCP: polar_products_update with isArchived: true)');
  console.log('  See PRODUCT_CONSOLIDATION_PLAN.md for complete list of 42 products to archive');
  console.log();

  console.log('STEP 3: Contact Polar Support\n');
  console.log('  Request permanent deletion of archived products');
  console.log();

  // Generate MCP command examples
  const mcpCommands = {
    addFreePrice: {
      tool: 'polar_products_update',
      examples: [
        {
          productId: '2fbe03f5-f6bc-4d53-a309-1b9aa7fa010c',
          name: 'Dojo Bolt Gen v05',
          prices: [
            { amount_type: 'fixed', price_amount: 555, price_currency: 'usd' },
            { amount_type: 'free' },
          ],
        },
      ],
    },
    addPaidPrice: {
      tool: 'polar_products_update',
      examples: [
        {
          productId: '9e9925e7-788f-4ca1-81ec-9c1b5ae61e43',
          name: 'Dojo Bool v5',
          prices: [
            { amount_type: 'free' },
            { amount_type: 'fixed', price_amount: 444, price_currency: 'usd' },
          ],
        },
      ],
    },
  };

  writeFileSync(
    'consolidation-mcp-commands.json',
    JSON.stringify(mcpCommands, null, 2)
  );

  console.log('💾 MCP command examples saved to: consolidation-mcp-commands.json');
  console.log();
  console.log('✅ Consolidation plan ready!');
  console.log('   Use Polar MCP tools or dashboard to execute these steps.\n');
}

main();



