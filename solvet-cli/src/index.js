#!/usr/bin/env node

/**
 * SOLVET CLI - Main Entry Point
 * Streamline your digital product workflow
 */

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

// Import command modules
const productCommands = require('./commands/product');
const syncCommands = require('./commands/sync');
const priceCommands = require('./commands/price');
const repoCommands = require('./commands/repo');
const validateCommands = require('./commands/validate');
const configCommands = require('./commands/config');
const infoCommands = require('./commands/info');

// Load banner
function showBanner() {
  const bannerPath = path.join(__dirname, '../../solvet-banner.txt');
  if (fs.existsSync(bannerPath)) {
    console.log(fs.readFileSync(bannerPath, 'utf8'));
  } else {
    console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║          SOLVE - BETA VERSION         ║'));
    console.log(chalk.bold.cyan('╚═══════════════════════════════════════╝\n'));
  }
}

// Initialize CLI
const program = new Command();

program
  .name('solve')
  .description('SOLVET System CLI - Streamline your digital product workflow')
  .version('1.0.0-beta');

// Banner disabled for now
// program.hook('preAction', (thisCommand, actionCommand) => {
//   if (actionCommand.name() === 'help' || process.argv.length === 2) {
//     showBanner();
//   }
// });

// Product commands
program.addCommand(productCommands);

// Sync commands
program.addCommand(syncCommands);

// Price commands
program.addCommand(priceCommands);

// Repo commands
program.addCommand(repoCommands);

// Validate commands
program.addCommand(validateCommands);

// Config commands
program.addCommand(configCommands);

// Info commands
program.addCommand(infoCommands);

// Help command (custom)
program
  .command('help')
  .description('Show help information')
  .action(() => {
    // showBanner(); // Banner disabled
    program.help();
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`\nUnknown command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('Run "solve help" to see available commands.\n'));
  process.exit(1);
});

// Parse arguments
program.parse();

// If no command provided, show help
if (process.argv.length === 2) {
  // showBanner(); // Banner disabled
  program.help();
}

