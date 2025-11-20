const { Command } = require('commander');
const chalk = require('chalk');

const priceCmd = new Command('price');

priceCmd
  .command('list')
  .description('List all product prices')
  .action(async () => {
    console.log(chalk.cyan('\n💰 Product Prices\n'));
    console.log(chalk.yellow('💡 Use: solve price sync to get latest prices from Polar\n'));
  });

priceCmd
  .command('sync')
  .description('Sync prices from Polar API')
  .action(async () => {
    console.log(chalk.cyan('\n🔄 Syncing prices from Polar API...\n'));
    console.log(chalk.yellow('💡 This feature will fetch prices from Polar API\n'));
  });

priceCmd
  .command('update <product> <amount>')
  .description('Update product price')
  .action(async (product, amount) => {
    console.log(chalk.cyan(`\n💰 Updating price for ${product} to $${amount}\n`));
    console.log(chalk.yellow('💡 This feature will update the product JSON file\n'));
  });

module.exports = priceCmd;

