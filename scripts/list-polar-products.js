#!/usr/bin/env node

/**
 * Script to list all active products from Polar
 * This script formats the output in a readable table format
 */

const products = [
  // We'll populate this from the API call
];

function formatProducts(products) {
  console.log('\n📦 Active Products in Polar\n');
  console.log('='.repeat(100));
  console.log(
    'Name'.padEnd(40) +
    'Price'.padEnd(15) +
    'Type'.padEnd(15) +
    'ID'.padEnd(40)
  );
  console.log('='.repeat(100));

  products.forEach((product) => {
    const price = product.prices && product.prices.length > 0
      ? product.prices[0].amount_type === 'free'
        ? 'FREE'
        : product.prices[0].amount_type === 'fixed'
        ? `$${product.prices[0].price_amount / 100} ${product.prices[0].price_currency?.toUpperCase() || ''}`
        : product.prices[0].amount_type
      : 'No price';
    
    const type = product.is_recurring ? 'Recurring' : 'One-time';
    const name = product.name || 'Unnamed';
    const id = product.id;

    console.log(
      name.substring(0, 38).padEnd(40) +
      price.padEnd(15) +
      type.padEnd(15) +
      id.substring(0, 38).padEnd(40)
    );
  });

  console.log('='.repeat(100));
  console.log(`\nTotal: ${products.length} active products\n`);
}

// This would normally fetch from the API
// For now, this is a template
if (require.main === module) {
  console.log('This script needs to be called with product data from the Polar MCP.');
  console.log('Use the Polar MCP tool to fetch products and pipe the results here.');
}

module.exports = { formatProducts };





