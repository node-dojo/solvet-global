#!/usr/bin/env node

/**
 * Sync Prices from Polar to GitHub and Local Metadata
 * 
 * This script:
 * 1. Fetches current prices from Polar API
 * 2. Updates local product JSON metadata files (variants[0].price)
 * 3. Optionally commits and pushes changes to GitHub
 * 
 * Usage:
 *   POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/sync/sync-prices-from-polar.js [--commit] [--push]
 * 
 * Options:
 *   --commit    Commit changes to git (default: false)
 *   --push      Push changes to GitHub (requires --commit, default: false)
 *   --dry-run   Show what would be updated without making changes
 */

const { Polar } = require('@polar-sh/sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldCommit = args.includes('--commit');
const shouldPush = args.includes('--push');
const dryRun = args.includes('--dry-run');

// Validate environment variables
const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const POLAR_ORG_ID = process.env.POLAR_ORG_ID || 'f0c16049-5959-42c9-8be8-5952c38c7d63';

if (!POLAR_API_TOKEN) {
  console.error('❌ Error: POLAR_API_TOKEN environment variable is required');
  console.error('\nUsage: POLAR_API_TOKEN=xxx POLAR_ORG_ID=xxx node scripts/sync/sync-prices-from-polar.js [--commit] [--push]');
  process.exit(1);
}

if (shouldPush && !shouldCommit) {
  console.error('❌ Error: --push requires --commit');
  process.exit(1);
}

// Initialize Polar SDK
const polar = new Polar({ accessToken: POLAR_API_TOKEN });

// Get library path (assumes script is run from solvet-global root)
const LIBRARY_PATH = path.join(__dirname, '..', '..', 'no3d-tools-library');

if (!fs.existsSync(LIBRARY_PATH)) {
  console.error(`❌ Error: Library directory not found: ${LIBRARY_PATH}`);
  console.error('   Make sure you\'re running from the solvet-global root directory');
  process.exit(1);
}

/**
 * Fetch prices from Polar API
 */
async function fetchPolarPrices() {
  console.log('🔄 Fetching prices from Polar API...\n');
  
  try {
    const result = await polar.products.list({
      organizationId: POLAR_ORG_ID,
      limit: 100
    });

    if (!result || !result.result) {
      throw new Error('Invalid response from Polar API');
    }

    const polarProducts = result.result.items || [];
    const prices = {};

    // Build price map by product ID
    for (const product of polarProducts) {
      if (product.isArchived) continue;

      // Get the first active price (usually the main price)
      const activePrice = product.prices?.find(p => !p.isArchived);
      if (activePrice) {
        let amount, currency, formatted;

        if (activePrice.amountType === 'free') {
          amount = 0;
          currency = 'USD';
          formatted = 'FREE';
        } else if (activePrice.priceAmount !== undefined && activePrice.priceAmount !== null) {
          // Convert from cents to dollars
          amount = activePrice.priceAmount / 100;
          currency = activePrice.priceCurrency || 'USD';
          formatted = `$${amount.toFixed(2)}`;
        } else {
          continue;
        }

        prices[product.id] = {
          productId: product.id,
          priceId: activePrice.id,
          amount: amount,
          currency: currency,
          formatted: formatted,
          priceString: amount === 0 ? '0.00' : amount.toFixed(2), // For JSON variants
          name: product.name
        };
      }
    }

    console.log(`✅ Fetched prices for ${Object.keys(prices).length} products from Polar\n`);
    return prices;
  } catch (error) {
    console.error('❌ Error fetching prices from Polar:', error.message);
    throw error;
  }
}

/**
 * Find all product directories
 */
function findProductDirs() {
  if (!fs.existsSync(LIBRARY_PATH)) {
    return [];
  }
  
  return fs.readdirSync(LIBRARY_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Dojo'))
    .map(dirent => dirent.name);
}

/**
 * Update product JSON file with price from Polar
 */
function updateProductPrice(productDir, polarPrices) {
  const productPath = path.join(LIBRARY_PATH, productDir);
  const jsonFiles = fs.readdirSync(productPath)
    .filter(f => f.endsWith('.json') && !f.includes('package'));
  
  if (jsonFiles.length === 0) {
    return { updated: false, reason: 'No JSON file found' };
  }

  // Use the main JSON file (usually matches directory name)
  const jsonFile = jsonFiles.find(f => f.includes(productDir)) || jsonFiles[0];
  const jsonPath = path.join(productPath, jsonFile);

  try {
    const content = fs.readFileSync(jsonPath, 'utf8');
    const productData = JSON.parse(content);

    // Get Polar product ID from metadata
    const polarProductId = productData.polar?.product_id;
    if (!polarProductId) {
      return { updated: false, reason: 'No polar.product_id found' };
    }

    // Get price from Polar
    const polarPrice = polarPrices[polarProductId];
    if (!polarPrice) {
      return { updated: false, reason: `No Polar price found for product ID: ${polarProductId}` };
    }

    // Check if variants exist
    if (!productData.variants || productData.variants.length === 0) {
      // Create variants array if it doesn't exist
      productData.variants = [{
        price: polarPrice.priceString,
        compare_at_price: null,
        inventory_management: null,
        inventory_policy: 'deny',
        fulfillment_service: 'manual',
        requires_shipping: false,
        taxable: false,
        barcode: null
      }];
    } else {
      // Update first variant price
      const oldPrice = productData.variants[0].price;
      if (oldPrice === polarPrice.priceString) {
        return { updated: false, reason: 'Price already up to date' };
      }
      productData.variants[0].price = polarPrice.priceString;
    }

    if (!dryRun) {
      // Write back to file
      fs.writeFileSync(jsonPath, JSON.stringify(productData, null, 2) + '\n', 'utf8');
    }

    return {
      updated: true,
      oldPrice: productData.variants[0].price || 'N/A',
      newPrice: polarPrice.formatted,
      priceString: polarPrice.priceString,
      filePath: jsonPath
    };
  } catch (error) {
    return { updated: false, reason: `Error: ${error.message}` };
  }
}

/**
 * Commit changes to git
 */
function commitChanges(updatedFiles) {
  if (updatedFiles.length === 0) {
    console.log('\n📝 No changes to commit');
    return false;
  }

  try {
    // Change to library directory
    process.chdir(LIBRARY_PATH);

    // Stage all JSON files
    execSync('git add *.json', { stdio: 'inherit' });
    execSync('git add Dojo*/*.json', { stdio: 'inherit' });

    // Create commit message
    const fileList = updatedFiles.map(f => path.basename(f)).join(', ');
    const commitMessage = `Sync prices from Polar\n\nUpdated ${updatedFiles.length} product(s): ${fileList}`;

    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log(`\n✅ Committed ${updatedFiles.length} file(s) to git`);
    return true;
  } catch (error) {
    console.error('❌ Error committing changes:', error.message);
    return false;
  }
}

/**
 * Push changes to GitHub
 */
function pushChanges() {
  try {
    process.chdir(LIBRARY_PATH);
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('\n✅ Pushed changes to GitHub');
    return true;
  } catch (error) {
    console.error('❌ Error pushing to GitHub:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('💰 Syncing prices from Polar to GitHub and local metadata\n');
  console.log('='.repeat(60));
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  if (shouldCommit) {
    console.log('📝 Will commit changes to git');
  }
  
  if (shouldPush) {
    console.log('🚀 Will push changes to GitHub');
  }
  
  console.log('='.repeat(60) + '\n');

  try {
    // Fetch prices from Polar
    const polarPrices = await fetchPolarPrices();

    // Find all product directories
    const productDirs = findProductDirs();
    console.log(`📦 Found ${productDirs.length} product directories\n`);

    if (productDirs.length === 0) {
      console.log('⚠️  No product directories found. Make sure products are in no3d-tools-library/Dojo*/');
      process.exit(0);
    }

    // Update each product
    let updatedCount = 0;
    let skippedCount = 0;
    const updatedFiles = [];

    for (const productDir of productDirs) {
      const result = updateProductPrice(productDir, polarPrices);
      
      if (result.updated) {
        updatedCount++;
        updatedFiles.push(result.filePath);
        console.log(`✅ ${productDir}`);
        console.log(`   Price: ${result.oldPrice} → ${result.newPrice}`);
      } else {
        skippedCount++;
        if (result.reason !== 'Price already up to date') {
          console.log(`⏭️  ${productDir}: ${result.reason}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total products: ${productDirs.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    if (dryRun) {
      console.log('\n🔍 DRY RUN - No files were actually modified');
      return;
    }

    // Commit and push if requested
    if (updatedFiles.length > 0) {
      if (shouldCommit) {
        const originalCwd = process.cwd();
        try {
          const committed = commitChanges(updatedFiles);
          if (committed && shouldPush) {
            pushChanges();
          }
        } finally {
          process.chdir(originalCwd);
        }
      } else {
        console.log('\n💡 Tip: Use --commit to commit changes, --push to push to GitHub');
      }
    } else {
      console.log('\n✨ All prices are already up to date!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fetchPolarPrices, updateProductPrice, findProductDirs };




