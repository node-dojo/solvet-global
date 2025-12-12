#!/usr/bin/env node

/**
 * Add missing prices to products for consolidation
 * 
 * This script adds FREE or paid prices to products that are missing them,
 * allowing consolidation of FREE and paid variants into single products.
 * 
 * Usage:
 *   node scripts/add-missing-prices.js [options]
 * 
 * Options:
 *   --dry-run          Preview what would be added (default)
 *   --no-dry-run      Actually add prices
 */

import { Polar } from '@polar-sh/sdk';
import { parseArgs } from 'util';
import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { validateEnvVars, logTokenInfo } = require('./utils/security.js');

const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const POLAR_ORG_ID = process.env.POLAR_ORG_ID;

// Validate required environment variables
try {
  validateEnvVars(['POLAR_API_TOKEN', 'POLAR_ORG_ID']);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nUsage: POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/add-missing-prices.js');
  process.exit(1);
}

logTokenInfo('POLAR_API_TOKEN', POLAR_API_TOKEN);

const polar = new Polar({
  accessToken: POLAR_API_TOKEN,
});

// Parse command line arguments
const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: true },
    'no-dry-run': { type: 'boolean', default: false },
  },
  allowPositionals: true,
});

const DRY_RUN = values['no-dry-run'] ? false : values['dry-run'];

/**
 * Consolidation plan - products to keep and prices to add
 * Based on PRODUCT_CONSOLIDATION_PLAN.md
 */
const CONSOLIDATION_PLAN = {
  // Products that need FREE price added
  addFreePrice: [
    '2fbe03f5-f6bc-4d53-a309-1b9aa7fa010c', // Dojo Bolt Gen v05
    'eb28f590-e6eb-463a-830d-95243e51de89', // Dojo Bolt Gen v05_Obj
    'ee82acc9-63a8-4b79-a7bd-a06ec8722391', // Dojo Crv Wrapper v4
  ],
  
  // Products that need paid price ($4.44) added
  addPaidPrice: [
    '9e9925e7-788f-4ca1-81ec-9c1b5ae61e43', // Dojo Bool v5
    '2092d69f-a243-468c-b1ca-48f7cea19e68', // Dojo Calipers
    'b3c265a8-272d-41b7-930d-529538b41f8a', // Dojo Gluefinity Grid_obj
    'c17384fb-dee6-4d86-891c-ed02bbb2e5d7', // Dojo Knob
    '53bbe0f8-7f9f-4d40-8387-473355277ece', // Dojo Knob_obj
    '714ffbe4-b381-4884-a1da-7c2e8f8b2a91', // Dojo Mesh Repair
    'c668211b-f0ac-4b54-82ac-5f97c8f4adcc', // Dojo Print Viz_V4.5
    'fec65858-a3d7-47dc-987c-487a239ea94c', // Dojo_Squircle v4.5
    '67c6c182-8a09-4687-914e-2fbb01eff5dc', // Dojo Squircle v4.5_obj
  ],
};

async function main() {
  try {
    console.log('💰 Adding Missing Prices for Product Consolidation\n');
    console.log('='.repeat(80));
    
    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No prices will be added\n');
    }

    // Fetch all products
    console.log('📡 Fetching products...\n');
    const response = await polar.products.list({
      organizationId: POLAR_ORG_ID,
      limit: 100,
      isArchived: false,
    });

    const products = response.result?.items || [];
    const productMap = new Map(products.map(p => [p.id, p]));

    let addedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Add FREE prices
    console.log('🆓 Adding FREE prices:\n');
    for (const productId of CONSOLIDATION_PLAN.addFreePrice) {
      const product = productMap.get(productId);
      if (!product) {
        console.log(`   ⚠️  Product ${productId.substring(0, 8)}... not found`);
        skippedCount++;
        continue;
      }

      // Check if already has FREE price
      const hasFree = product.prices?.some(p => 
        !p.is_archived && p.amount_type === 'free'
      );

      if (hasFree) {
        console.log(`   ✓ ${product.name} already has FREE price`);
        skippedCount++;
        continue;
      }

      console.log(`   + ${product.name} (${productId.substring(0, 8)}...)`);

      if (!DRY_RUN) {
        try {
          // Add FREE price
          // Note: Polar API may require updating the product with new prices
          // This is a placeholder - actual implementation depends on Polar API
          console.log(`      ⚠️  Price addition not yet implemented - use Polar dashboard or API directly`);
          // await polar.products.update({
          //   id: productId,
          //   productUpdate: {
          //     prices: [...existingPrices, { amount_type: 'free' }]
          //   }
          // });
          addedCount++;
        } catch (error) {
          errors.push({ product: product.name, id: productId, error: error.message });
          console.error(`      ❌ Error: ${error.message}`);
        }
      }
    }

    console.log();

    // Add paid prices
    console.log('💵 Adding paid prices ($4.44):\n');
    for (const productId of CONSOLIDATION_PLAN.addPaidPrice) {
      const product = productMap.get(productId);
      if (!product) {
        console.log(`   ⚠️  Product ${productId.substring(0, 8)}... not found`);
        skippedCount++;
        continue;
      }

      // Check if already has paid price
      const hasPaid = product.prices?.some(p => 
        !p.is_archived && p.amount_type === 'fixed' && p.price_amount > 0
      );

      if (hasPaid) {
        console.log(`   ✓ ${product.name} already has paid price`);
        skippedCount++;
        continue;
      }

      console.log(`   + ${product.name} (${productId.substring(0, 8)}...) - $4.44 USD`);

      if (!DRY_RUN) {
        try {
          // Add paid price
          // Note: Polar API may require updating the product with new prices
          // This is a placeholder - actual implementation depends on Polar API
          console.log(`      ⚠️  Price addition not yet implemented - use Polar dashboard or API directly`);
          // await polar.products.update({
          //   id: productId,
          //   productUpdate: {
          //     prices: [...existingPrices, { 
          //       amount_type: 'fixed',
          //       price_amount: 444,
          //       price_currency: 'usd'
          //     }]
          //   }
          // });
          addedCount++;
        } catch (error) {
          errors.push({ product: product.name, id: productId, error: error.message });
          console.error(`      ❌ Error: ${error.message}`);
        }
      }
    }

    console.log();
    console.log('='.repeat(80));
    console.log('SUMMARY:');
    console.log(`   Prices to add: ${CONSOLIDATION_PLAN.addFreePrice.length + CONSOLIDATION_PLAN.addPaidPrice.length}`);
    console.log(`   Already have price: ${skippedCount}`);
    console.log(`   Would add: ${addedCount}`);
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.length}`);
    }
    console.log('='.repeat(80));
    console.log();

    if (DRY_RUN) {
      console.log('💡 To actually add prices:');
      console.log('   1. Use Polar dashboard to manually add prices');
      console.log('   2. Or use Polar API: polar.products.update() with new prices array');
      console.log('   3. Or contact Polar support for bulk price updates');
      console.log();
    }

    if (errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      errors.forEach(e => {
        console.log(`   - ${e.product} (${e.id.substring(0, 8)}...): ${e.error}`);
      });
      console.log();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.body) {
      console.error('Details:', error.body);
    }
    process.exit(1);
  }
}

main();



