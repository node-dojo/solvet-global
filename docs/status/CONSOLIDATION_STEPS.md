# Product Consolidation Steps

## Goal
Consolidate 57 products → 15 products by merging duplicates into single products with multiple price options.

## Strategy
1. **Keep** the best variant of each product (has icon, good description)
2. **Add missing prices** (FREE or paid) to kept products
3. **Archive** duplicate variants after consolidation

## Step-by-Step Process

### Step 1: Add Missing Prices to Kept Products

For each product below, use Polar MCP tool `polar_products_update` to add the missing price.

#### Products Needing FREE Price Added

**1. Dojo Bolt Gen v05** (`2fbe03f5-f6bc-4d53-a309-1b9aa7fa010c`)
- Current: $5.55 USD
- Add: FREE price
- MCP Command:
```json
{
  "server": "user-Polar",
  "toolName": "polar_products_update",
  "arguments": {
    "id": "2fbe03f5-f6bc-4d53-a309-1b9aa7fa010c",
    "productUpdate": {
      "prices": [
        {
          "amount_type": "fixed",
          "price_amount": 555,
          "price_currency": "usd"
        },
        {
          "amount_type": "free"
        }
      ]
    }
  }
}
```

**2. Dojo Bolt Gen v05_Obj** (`eb28f590-e6eb-463a-830d-95243e51de89`)
- Current: $7.77 USD
- Add: FREE price
- MCP Command:
```json
{
  "server": "user-Polar",
  "toolName": "polar_products_update",
  "arguments": {
    "id": "eb28f590-e6eb-463a-830d-95243e51de89",
    "productUpdate": {
      "prices": [
        {
          "amount_type": "fixed",
          "price_amount": 777,
          "price_currency": "usd"
        },
        {
          "amount_type": "free"
        }
      ]
    }
  }
}
```

**3. Dojo Crv Wrapper v4** (`ee82acc9-63a8-4b79-a7bd-a06ec8722391`)
- Current: $4.44 USD
- Add: FREE price
- MCP Command:
```json
{
  "server": "user-Polar",
  "toolName": "polar_products_update",
  "arguments": {
    "id": "ee82acc9-63a8-4b79-a7bd-a06ec8722391",
    "productUpdate": {
      "prices": [
        {
          "amount_type": "fixed",
          "price_amount": 444,
          "price_currency": "usd"
        },
        {
          "amount_type": "free"
        }
      ]
    }
  }
}
```

#### Products Needing Paid Price ($4.44) Added

**4. Dojo Bool v5** (`9e9925e7-788f-4ca1-81ec-9c1b5ae61e43`)
- Current: FREE
- Add: $4.44 USD
- MCP Command:
```json
{
  "server": "user-Polar",
  "toolName": "polar_products_update",
  "arguments": {
    "id": "9e9925e7-788f-4ca1-81ec-9c1b5ae61e43",
    "productUpdate": {
      "prices": [
        {
          "amount_type": "free"
        },
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

**5. Dojo Calipers** (`2092d69f-a243-468c-b1ca-48f7cea19e68`)
- Current: FREE
- Add: $4.44 USD

**6. Dojo Gluefinity Grid_obj** (`b3c265a8-272d-41b7-930d-529538b41f8a`)
- Current: FREE
- Add: $4.44 USD

**7. Dojo Knob** (`c17384fb-dee6-4d86-891c-ed02bbb2e5d7`)
- Current: FREE
- Add: $4.44 USD

**8. Dojo Knob_obj** (`53bbe0f8-7f9f-4d40-8387-473355277ece`)
- Current: FREE
- Add: $4.44 USD

**9. Dojo Mesh Repair** (`714ffbe4-b381-4884-a1da-7c2e8f8b2a91`)
- Current: FREE
- Add: $4.44 USD

**10. Dojo Print Viz_V4.5** (`c668211b-f0ac-4b54-82ac-5f97c8f4adcc`)
- Current: FREE
- Add: $4.44 USD

**11. Dojo_Squircle v4.5** (`fec65858-a3d7-47dc-987c-487a239ea94c`)
- Current: FREE
- Add: $4.44 USD

**12. Dojo Squircle v4.5_obj** (`67c6c182-8a09-4687-914e-2fbb01eff5dc`)
- Current: FREE
- Add: $4.44 USD

For products 5-12, use the same MCP command structure as #4, but with their respective product IDs.

### Step 2: Archive Duplicate Products

After adding prices to the kept products, archive all duplicate variants using:

```json
{
  "server": "user-Polar",
  "toolName": "polar_products_update",
  "arguments": {
    "id": "<duplicate-product-id>",
    "productUpdate": {
      "isArchived": true
    }
  }
}
```

**Complete list of 42 products to archive** (see PRODUCT_CONSOLIDATION_PLAN.md for full list):

#### Dojo Bolt Gen v05 duplicates:
- `af6b7767-db24-44cb-b375-33451782e7ec`
- `caa98690-507b-43ef-8438-7262e0bd0b64`
- `5b217510-01b4-457f-9eaa-4937ef52bd9f`

#### Dojo Bolt Gen v05_Obj duplicates:
- `56ab4bb1-a5f9-42ba-9ab7-9662b397c300`
- `d7d5f7f8-0aef-40d0-a94c-cfe80382e5ce`
- `e2715409-9ccb-4410-bca8-8236d52ffc63`
- `c235b009-81fe-4e3b-a6e7-558328183318`

#### Dojo Bool v5 duplicates:
- `e8452fe5-58ea-4788-ab0b-fc4c4e26f320`
- `141c94e0-e5db-4c73-8418-bdb4354b4118`
- `6305351e-c846-40ec-b8e8-802a225b9e9c`
- `9c25f1a0-8484-403c-ae27-a6d7ab44a089` (test product - delete)

#### Dojo Calipers duplicates:
- `9043105b-0a0a-4228-bcf3-dd59576641d5`
- `7c8ff49d-a8ea-472c-8799-10ef3b4cb333`
- `528c373f-d284-4600-bb54-408509173425`
- `415373e2-d342-4974-8402-d63b132d834c`

#### Dojo Crv Wrapper v4 duplicates:
- `8dea14af-1d59-45bd-acef-f91a1363d35f`
- `7220df68-aa54-4c00-a802-349d5a8ddf65`

#### Dojo Gluefinity Grid_obj duplicates:
- `cb03f53e-a779-4a17-b655-930f7bfdf8bc`
- `8b0038e2-6453-4c38-abc1-2dec83eca54b`
- `38222250-4e96-4898-8f7e-74fef38a7426`

#### Dojo Knob duplicates:
- `ae2662f2-1890-47e7-b97c-938ab466cdb0`
- `0d5cd0b5-a4c1-4436-a320-5cd5c2001622`
- `847194bc-c23c-4b61-b402-5184d543e135`
- `854a4fa6-3dd3-44bd-9a32-55ebab4c6d5a`

#### Dojo Knob_obj duplicates:
- `a56f0867-6d74-427d-9d82-9348961a42bf`
- `cdf5a62e-2f95-4daf-8ed3-385fc1e4e335`
- `c0884407-d71d-4850-8d7b-9cf0e17e8b98`
- `365656bb-f136-4e4b-a40d-1585bc8ca713`

#### Dojo Mesh Repair duplicates:
- `ed582161-4a13-44ae-9a97-09ce9a28fb07`
- `2e7923f4-701e-4fd7-9e73-9073f83b0d72`
- `cb9e1c48-14d4-4553-b50d-5f408cdfe1bf`
- `b6cd2888-3ca8-4d40-a0ef-26a4bd0465a6`

#### Dojo Print Viz_V4.5 duplicates:
- `b6b80558-3845-4bed-8698-a5f93139c442`
- `e5cca7b7-7bea-42ef-b69b-6bee26311035`
- `c44a4e77-05c6-4820-8463-65d008b0291b`

#### Dojo_Squircle v4.5 duplicates:
- `2c455bf6-5ac4-4e5d-bd68-9d6a33b92be0`
- `68463bd4-c654-4fe8-abdd-0db6548c3999`
- `e6b7b153-cb24-455b-85d7-a72ca204e261`

#### Dojo Squircle v4.5_obj duplicates:
- `dbe2314b-7ebb-4306-98ae-34f7298984f8`
- `cbe13cb6-c46e-43f4-9ed7-e97a53c81287`

#### Print Bed Preview_obj duplicates:
- Keep one, archive the other (choose most recently modified)

### Step 3: Verify Consolidation

After archiving, verify you have 15 active products:
1. Dojo Bolt Gen v05 (with FREE + $5.55)
2. Dojo Bolt Gen v05_Obj (with FREE + $7.77)
3. Dojo Bool v5 (with FREE + $4.44)
4. Dojo Calipers (with FREE + $4.44)
5. Dojo Crv Wrapper v4 (with FREE + $4.44)
6. Dojo Gluefinity Grid_obj (with FREE + $4.44)
7. Dojo Knob (with FREE + $4.44)
8. Dojo Knob_obj (with FREE + $4.44)
9. Dojo Mesh Repair (with FREE + $4.44)
10. Dojo Print Viz_V4.5 (with FREE + $4.44)
11. Dojo_Squircle v4.5 (with FREE + $4.44)
12. Dojo Squircle v4.5_obj (with FREE + $4.44)
13. NO3D Membership (unchanged)
14. Print Bed Preview_obj (one variant)
15. (Test product deleted)

### Step 4: Contact Polar Support

After archiving, contact Polar support to permanently delete the archived products:

**Email Template:**
```
Subject: Request to Permanently Delete Archived Duplicate Products

Hi Polar Support,

I have consolidated duplicate products in my catalog and archived 42 duplicate variants.
I would like to request permanent deletion of these archived products.

Organization ID: f0c16049-5959-42c9-8be8-5952c38c7d63

These archived products are duplicates from development/testing and have no active subscriptions.
Please permanently delete all archived products in my organization.

Thank you!
```

## Automation Script

You can also use the consolidation script (once API token is configured):
```bash
node scripts/consolidate-products.js --no-dry-run
```

This will automatically:
1. Identify duplicates
2. Add missing prices to kept products
3. Archive duplicate variants

## Summary

- **Before**: 57 active products
- **After**: 15 active products (each with multiple price options)
- **Reduction**: 42 products archived
- **Result**: Clean catalog with consolidated products offering both FREE and paid options

