const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const infoCmd = new Command('info');

infoCmd
  .command('products')
  .description('Product statistics')
  .action(async () => {
    console.log(chalk.cyan('\n📊 Product Statistics\n'));

    const libraryPath = path.join(process.cwd(), 'no3d-tools-library');
    if (!fs.existsSync(libraryPath)) {
      console.error(chalk.red('❌ no3d-tools-library directory not found\n'));
      process.exit(1);
    }

    const folders = fs.readdirSync(libraryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Dojo'))
      .map(dirent => dirent.name);

    console.log(chalk.bold(`Total Products: ${folders.length}\n`));
  });

infoCmd
  .command('repos')
  .description('Repository information')
  .action(async () => {
    console.log(chalk.cyan('\n📦 Repository Information\n'));

    const repos = ['solvet-system', 'no3d-tools-library', 'no3d-tools-website', 'no3d-tools-addon'];
    const basePath = process.cwd();

    repos.forEach(repo => {
      const repoPath = path.join(basePath, repo);
      const exists = fs.existsSync(repoPath);
      const status = exists ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${status} ${repo}`);
    });
    console.log();
  });

infoCmd
  .action(async () => {
    console.log(chalk.cyan('\nℹ️  SOLVET System Information\n'));
    console.log(chalk.bold('Version:') + ' 1.0.0-beta');
    console.log(chalk.bold('Status:') + ' Beta');
    console.log();
    console.log(chalk.yellow('Run "solve info products" for product statistics'));
    console.log(chalk.yellow('Run "solve info repos" for repository information\n'));
  });

module.exports = infoCmd;

