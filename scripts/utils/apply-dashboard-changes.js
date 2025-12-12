#!/usr/bin/env node

/**
 * DEPRECATED: This script is deprecated in favor of the CO-AUG Dashboard's direct git integration.
 * 
 * The CO-AUG Dashboard now handles product updates directly through git operations,
 * eliminating the need for the export/import workflow that this script supported.
 * 
 * This script is kept for backward compatibility but is no longer the recommended workflow.
 * 
 * Recommended workflow:
 *   1. Use CO-AUG Dashboard to edit products
 *   2. Dashboard handles git commit and push directly
 *   3. No export/import step needed
 * 
 * Legacy usage (if still needed):
 *   1. Export changes from dashboard (downloads JSON file)
 *   2. Run: node scripts/apply-dashboard-changes.js path/to/exported-changes.json
 *   3. Review changes
 *   4. Commit and push to GitHub
 */

const fs = require('fs');
const path = require('path');

const LIBRARY_PATH = path.join(__dirname, '..', 'no3d-tools-library');

function applyChanges(exportFilePath) {
  // Read exported changes
  const exportData = JSON.parse(fs.readFileSync(exportFilePath, 'utf8'));
  
  console.log(`📦 Applying changes from: ${path.basename(exportFilePath)}`);
  console.log(`   Repository: ${exportData.repo || 'unknown'}`);
  console.log(`   Branch: ${exportData.branch || 'unknown'}`);
  console.log(`   Timestamp: ${exportData.timestamp || 'unknown'}`);
  console.log(`   Products: ${exportData.products.length}\n`);

  let applied = 0;
  let errors = 0;

  exportData.products.forEach((product, index) => {
    try {
      const filePath = path.join(LIBRARY_PATH, product.path);
      const dirPath = path.dirname(filePath);
      
      // Ensure directory exists
      if (!fs.existsSync(dirPath)) {
        console.log(`⚠️  Directory not found: ${dirPath}`);
        errors++;
        return;
      }

      // Backup original file
      if (fs.existsSync(filePath)) {
        const backupPath = filePath + '.backup';
        fs.copyFileSync(filePath, backupPath);
        console.log(`   📋 Backed up: ${product.filename}`);
      }

      // Write new content
      fs.writeFileSync(filePath, product.content + '\n', 'utf8');
      console.log(`   ✅ Applied: ${product.filename}`);
      applied++;
    } catch (error) {
      console.error(`   ❌ Error applying ${product.filename}: ${error.message}`);
      errors++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Applied: ${applied}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review changes: git diff`);
  console.log(`   2. Stage files: git add Dojo*/`);
  console.log(`   3. Commit: git commit -m "Update products from dashboard"`);
  console.log(`   4. Push: git push origin main`);
  console.log(`   5. GitHub Actions will auto-sync to website and Polar`);
}

// Main execution
if (require.main === module) {
  const exportFile = process.argv[2];
  
  if (!exportFile) {
    console.error('❌ Usage: node apply-dashboard-changes.js <exported-changes.json>');
    console.error('\n   Example:');
    console.error('   node scripts/apply-dashboard-changes.js ~/Downloads/product-changes-1234567890.json');
    process.exit(1);
  }

  if (!fs.existsSync(exportFile)) {
    console.error(`❌ File not found: ${exportFile}`);
    process.exit(1);
  }

  applyChanges(exportFile);
}

module.exports = { applyChanges };

