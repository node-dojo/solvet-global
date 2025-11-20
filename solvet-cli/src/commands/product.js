const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const productCmd = new Command('product');

// List products
productCmd
  .command('list')
  .description('List all products')
  .action(async () => {
    console.log(chalk.cyan('\n📦 Loading products...\n'));
    
    const libraryPath = path.join(process.cwd(), 'no3d-tools-library');
    if (!fs.existsSync(libraryPath)) {
      console.error(chalk.red('❌ no3d-tools-library directory not found'));
      console.log(chalk.yellow('💡 Make sure you\'re in the SOLVET System V1 directory\n'));
      process.exit(1);
    }

    try {
      const folders = fs.readdirSync(libraryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Dojo'))
        .map(dirent => dirent.name)
        .sort();

      if (folders.length === 0) {
        console.log(chalk.yellow('⚠️  No products found\n'));
        return;
      }

      console.log(chalk.bold(`Found ${folders.length} products:\n`));
      folders.forEach((folder, index) => {
        const jsonPath = path.join(libraryPath, folder, `${folder}.json`);
        const hasJson = fs.existsSync(jsonPath);
        const iconPath = path.join(libraryPath, folder, `icon_${folder}.png`);
        const hasIcon = fs.existsSync(iconPath);
        const blendPath = path.join(libraryPath, folder, `${folder}.blend`);
        const hasBlend = fs.existsSync(blendPath);

        const status = [
          hasJson ? chalk.green('✓') : chalk.red('✗'),
          hasIcon ? chalk.green('✓') : chalk.red('✗'),
          hasBlend ? chalk.green('✓') : chalk.red('✗')
        ].join(' ');

        console.log(`  ${index + 1}. ${chalk.bold(folder)}`);
        console.log(`     ${status} (JSON | Icon | Blend)\n`);
      });
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Create product
productCmd
  .command('create <name>')
  .description('Create a new product with template files')
  .option('-t, --template', 'Use template from solvet-system')
  .action(async (name, options) => {
    console.log(chalk.cyan(`\n✨ Creating product: ${chalk.bold(name)}\n`));

    const libraryPath = path.join(process.cwd(), 'no3d-tools-library');
    const productPath = path.join(libraryPath, name);

    if (fs.existsSync(productPath)) {
      console.error(chalk.red(`❌ Product "${name}" already exists\n`));
      process.exit(1);
    }

    try {
      // Create directory
      fs.mkdirSync(productPath, { recursive: true });
      console.log(chalk.green(`✓ Created directory: ${productPath}`));

      // Create template JSON
      const templatePath = path.join(process.cwd(), 'solvet-system/templates/product-metadata-template.json');
      const jsonPath = path.join(productPath, `${name}.json`);

      if (options.template && fs.existsSync(templatePath)) {
        const template = fs.readJsonSync(templatePath);
        template.title = name;
        template.handle = name.toLowerCase().replace(/\s+/g, '-');
        fs.writeJsonSync(jsonPath, template, { spaces: 2 });
        console.log(chalk.green(`✓ Created metadata template: ${jsonPath}`));
      } else {
        // Create basic JSON
        const basicJson = {
          title: name,
          handle: name.toLowerCase().replace(/\s+/g, '-'),
          description: "",
          tags: [],
          status: "active",
          variants: [{
            price: "0.00",
            sku: `NO3D-${name.toUpperCase().replace(/\s+/g, '-')}`
          }]
        };
        fs.writeJsonSync(jsonPath, basicJson, { spaces: 2 });
        console.log(chalk.green(`✓ Created metadata file: ${jsonPath}`));
      }

      console.log(chalk.yellow(`\n⚠️  Don't forget to:`));
      console.log(chalk.yellow(`   1. Add ${name}.blend file`));
      console.log(chalk.yellow(`   2. Add icon_${name}.png (512x512)`));
      console.log(chalk.yellow(`   3. Update ${name}.json with product details\n`));
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Validate product
productCmd
  .command('validate <name>')
  .description('Validate product files and metadata')
  .action(async (name) => {
    console.log(chalk.cyan(`\n🔍 Validating product: ${chalk.bold(name)}\n`));

    const libraryPath = path.join(process.cwd(), 'no3d-tools-library');
    const productPath = path.join(libraryPath, name);

    if (!fs.existsSync(productPath)) {
      console.error(chalk.red(`❌ Product "${name}" not found\n`));
      process.exit(1);
    }

    const errors = [];
    const warnings = [];

    // Check required files
    const jsonPath = path.join(productPath, `${name}.json`);
    const iconPath = path.join(productPath, `icon_${name}.png`);
    const blendPath = path.join(productPath, `${name}.blend`);

    if (!fs.existsSync(jsonPath)) {
      errors.push(`Missing: ${name}.json`);
    } else {
      try {
        const json = fs.readJsonSync(jsonPath);
        if (!json.title) warnings.push('JSON missing title');
        if (!json.handle) warnings.push('JSON missing handle');
        if (!json.variants || json.variants.length === 0) warnings.push('JSON missing variants');
      } catch (e) {
        errors.push(`Invalid JSON: ${e.message}`);
      }
    }

    if (!fs.existsSync(iconPath)) {
      errors.push(`Missing: icon_${name}.png`);
    }

    if (!fs.existsSync(blendPath)) {
      errors.push(`Missing: ${name}.blend`);
    }

    // Report results
    if (errors.length === 0 && warnings.length === 0) {
      console.log(chalk.green('✅ Product validation passed!\n'));
    } else {
      if (errors.length > 0) {
        console.log(chalk.red('❌ Errors:'));
        errors.forEach(err => console.log(chalk.red(`   • ${err}`)));
        console.log();
      }
      if (warnings.length > 0) {
        console.log(chalk.yellow('⚠️  Warnings:'));
        warnings.forEach(warn => console.log(chalk.yellow(`   • ${warn}`)));
        console.log();
      }
    }
  });

// Product info
productCmd
  .command('info <name>')
  .description('Show detailed product information')
  .action(async (name) => {
    const libraryPath = path.join(process.cwd(), 'no3d-tools-library');
    const productPath = path.join(libraryPath, name);
    const jsonPath = path.join(productPath, `${name}.json`);

    if (!fs.existsSync(productPath)) {
      console.error(chalk.red(`❌ Product "${name}" not found\n`));
      process.exit(1);
    }

    console.log(chalk.cyan(`\n📦 Product: ${chalk.bold(name)}\n`));

    if (fs.existsSync(jsonPath)) {
      try {
        const json = fs.readJsonSync(jsonPath);
        console.log(chalk.bold('Metadata:'));
        console.log(`  Title: ${json.title || 'N/A'}`);
        console.log(`  Handle: ${json.handle || 'N/A'}`);
        console.log(`  Description: ${json.description ? json.description.substring(0, 100) + '...' : 'N/A'}`);
        if (json.variants && json.variants[0]) {
          console.log(`  Price: $${json.variants[0].price || '0.00'}`);
        }
        console.log();
      } catch (e) {
        console.log(chalk.yellow('⚠️  Could not read metadata\n'));
      }
    }

    // File status
    console.log(chalk.bold('Files:'));
    const files = [
      { name: `${name}.json`, path: jsonPath },
      { name: `icon_${name}.png`, path: path.join(productPath, `icon_${name}.png`) },
      { name: `${name}.blend`, path: path.join(productPath, `${name}.blend`) }
    ];

    files.forEach(file => {
      const exists = fs.existsSync(file.path);
      const status = exists ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${status} ${file.name}`);
    });
    console.log();
  });

module.exports = productCmd;

