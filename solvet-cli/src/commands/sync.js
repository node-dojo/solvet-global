const { Command } = require('commander');
const chalk = require('chalk');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

const syncCmd = new Command('sync');

// Sync to Polar
syncCmd
  .command('polar [product]')
  .description('Sync products to Polar.sh')
  .option('-a, --all', 'Sync all products')
  .action(async (product, options) => {
    console.log(chalk.cyan('\n🔄 Syncing to Polar.sh...\n'));

    const libraryPath = path.join(process.cwd(), 'no3d-tools-library');
    if (!fs.existsSync(libraryPath)) {
      console.error(chalk.red('❌ no3d-tools-library directory not found\n'));
      process.exit(1);
    }

    const scriptPath = path.join(libraryPath, 'scripts', 'sync-to-polar.js');
    if (!fs.existsSync(scriptPath)) {
      console.error(chalk.red('❌ Sync script not found\n'));
      process.exit(1);
    }

    console.log(chalk.yellow('⚠️  This will trigger GitHub Actions workflow'));
    console.log(chalk.yellow('   Run: solve deploy trigger\n'));
  });

// Sync to website
syncCmd
  .command('website')
  .description('Sync images to website repository')
  .action(async () => {
    console.log(chalk.cyan('\n🖼️  Syncing images to website...\n'));
    console.log(chalk.yellow('⚠️  This will trigger GitHub Actions workflow'));
    console.log(chalk.yellow('   Run: solve deploy trigger\n'));
  });

// Sync all
syncCmd
  .command('all')
  .description('Sync to both Polar and website')
  .action(async () => {
    console.log(chalk.cyan('\n🚀 Syncing all products...\n'));
    console.log(chalk.yellow('⚠️  This will trigger GitHub Actions workflow'));
    console.log(chalk.yellow('   Run: solve deploy trigger\n'));
  });

// Sync status
syncCmd
  .command('status')
  .description('Check sync status and last sync time')
  .action(async () => {
    console.log(chalk.cyan('\n📊 Sync Status\n'));
    console.log(chalk.yellow('💡 Check GitHub Actions for sync status'));
    console.log(chalk.yellow('   https://github.com/node-dojo/no3d-tools-library/actions\n'));
  });

module.exports = syncCmd;

