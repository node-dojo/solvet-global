const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const validateCmd = new Command('validate');

validateCmd
  .command('all')
  .description('Validate all products')
  .action(async () => {
    console.log(chalk.cyan('\n🔍 Validating all products...\n'));

    const libraryPath = path.join(process.cwd(), 'no3d-tools-library');
    if (!fs.existsSync(libraryPath)) {
      console.error(chalk.red('❌ no3d-tools-library directory not found\n'));
      process.exit(1);
    }

    const folders = fs.readdirSync(libraryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Dojo'))
      .map(dirent => dirent.name);

    let valid = 0;
    let invalid = 0;

    folders.forEach(folder => {
      const productPath = path.join(libraryPath, folder);
      const jsonPath = path.join(productPath, `${folder}.json`);
      const iconPath = path.join(productPath, `icon_${folder}.png`);
      const blendPath = path.join(productPath, `${folder}.blend`);

      const hasJson = fs.existsSync(jsonPath);
      const hasIcon = fs.existsSync(iconPath);
      const hasBlend = fs.existsSync(blendPath);

      if (hasJson && hasIcon && hasBlend) {
        valid++;
        console.log(chalk.green(`  ✓ ${folder}`));
      } else {
        invalid++;
        console.log(chalk.red(`  ✗ ${folder}`));
        if (!hasJson) console.log(chalk.yellow(`     Missing: ${folder}.json`));
        if (!hasIcon) console.log(chalk.yellow(`     Missing: icon_${folder}.png`));
        if (!hasBlend) console.log(chalk.yellow(`     Missing: ${folder}.blend`));
      }
    });

    console.log(chalk.bold(`\n📊 Results: ${chalk.green(valid)} valid, ${chalk.red(invalid)} invalid\n`));
  });

validateCmd
  .command('metadata')
  .description('Validate all JSON metadata files')
  .action(async () => {
    console.log(chalk.cyan('\n🔍 Validating metadata files...\n'));
    console.log(chalk.yellow('💡 This feature will validate all JSON files\n'));
  });

module.exports = validateCmd;

