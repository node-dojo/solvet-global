# Product Consolidation Strategy

## Problem

You have **57 active products** but only **15 unique product names**, meaning there are **42 duplicate products**. Archiving doesn't work as expected.

## Root Causes

1. **No duplicate prevention** - Products created without checking for existing ones
2. **Separate products for price variants** - FREE and paid versions created as separate products instead of price variants
3. **Test products not cleaned up**
4. **Manual creation during development** - Multiple products created during testing

## Alternative Approaches

### Approach 1: Smart Selection + Price Consolidation (Recommended)

**Strategy**: Keep the "best" variant of each product (based on completeness score) and add missing prices to it.

**Steps**:
1. Score each product variant based on:
   - Has icon/media (20 pts)
   - Good description (15 pts)
   - Has paid price (10 pts)
   - Has FREE price (5 pts)
   - Has benefits/files (10 pts)
   - Recently updated (5 pts)
   - Has metadata (5 pts)

2. For each product name:
   - Keep the highest-scoring variant
   - Add missing prices (FREE or paid) to the kept product
   - Archive all other variants

3. Benefits:
   - Reduces 57 products → ~15 products
   - Each product has both FREE and paid options
   - Keeps the most complete version

**Script**: `scripts/analyze-product-duplicates.py` (analyzes and recommends)
**Script**: `scripts/smart-consolidate-products.js` (can execute consolidation)

### Approach 2: Contact Polar Support for Deletion

Since Polar API doesn't support true deletion:

1. **Archive products first** (via API)
2. **Contact Polar support** to permanently delete archived products
3. **Provide them with**:
   - List of product IDs to delete
   - Reason: "Duplicate products from development/testing"
   - Confirmation that no active subscriptions use these products

**Email template**:
```
Subject: Request to Delete Archived Duplicate Products

Hi Polar Support,

I have 42 archived duplicate products in my catalog that I'd like to permanently delete.

These are duplicate products created during development/testing. They are all archived and have no active subscriptions.

Product IDs to delete:
[list of IDs]

Organization ID: f0c16049-5959-42c9-8be8-5952c38c7d63

Please confirm when these have been deleted.

Thanks!
```

### Approach 3: Manual Cleanup Strategy

1. **Identify canonical products**:
   - Products with icons
   - Products with good descriptions
   - Products with checkout links
   - Products that are actually being used

2. **For each product name**:
   - Keep ONE variant (the canonical one)
   - Archive all others
   - If kept product is missing prices, add them

3. **Use Polar dashboard** to:
   - Manually archive duplicates
   - Add prices to products
   - Verify consolidation

### Approach 4: Prevention Strategy

**Going forward**, prevent duplicates by:

1. **Check before creating**:
   ```javascript
   // Before creating a product, check if it exists
   const existing = await polar.products.list({
     organizationId: POLAR_ORG_ID,
     query: productName,
     limit: 10
   });
   
   if (existing.result.items.some(p => p.name === productName)) {
     // Update existing product instead of creating new one
     await polar.products.update({...});
   } else {
     // Create new product
     await polar.products.create({...});
   }
   ```

2. **Use SKU/metadata** to track products:
   - Add `sku` to product metadata
   - Check for existing SKU before creating

3. **Consolidate prices** instead of creating separate products:
   - One product with multiple price options (FREE + paid)
   - Use Polar's price variants feature

## Recommended Action Plan

### Phase 1: Analysis (Now)
1. Run `scripts/analyze-product-duplicates.py` to get recommendations
2. Review which products should be kept
3. Identify which prices need to be added

### Phase 2: Consolidation (Next)
1. For each product group:
   - Keep the highest-scoring variant
   - Add missing prices to kept product using `polar.products.update_benefits` or price update
   - Archive other variants

2. Test that kept products work correctly with all prices

### Phase 3: Cleanup (After consolidation)
1. Contact Polar support to delete archived products
2. Verify catalog is clean

### Phase 4: Prevention (Ongoing)
1. Update product creation scripts to check for duplicates
2. Use SKU/metadata for tracking
3. Implement update logic instead of always creating new products

## Quick Win: Immediate Actions

1. **Archive test products**:
   - "Test Product - Dojo Bool v5"
   - Any products with "test" in name

2. **Archive products without icons** (if you have a canonical version with icon)

3. **Archive products with minimal descriptions** (if you have better versions)

4. **Consolidate obvious duplicates**:
   - Keep the one with icon + good description
   - Archive others

## Tools Available

- `scripts/delete-polar-duplicates.js` - Archive duplicates (if archiving works)
- `scripts/analyze-product-duplicates.py` - Analyze and recommend
- `scripts/smart-consolidate-products.js` - Smart consolidation (needs completion)
- Polar MCP tools - Direct API access

## Next Steps

1. **Run analysis**: Get recommendations on which products to keep
2. **Choose strategy**: Smart selection + price consolidation (recommended)
3. **Execute consolidation**: Keep best variants, add prices, archive duplicates
4. **Contact Polar support**: Request permanent deletion of archived products
5. **Implement prevention**: Update scripts to prevent future duplicates



