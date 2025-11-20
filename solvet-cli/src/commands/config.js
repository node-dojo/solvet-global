const { Command } = require('commander');
const chalk = require('chalk');

const configCmd = new Command('config');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(async () => {
    console.log(chalk.cyan('\n⚙️  Configuration\n'));
    console.log(chalk.yellow('💡 Configuration will be stored in ~/.solvet/config.json\n'));
  });

configCmd
  .command('init')
  .description('Initialize SOLVET configuration')
  .action(async () => {
    console.log(chalk.cyan('\n⚙️  Initializing configuration...\n'));
    console.log(chalk.yellow('💡 This will create ~/.solvet/config.json\n'));
  });

module.exports = configCmd;

