#!/usr/bin/env node

/**
 * Smart Product Consolidation Strategy
 * 
 * Instead of just archiving duplicates, this script:
 * 1. Scores each product based on completeness (icon, description, checkout link, etc.)
 * 2. Identifies the "canonical" version of each product
 * 3. Consolidates FREE and paid versions into single products with multiple prices
 * 4. Provides recommendations for which products to keep/archive
 * 
 * Usage:
 *   node scripts/smart-consolidate-products.js [options]
 * 
 * Options:
 *   --dry-run          Preview recommendations (default)
 *   --no-dry-run       Actually execute consolidation
 *   --strategy=best    Keep best-scoring product (default)
 *   --strategy=paid    Keep paid version, add FREE price if missing
 *   --strategy=free    Keep FREE version, add paid price if missing
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
  console.error('\nUsage: POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/smart-consolidate-products.js');
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
    'strategy': { type: 'string', default: 'best' },
  },
  allowPositionals: true,
});

const DRY_RUN = values['no-dry-run'] ? false : values['dry-run'];
const STRATEGY = values['strategy'] || 'best';

/**
 * Score a product based on completeness
 */
function scoreProduct(product) {
  let score = 0;
  const reasons = [];

  // Has icon/media (20 points)
  if (product.medias && product.medias.length > 0) {
    score += 20;
    reasons.push('has icon');
  }

  // Has good description (not just "Blender asset: X") (15 points)
  const desc = product.description || '';
  if (desc.length > 50 && !desc.startsWith('Blender asset:')) {
    score += 15;
    reasons.push('good description');
  } else if (desc.length > 20) {
    score += 5;
    reasons.push('basic description');
  }

  // Has paid price (10 points) - indicates it's a "real" product
  const hasPaidPrice = product.prices?.some(p => 
    !p.is_archived && p.amount_type === 'fixed' && p.price_amount > 0
  );
  if (hasPaidPrice) {
    score += 10;
    reasons.push('has paid price');
  }

  // Has FREE price (5 points)
  const hasFreePrice = product.prices?.some(p => 
    !p.is_archived && p.amount_type === 'free'
  );
  if (hasFreePrice) {
    score += 5;
    reasons.push('has free price');
  }

  // Has benefits/files (10 points)
  if (product.benefits && product.benefits.length > 0) {
    score += 10;
    reasons.push('has benefits');
  }

  // Recently modified (5 points)
  const modifiedDate = new Date(product.modified_at || product.created_at);
  const daysSinceModified = (Date.now() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceModified < 30) {
    score += 5;
    reasons.push('recently updated');
  }

  // Has metadata (5 points)
  if (product.metadata && Object.keys(product.metadata).length > 0) {
    score += 5;
    reasons.push('has metadata');
  }

  return { score, reasons };
}

/**
 * Get all products and analyze them
 */
async function analyzeProducts() {
  console.log('📡 Fetching all products from Polar...\n');

  const response = await polar.products.list({
    organizationId: POLAR_ORG_ID,
    limit: 100,
    isArchived: false,
  });

  const products = response.result?.items || [];
  console.log(`Found ${products.length} active products\n`);

  // Group by product name
  const productGroups = {};
  products.forEach(product => {
    const name = product.name;
    if (!productGroups[name]) {
      productGroups[name] = [];
    }
    productGroups[name].push(product);
  });

  // Score each product
  const scoredProducts = {};
  Object.entries(productGroups).forEach(([name, variants]) => {
    scoredProducts[name] = variants.map(product => ({
      product,
      ...scoreProduct(product),
    })).sort((a, b) => b.score - a.score); // Sort by score descending
  });

  return { productGroups, scoredProducts };
}

/**
 * Generate consolidation recommendations
 */
function generateRecommendations(scoredProducts) {
  const recommendations = {
    keep: [],
    archive: [],
    consolidate: [],
  };

  Object.entries(scoredProducts).forEach(([name, scoredVariants]) => {
    if (scoredVariants.length === 1) {
      // Single variant - keep it
      recommendations.keep.push({
        name,
        product: scoredVariants[0].product,
        score: scoredVariants[0].score,
        reasons: scoredVariants[0].reasons,
      });
      return;
    }

    // Multiple variants - need to decide
    const best = scoredVariants[0];
    const others = scoredVariants.slice(1);

    // Check if we should consolidate prices
    const allPrices = new Set();
    scoredVariants.forEach(sv => {
      sv.product.prices?.forEach(p => {
        if (!p.is_archived) {
          const priceKey = p.amount_type === 'free' ? 'free' : `$${p.price_amount / 100}`;
          allPrices.add(priceKey);
        }
      });
    });

    if (allPrices.size > 1) {
      // Multiple price variants - recommend consolidation
      recommendations.consolidate.push({
        name,
        keep: best.product,
        archive: others.map(sv => sv.product),
        keepScore: best.score,
        keepReasons: best.reasons,
        prices: Array.from(allPrices),
        strategy: STRATEGY,
      });
    } else {
      // Same prices - just keep the best one
      recommendations.keep.push({
        name,
        product: best.product,
        score: best.score,
        reasons: best.reasons,
      });
      recommendations.archive.push(...others.map(sv => sv.product));
    }
  });

  return recommendations;
}

/**
 * Display recommendations
 */
function displayRecommendations(recommendations) {
  console.log('='.repeat(80));
  console.log('PRODUCT CONSOLIDATION RECOMMENDATIONS'.padStart(50));
  console.log('='.repeat(80));
  console.log();

  // Products to keep as-is
  if (recommendations.keep.length > 0) {
    console.log(`✅ KEEP AS-IS (${recommendations.keep.length} products):`);
    recommendations.keep.forEach(item => {
      const price = item.product.prices?.[0];
      const priceStr = price?.amount_type === 'free' 
        ? 'FREE' 
        : `$${(price?.price_amount || 0) / 100} ${price?.price_currency?.toUpperCase() || ''}`;
      console.log(`   • ${item.name.padEnd(40)} Score: ${item.score.toString().padStart(3)} | ${priceStr.padEnd(15)} | ${item.reasons.join(', ')}`);
    });
    console.log();
  }

  // Products to consolidate
  if (recommendations.consolidate.length > 0) {
    console.log(`🔄 CONSOLIDATE (${recommendations.consolidate.length} products):`);
    recommendations.consolidate.forEach(item => {
      console.log(`\n   📦 ${item.name}:`);
      console.log(`      ✅ KEEP: ${item.keep.id.substring(0, 8)}... (Score: ${item.keepScore})`);
      console.log(`         Reasons: ${item.keepReasons.join(', ')}`);
      console.log(`         Current prices: ${item.keep.prices?.map(p => 
        p.amount_type === 'free' ? 'FREE' : `$${p.price_amount / 100}`
      ).join(', ') || 'none'}`);
      console.log(`         All available prices: ${item.prices.join(', ')}`);
      console.log(`      🗑️  ARCHIVE (${item.archive.length} variants):`);
      item.archive.forEach(p => {
        const price = p.prices?.[0];
        const priceStr = price?.amount_type === 'free' 
          ? 'FREE' 
          : `$${(price?.price_amount || 0) / 100}`;
        console.log(`         • ${p.id.substring(0, 8)}... | ${priceStr}`);
      });
    });
    console.log();
  }

  // Products to archive
  if (recommendations.archive.length > 0) {
    console.log(`🗑️  ARCHIVE DUPLICATES (${recommendations.archive.length} products):`);
    recommendations.archive.forEach(product => {
      const price = product.prices?.[0];
      const priceStr = price?.amount_type === 'free' 
        ? 'FREE' 
        : `$${(price?.price_amount || 0) / 100}`;
      console.log(`   • ${product.name.padEnd(40)} | ${priceStr}`);
    });
    console.log();
  }

  // Summary
  console.log('='.repeat(80));
  console.log('SUMMARY:');
  console.log(`   Products to keep: ${recommendations.keep.length}`);
  console.log(`   Products to consolidate: ${recommendations.consolidate.length}`);
  console.log(`   Products to archive: ${recommendations.archive.length}`);
  console.log(`   Total active products: ${recommendations.keep.length + recommendations.consolidate.length}`);
  console.log(`   Reduction: ${recommendations.archive.length + recommendations.consolidate.length} products → ${recommendations.consolidate.length} products`);
  console.log('='.repeat(80));
}

/**
 * Main execution
 */
async function main() {
  try {
    const { scoredProducts } = await analyzeProducts();
    const recommendations = generateRecommendations(scoredProducts);
    
    displayRecommendations(recommendations);

    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN MODE - No changes made');
      console.log('   Run with --no-dry-run to execute consolidation\n');
      return;
    }

    // TODO: Implement actual consolidation
    // This would:
    // 1. Add missing prices to kept products
    // 2. Archive duplicate products
    // 3. Update product descriptions if needed

    console.log('\n⚠️  Actual consolidation not yet implemented.');
    console.log('   Use the recommendations above to manually consolidate products.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.body) {
      console.error('Details:', error.body);
    }
    process.exit(1);
  }
}

main();





