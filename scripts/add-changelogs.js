#!/usr/bin/env node

/**
 * Script to add changelog entries to all product JSON files
 * Uses export_date from metafields as the first upload date
 */

const fs = require('fs');
const path = require('path');

const LIBRARY_PATH = path.join(__dirname, '..', 'no3d-tools-library');

// Find all product directories
function findProductDirs() {
  const dirs = fs.readdirSync(LIBRARY_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Dojo'))
    .map(dirent => dirent.name);
  return dirs;
}

// Get export date from metafields
function getExportDate(productData) {
  if (productData.metafields) {
    const exportDateField = productData.metafields.find(
      mf => mf.key === 'export_date'
    );
    if (exportDateField && exportDateField.value) {
      return exportDateField.value;
    }
  }
  // Fallback to today's date if no export_date found
  return new Date().toISOString().split('T')[0];
}

// Add changelog to product JSON
function addChangelog(productDir) {
  const jsonFiles = fs.readdirSync(path.join(LIBRARY_PATH, productDir))
    .filter(f => f.endsWith('.json'));
  
  if (jsonFiles.length === 0) {
    console.log(`⚠️  No JSON file found in ${productDir}`);
    return false;
  }
  
  const jsonFile = jsonFiles[0];
  const jsonPath = path.join(LIBRARY_PATH, productDir, jsonFile);
  
  try {
    const content = fs.readFileSync(jsonPath, 'utf8');
    const productData = JSON.parse(content);
    
    // Skip if changelog already exists
    if (productData.changelog && Array.isArray(productData.changelog) && productData.changelog.length > 0) {
      console.log(`✓ ${productDir}: Changelog already exists`);
      return false;
    }
    
    // Get export date for first entry
    const exportDate = getExportDate(productData);
    const productTitle = productData.title || productDir;
    
    // Create initial changelog entry
    productData.changelog = [
      {
        version: "1.0.0",
        date: exportDate,
        changes: [
          `Initial release - ${productTitle} uploaded to website`
        ]
      }
    ];
    
    // Write back to file with proper formatting
    fs.writeFileSync(jsonPath, JSON.stringify(productData, null, 2) + '\n', 'utf8');
    console.log(`✓ ${productDir}: Added changelog with initial upload date ${exportDate}`);
    return true;
  } catch (error) {
    console.error(`✗ ${productDir}: Error - ${error.message}`);
    return false;
  }
}

// Main execution
function main() {
  console.log('📝 Adding changelogs to all products...\n');
  
  const productDirs = findProductDirs();
  console.log(`Found ${productDirs.length} product directories\n`);
  
  let added = 0;
  let skipped = 0;
  let errors = 0;
  
  productDirs.forEach(dir => {
    const result = addChangelog(dir);
    if (result === true) {
      added++;
    } else if (result === false && fs.existsSync(path.join(LIBRARY_PATH, dir))) {
      skipped++;
    } else {
      errors++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Added: ${added}`);
  console.log(`   Skipped (already exists): ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

if (require.main === module) {
  main();
}

module.exports = { addChangelog, getExportDate };

