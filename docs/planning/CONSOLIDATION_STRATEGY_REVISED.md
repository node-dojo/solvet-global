# Revised Consolidation Strategy

## Important Discovery

**Polar API Limitation**: Polar only allows **ONE static price per product**. You cannot have both FREE and paid prices on the same product.

This means we need to revise our consolidation approach.

## New Strategy

Since we can't merge FREE and paid into one product, we'll:

1. **Keep the best variant** of each product (with icon, good description)
2. **Choose the price model** (FREE or paid) based on business needs
3. **Consolidate duplicate variants** of the same price type
4. **Archive all other duplicates**

## Revised Consolidation Plan

### Option A: Keep Paid Versions (Recommended for Revenue)

For each product, keep the paid version with the best completeness score:

1. **Dojo Bolt Gen v05**: Keep `2fbe03f5-f6bc-4d53-a309-1b9aa7fa010c` ($5.55, has icon, good description)
   - Archive: 3 FREE variants

2. **Dojo Bolt Gen v05_Obj**: Keep `eb28f590-e6eb-463a-830d-95243e51de89` ($7.77, has icon, good description)
   - Archive: 4 FREE/$4.44 variants

3. **Dojo Bool v5**: Keep `9e9925e7-788f-4ca1-81ec-9c1b5ae61e43` (FREE, has icon, best description)
   - Archive: 3 FREE variants + 1 $4.44 variant
   - **Note**: This one is FREE but has the best description

4. **Dojo Calipers**: Keep `2092d69f-a243-468c-b1ca-48f7cea19e68` (FREE, has icon)
   - Archive: 3 FREE variants + 1 $4.44 variant

5. **Dojo Crv Wrapper v4**: Keep `ee82acc9-63a8-4b79-a7bd-a06ec8722391` ($4.44)
   - Archive: 2 FREE variants

6. **Dojo Gluefinity Grid_obj**: Keep `b3c265a8-272d-41b7-930d-529538b41f8a` (FREE, has icon)
   - Archive: 1 $4.44 variant + 2 FREE variants

7. **Dojo Knob**: Keep `c17384fb-dee6-4d86-891c-ed02bbb2e5d7` (FREE, has icon)
   - Archive: 1 $4.44 variant + 3 FREE variants

8. **Dojo Knob_obj**: Keep `53bbe0f8-7f9f-4d40-8387-473355277ece` (FREE, has icon)
   - Archive: 1 $4.44 variant + 3 FREE variants

9. **Dojo Mesh Repair**: Keep `714ffbe4-b381-4884-a1da-7c2e8f8b2a91` (FREE, has icon)
   - Archive: 1 $4.44 variant + 3 FREE variants

10. **Dojo Print Viz_V4.5**: Keep `c668211b-f0ac-4b54-82ac-5f97c8f4adcc` (FREE, has icon)
    - Archive: 1 $4.44 variant + 2 FREE variants

11. **Dojo_Squircle v4.5**: Keep `fec65858-a3d7-47dc-987c-487a239ea94c` (FREE, has icon)
    - Archive: 1 $4.44 variant + 2 FREE variants

12. **Dojo Squircle v4.5_obj**: Keep `67c6c182-8a09-4687-914e-2fbb01eff5dc` (FREE, has icon)
    - Archive: 1 $4.44 variant + 1 FREE variant

13. **NO3D Membership**: Keep as-is (recurring subscription)

14. **Print Bed Preview_obj**: Keep one variant (choose most recent)

15. **Test Product**: Delete `9c25f1a0-8484-403c-ae27-a6d7ab44a089`

### Option B: Keep FREE Versions (For User Acquisition)

If you want to prioritize user acquisition over revenue, keep the FREE versions with icons instead.

## Implementation Steps

### Step 1: Archive Duplicates

Archive all duplicate variants using Polar MCP:

```json
{
  "server": "user-Polar",
  "toolName": "polar_products_update",
  "arguments": {
    "pathParameters": {
      "id": "<duplicate-product-id>"
    },
    "body": {
      "isArchived": true
    }
  }
}
```

### Step 2: Update Prices (Optional)

If you want to change prices on kept products:

```json
{
  "server": "user-Polar",
  "toolName": "polar_products_update",
  "arguments": {
    "pathParameters": {
      "id": "<product-id>"
    },
    "body": {
      "prices": [
        {
          "amount_type": "fixed",
          "price_amount": 444,
          "price_currency": "usd"
        }
      ]
    }
  }
}
```

### Step 3: Verify

After archiving, verify you have 15 active products.

## Products to Archive (42 total)

See `PRODUCT_CONSOLIDATION_PLAN.md` for the complete list organized by product name.

## Decision Needed

**Which price model do you want to keep?**

1. **Paid versions** (recommended for revenue) - Keep products with $4.44-$7.77 prices
2. **FREE versions** (for user acquisition) - Keep products with FREE prices
3. **Mixed** - Keep the best variant regardless of price (current recommendation)

The current plan keeps the **best variant** (highest completeness score) regardless of price, which results in a mix of FREE and paid products.

## Next Steps

1. Review the consolidation plan
2. Decide on price model preference
3. Archive duplicates using the MCP tool
4. Contact Polar support to permanently delete archived products

