#!/usr/bin/env node

/**
 * Consolidate Duplicate Products
 * 
 * This script merges duplicate products into single products with multiple price options.
 * Instead of archiving, it:
 * 1. Keeps the best variant of each product
 * 2. Adds all missing prices (FREE + paid) to the kept product
 * 3. Merges better descriptions/icons if available
 * 4. Archives duplicates after consolidation
 * 
 * Usage:
 *   node scripts/consolidate-products.js [options]
 * 
 * Options:
 *   --dry-run          Preview what would be consolidated (default)
 *   --no-dry-run       Actually consolidate products
 */

import { Polar } from '@polar-sh/sdk';
import { parseArgs } from 'util';
import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { validateEnvVars, logTokenInfo, sanitizeError } = require('./utils/security.js');

const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const POLAR_ORG_ID = process.env.POLAR_ORG_ID;

// Validate required environment variables
try {
  validateEnvVars(['POLAR_API_TOKEN', 'POLAR_ORG_ID']);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nUsage: POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/consolidate-products.js');
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

      // Create unique key for price
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

async function main() {
  try {
    console.log('🔄 Product Consolidation\n');
    console.log('='.repeat(80));

    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    // Fetch all products
    console.log('📡 Fetching products...\n');
    const response = await polar.products.list({
      organizationId: POLAR_ORG_ID,
      limit: 100,
      isArchived: false,
    });

    const products = response.result?.items || [];
    console.log(`Found ${products.length} active products\n`);

    // Group by name
    const groups = {};
    products.forEach(product => {
      const name = product.name;
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(product);
    });

    // Score and sort each group
    const consolidationPlan = [];
    Object.entries(groups).forEach(([name, variants]) => {
      if (variants.length === 1) {
        // Single variant - no consolidation needed
        return;
      }

      // Score all variants
      const scored = variants.map(product => ({
        product,
        ...scoreProduct(product),
      })).sort((a, b) => b.score - a.score);

      const best = scored[0];
      const others = scored.slice(1);

      // Collect all prices
      const allPrices = collectAllPrices(variants);
      const currentPrices = best.product.prices?.filter(p => !p.is_archived) || [];
      const missingPrices = allPrices.filter(newPrice => {
        return !currentPrices.some(current => {
          if (current.amount_type !== newPrice.amount_type) return false;
          if (newPrice.amount_type === 'free') return true;
          return current.price_amount === newPrice.price_amount && 
                 (current.price_currency || 'usd') === newPrice.price_currency;
        });
      });

      // Get best description
      const bestDescription = getBestDescription(variants);

      consolidationPlan.push({
        name,
        keep: best.product,
        keepScore: best.score,
        archive: others.map(s => s.product),
        allPrices,
        missingPrices,
        bestDescription,
        currentDescription: best.product.description,
      });
    });

    if (consolidationPlan.length === 0) {
      console.log('✨ No duplicates found! All products are unique.\n');
      return;
    }

    console.log(`📋 Consolidation Plan: ${consolidationPlan.length} product groups\n`);

    let consolidated = 0;
    let archived = 0;
    const errors = [];

    // Process each consolidation
    for (const plan of consolidationPlan) {
      console.log(`\n📦 ${plan.name}:`);
      console.log(`   ✅ Keep: ${plan.keep.id.substring(0, 8)}... (Score: ${plan.keepScore})`);
      console.log(`   🗑️  Archive: ${plan.archive.length} duplicates`);

      // Check if we need to add prices
      if (plan.missingPrices.length > 0) {
        console.log(`   💰 Add prices: ${plan.missingPrices.map(p => 
          p.amount_type === 'free' ? 'FREE' : `$${(p.price_amount / 100).toFixed(2)}`
        ).join(', ')}`);

        if (!DRY_RUN) {
          try {
            // Update product with all prices
            const updatedPrices = [
              ...(plan.keep.prices?.filter(p => !p.is_archived) || []),
              ...plan.missingPrices,
            ];

            await polar.products.update({
              id: plan.keep.id,
              productUpdate: {
                prices: updatedPrices,
              },
            });

            console.log(`   ✓ Added ${plan.missingPrices.length} price(s)`);
            consolidated++;
          } catch (error) {
            const safeMsg = sanitizeError(error);
            console.error(`   ❌ Failed to add prices: ${safeMsg}`);
            errors.push({ product: plan.name, action: 'add prices', error: safeMsg });
          }
        }
      } else {
        console.log(`   ✓ Already has all prices`);
      }

      // Check if we need to update description
      if (plan.bestDescription !== plan.currentDescription && plan.bestDescription.length > plan.currentDescription.length) {
        console.log(`   📝 Update description (${plan.bestDescription.length} chars vs ${plan.currentDescription.length} chars)`);

        if (!DRY_RUN) {
          try {
            await polar.products.update({
              id: plan.keep.id,
              productUpdate: {
                description: plan.bestDescription,
              },
            });

            console.log(`   ✓ Updated description`);
          } catch (error) {
            const safeMsg = sanitizeError(error);
            console.error(`   ❌ Failed to update description: ${safeMsg}`);
            errors.push({ product: plan.name, action: 'update description', error: safeMsg });
          }
        }
      }

      // Archive duplicates
      if (!DRY_RUN) {
        for (const duplicate of plan.archive) {
          try {
            await polar.products.update({
              id: duplicate.id,
              productUpdate: {
                isArchived: true,
              },
            });

            archived++;
          } catch (error) {
            const safeMsg = sanitizeError(error);
            console.error(`   ❌ Failed to archive ${duplicate.id.substring(0, 8)}...: ${safeMsg}`);
            errors.push({ product: duplicate.name, id: duplicate.id, action: 'archive', error: safeMsg });
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY:');
    console.log(`   Product groups consolidated: ${consolidationPlan.length}`);
    if (!DRY_RUN) {
      console.log(`   Prices added: ${consolidated}`);
      console.log(`   Duplicates archived: ${archived}`);
      if (errors.length > 0) {
        console.log(`   Errors: ${errors.length}`);
      }
    }
    console.log(`   Final product count: ${products.length - archived} (from ${products.length})`);
    console.log('='.repeat(80));
    console.log();

    if (DRY_RUN) {
      console.log('💡 To execute consolidation:');
      console.log('   Run with --no-dry-run flag\n');
    }

    if (errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      errors.forEach(e => {
        console.log(`   - ${e.product}: ${e.action} - ${e.error}`);
      });
      console.log();
    }

    console.log('✅ Consolidation complete!');
    console.log('   Next: Contact Polar support to permanently delete archived products\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.body) {
      console.error('Details:', error.body);
    }
    process.exit(1);
  }
}

main();



