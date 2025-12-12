#!/usr/bin/env node

/**
 * Fetch products from Polar and run consolidation analysis
 * This script uses the Polar SDK directly to fetch and analyze products
 */

import { Polar } from '@polar-sh/sdk';
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
  console.error('\nUsage: POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/run-product-analysis.js');
  process.exit(1);
}

logTokenInfo('POLAR_API_TOKEN', POLAR_API_TOKEN);

const polar = new Polar({
  accessToken: POLAR_API_TOKEN,
});

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

  // Has good description (15 points for detailed, 5 for basic)
  const desc = product.description || '';
  if (desc.length > 50 && !desc.startsWith('Blender asset:')) {
    score += 15;
    reasons.push('good description');
  } else if (desc.length > 20) {
    score += 5;
    reasons.push('basic description');
  }

  // Has paid price (10 points)
  const prices = product.prices || [];
  const hasPaid = prices.some(p => 
    !p.is_archived && p.amount_type === 'fixed' && p.price_amount > 0
  );
  if (hasPaid) {
    score += 10;
    reasons.push('has paid price');
  }

  // Has FREE price (5 points)
  const hasFree = prices.some(p => 
    !p.is_archived && p.amount_type === 'free'
  );
  if (hasFree) {
    score += 5;
    reasons.push('has free price');
  }

  // Has benefits/files (10 points)
  if (product.benefits && product.benefits.length > 0) {
    score += 10;
    reasons.push('has benefits');
  }

  // Recently modified (5 points)
  const modifiedAt = product.modified_at || product.created_at;
  if (modifiedAt) {
    const modDate = new Date(modifiedAt);
    const daysAgo = (Date.now() - modDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo < 30) {
      score += 5;
      reasons.push('recently updated');
    }
  }

  // Has metadata (5 points)
  if (product.metadata && Object.keys(product.metadata).length > 0) {
    score += 5;
    reasons.push('has metadata');
  }

  return { score, reasons };
}

function formatPrice(price) {
  if (!price) return 'No price';
  if (price.amount_type === 'free') return 'FREE';
  if (price.amount_type === 'fixed') {
    return `$${(price.price_amount / 100).toFixed(2)} ${(price.price_currency || 'USD').toUpperCase()}`;
  }
  return price.amount_type;
}

async function main() {
  try {
    console.log('📡 Fetching products from Polar...\n');

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

    // Score each product
    const scoredGroups = {};
    Object.entries(groups).forEach(([name, variants]) => {
      scoredGroups[name] = variants.map(product => ({
        product,
        ...scoreProduct(product),
      })).sort((a, b) => b.score - a.score);
    });

    // Generate recommendations
    const recommendations = {
      keep: [],
      consolidate: [],
      archive: [],
    };

    Object.entries(scoredGroups).forEach(([name, scoredVariants]) => {
      if (scoredVariants.length === 1) {
        const sv = scoredVariants[0];
        const price = sv.product.prices?.[0];
        recommendations.keep.push({
          name,
          product: sv.product,
          score: sv.score,
          reasons: sv.reasons,
          price: formatPrice(price),
        });
      } else {
        const best = scoredVariants[0];
        const others = scoredVariants.slice(1);

        // Collect all unique prices
        const allPrices = new Set();
        scoredVariants.forEach(sv => {
          sv.product.prices?.forEach(p => {
            if (!p.is_archived) {
              allPrices.add(formatPrice(p));
            }
          });
        });

        const hasFree = Array.from(allPrices).some(p => p === 'FREE');
        const hasPaid = Array.from(allPrices).some(p => p.startsWith('$'));

        if (hasFree && hasPaid) {
          // Need consolidation
          const currentPrices = best.product.prices
            ?.filter(p => !p.is_archived)
            .map(p => formatPrice(p)) || [];
          
          recommendations.consolidate.push({
            name,
            keep: best.product,
            keepScore: best.score,
            keepReasons: best.reasons,
            archive: others.map(sv => sv.product),
            allPrices: Array.from(allPrices).sort(),
            currentPrices,
          });
        } else {
          // Same price type - just keep best
          recommendations.keep.push({
            name,
            product: best.product,
            score: best.score,
            reasons: best.reasons,
            price: formatPrice(best.product.prices?.[0]),
          });
          recommendations.archive.push(...others.map(sv => sv.product));
        }
      }
    });

    // Display recommendations
    console.log('='.repeat(100));
    console.log('PRODUCT CONSOLIDATION RECOMMENDATIONS'.padStart(60));
    console.log('='.repeat(100));
    console.log();

    if (recommendations.keep.length > 0) {
      console.log(`✅ KEEP AS-IS (${recommendations.keep.length} products):`);
      recommendations.keep
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(item => {
          console.log(`   • ${item.name.padEnd(45)} Score: ${String(item.score).padStart(3)} | ${item.price.padEnd(20)} | ${item.reasons.join(', ')}`);
        });
      console.log();
    }

    if (recommendations.consolidate.length > 0) {
      console.log(`🔄 CONSOLIDATE (${recommendations.consolidate.length} products):`);
      console.log('   (Keep best variant, add missing prices, archive others)');
      console.log();
      recommendations.consolidate
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(item => {
          console.log(`   📦 ${item.name}:`);
          console.log(`      ✅ KEEP: ${item.keep.id.substring(0, 8)}... (Score: ${item.keepScore})`);
          console.log(`         Reasons: ${item.keepReasons.join(', ')}`);
          console.log(`         Current prices: ${item.currentPrices.join(', ') || 'none'}`);
          const missingPrices = item.allPrices.filter(p => !item.currentPrices.includes(p));
          if (missingPrices.length > 0) {
            console.log(`         ⚠️  ADD MISSING PRICES: ${missingPrices.join(', ')}`);
          }
          console.log(`      🗑️  ARCHIVE (${item.archive.length} variants):`);
          item.archive.forEach(p => {
            const price = formatPrice(p.prices?.[0]);
            console.log(`         • ${p.id.substring(0, 8)}... | ${price}`);
          });
          console.log();
        });
    }

    if (recommendations.archive.length > 0) {
      console.log(`🗑️  ARCHIVE DUPLICATES (${recommendations.archive.length} products):`);
      recommendations.archive
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(product => {
          const price = formatPrice(product.prices?.[0]);
          console.log(`   • ${product.name.padEnd(45)} | ${price}`);
        });
      console.log();
    }

    // Summary
    console.log('='.repeat(100));
    console.log('SUMMARY:');
    console.log(`   Products to keep: ${recommendations.keep.length}`);
    console.log(`   Products to consolidate: ${recommendations.consolidate.length}`);
    console.log(`   Products to archive: ${recommendations.archive.length}`);
    const totalActive = recommendations.keep.length + recommendations.consolidate.length;
    const reduction = recommendations.archive.length + recommendations.consolidate.length;
    console.log(`   Total active products after consolidation: ${totalActive}`);
    console.log(`   Reduction: ${reduction} products → ${recommendations.consolidate.length} products`);
    console.log('='.repeat(100));
    console.log();

    // Export recommendations as JSON for further processing
    const exportData = {
      summary: {
        keep: recommendations.keep.length,
        consolidate: recommendations.consolidate.length,
        archive: recommendations.archive.length,
        totalActive: totalActive,
      },
      keep: recommendations.keep.map(item => ({
        name: item.name,
        id: item.product.id,
        score: item.score,
        price: item.price,
      })),
      consolidate: recommendations.consolidate.map(item => ({
        name: item.name,
        keepId: item.keep.id,
        keepScore: item.keepScore,
        currentPrices: item.currentPrices,
        missingPrices: item.allPrices.filter(p => !item.currentPrices.includes(p)),
        archiveIds: item.archive.map(p => p.id),
      })),
      archive: recommendations.archive.map(p => ({
        name: p.name,
        id: p.id,
        price: formatPrice(p.prices?.[0]),
      })),
    };

    const fs = await import('fs');
    fs.writeFileSync(
      'product-consolidation-recommendations.json',
      JSON.stringify(exportData, null, 2)
    );
    console.log('💾 Recommendations saved to: product-consolidation-recommendations.json');
    console.log();

    console.log('💡 NEXT STEPS:');
    console.log('   1. Review the recommendations above');
    console.log('   2. For products marked "CONSOLIDATE":');
    console.log('      - Keep the recommended product ID');
    console.log('      - Add missing prices to that product');
    console.log('      - Archive the duplicate variants');
    console.log('   3. Archive all products in the "ARCHIVE DUPLICATES" section');
    console.log('   4. Contact Polar support to permanently delete archived products if needed');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.body) {
      console.error('Details:', error.body);
    }
    process.exit(1);
  }
}

main();



