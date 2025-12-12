# Product Consolidation Plan

## Current State
- **57 active products** across **15 unique product names**
- **42 duplicate products** need to be consolidated
- Archiving via API doesn't work as expected

## Consolidation Strategy

### Strategy: Keep Best Variant + Add Missing Prices

For each product name, we'll:
1. **Keep** the variant with the highest completeness score
2. **Add missing prices** (FREE or paid) to the kept product
3. **Archive** all other variants

## Detailed Recommendations

### 1. Dojo Bolt Gen v05 (4 variants)

**KEEP**: `2fbe03f5-f6bc-4d53-a309-1b9aa7fa010c`
- ✅ Has icon
- ✅ Good description ("Drag and drop this node utility...")
- ✅ Has paid price ($5.55)
- Score: 50

**ACTION**: Add FREE price option to this product

**ARCHIVE**:
- `af6b7767-db24-44cb-b375-33451782e7ec` (FREE, no icon, basic description)
- `caa98690-507b-43ef-8438-7262e0bd0b64` ($4.44, no icon, basic description)
- `5b217510-01b4-457f-9eaa-4937ef52bd9f` (FREE, no icon, basic description)

---

### 2. Dojo Bolt Gen v05_Obj (5 variants)

**KEEP**: `eb28f590-e6eb-463a-830d-95243e51de89`
- ✅ Has icon
- ✅ Good description ("Drag and drop this Mesh object...")
- ✅ Has paid price ($7.77)
- Score: 50

**ACTION**: Add FREE price option to this product

**ARCHIVE**:
- `56ab4bb1-a5f9-42ba-9ab7-9662b397c300` ($4.44, no icon)
- `d7d5f7f8-0aef-40d0-a94c-cfe80382e5ce` (FREE, no icon)
- `e2715409-9ccb-4410-bca8-8236d52ffc63` (FREE, no icon)
- `c235b009-81fe-4e3b-a6e7-558328183318` (FREE, no icon)

---

### 3. Dojo Bool v5 (5 variants)

**KEEP**: `9e9925e7-788f-4ca1-81ec-9c1b5ae61e43`
- ✅ Has icon
- ✅ Excellent description ("A simple node group, but its in my top 5...")
- ✅ Has FREE price
- Score: 45

**ACTION**: Add paid price ($4.44) to this product

**ARCHIVE**:
- `e8452fe5-58ea-4788-ab0b-fc4c4e26f320` ($4.44, no icon, shorter description)
- `141c94e0-e5db-4c73-8418-bdb4354b4118` (FREE, no icon)
- `6305351e-c846-40ec-b8e8-802a225b9e9c` (FREE, no icon)
- `9c25f1a0-8484-403c-ae27-a6d7ab44a089` (FREE, test product - DELETE)

---

### 4. Dojo Calipers (5 variants)

**KEEP**: `2092d69f-a243-468c-b1ca-48f7cea19e68`
- ✅ Has icon
- ✅ Has FREE price
- Score: 35

**ACTION**: Add paid price ($4.44) to this product

**ARCHIVE**:
- `9043105b-0a0a-4228-bcf3-dd59576641d5` (FREE, no icon)
- `7c8ff49d-a8ea-472c-8799-10ef3b4cb333` (FREE, no icon)
- `528c373f-d284-4600-bb54-408509173425` (FREE, no icon)
- `415373e2-d342-4974-8402-d63b132d834c` ($4.44, no icon)

---

### 5. Dojo Crv Wrapper v4 (3 variants)

**KEEP**: `ee82acc9-63a8-4b79-a7bd-a06ec8722391`
- ✅ Has paid price ($4.44)
- Score: 25

**ACTION**: Add FREE price option to this product

**ARCHIVE**:
- `8dea14af-1d59-45bd-acef-f91a1363d35f` (FREE, no icon)
- `7220df68-aa54-4c00-a802-349d5a8ddf65` (FREE, no icon)

---

### 6. Dojo Gluefinity Grid_obj (4 variants)

**KEEP**: `b3c265a8-272d-41b7-930d-529538b41f8a`
- ✅ Has icon
- ✅ Has FREE price
- Score: 35

**ACTION**: Add paid price ($4.44) to this product

**ARCHIVE**:
- `cb03f53e-a779-4a17-b655-930f7bfdf8bc` ($4.44, no icon)
- `8b0038e2-6453-4c38-abc1-2dec83eca54b` (FREE, no icon)
- `38222250-4e96-4898-8f7e-74fef38a7426` (FREE, no icon)

---

### 7. Dojo Knob (5 variants)

**KEEP**: `c17384fb-dee6-4d86-891c-ed02bbb2e5d7`
- ✅ Has icon
- ✅ Has FREE price
- Score: 35

**ACTION**: Add paid price ($4.44) to this product

**ARCHIVE**:
- `ae2662f2-1890-47e7-b97c-938ab466cdb0` ($4.44, no icon)
- `0d5cd0b5-a4c1-4436-a320-5cd5c2001622` (FREE, no icon)
- `847194bc-c23c-4b61-b402-5184d543e135` (FREE, no icon)
- `854a4fa6-3dd3-44bd-9a32-55ebab4c6d5a` (FREE, no icon)

---

### 8. Dojo Knob_obj (5 variants)

**KEEP**: `53bbe0f8-7f9f-4d40-8387-473355277ece`
- ✅ Has icon
- ✅ Has FREE price
- Score: 35

**ACTION**: Add paid price ($4.44) to this product

**ARCHIVE**:
- `a56f0867-6d74-427d-9d82-9348961a42bf` (FREE, no icon)
- `cdf5a62e-2f95-4daf-8ed3-385fc1e4e335` ($4.44, no icon)
- `c0884407-d71d-4850-8d7b-9cf0e17e8b98` (FREE, no icon)
- `365656bb-f136-4e4b-a40d-1585bc8ca713` (FREE, no icon)

---

### 9. Dojo Mesh Repair (5 variants)

**KEEP**: `714ffbe4-b381-4884-a1da-7c2e8f8b2a91`
- ✅ Has icon
- ✅ Has FREE price
- Score: 35

**ACTION**: Add paid price ($4.44) to this product

**ARCHIVE**:
- `ed582161-4a13-44ae-9a97-09ce9a28fb07` (FREE, no icon)
- `2e7923f4-701e-4fd7-9e73-9073f83b0d72` (FREE, no icon)
- `cb9e1c48-14d4-4553-b50d-5f408cdfe1bf` (FREE, no icon)
- `b6cd2888-3ca8-4d40-a0ef-26a4bd0465a6` ($4.44, no icon)

---

### 10. Dojo Print Viz_V4.5 (4 variants)

**KEEP**: `c668211b-f0ac-4b54-82ac-5f97c8f4adcc`
- ✅ Has icon
- ✅ Has FREE price
- Score: 35

**ACTION**: Add paid price ($4.44) to this product

**ARCHIVE**:
- `b6b80558-3845-4bed-8698-a5f93139c442` ($4.44, no icon)
- `e5cca7b7-7bea-42ef-b69b-6bee26311035` (FREE, no icon)
- `c44a4e77-05c6-4820-8463-65d008b0291b` (FREE, no icon)

---

### 11. Dojo_Squircle v4.5 (4 variants)

**KEEP**: `fec65858-a3d7-47dc-987c-487a239ea94c`
- ✅ Has icon
- ✅ Has FREE price
- Score: 35

**ACTION**: Add paid price ($4.44) to this product

**ARCHIVE**:
- `2c455bf6-5ac4-4e5d-bd68-9d6a33b92be0` (FREE, no icon)
- `68463bd4-c654-4fe8-abdd-0db6548c3999` ($4.44, no icon)
- `e6b7b153-cb24-455b-85d7-a72ca204e261` (FREE, no icon)

---

### 12. Dojo Squircle v4.5_obj (3 variants)

**KEEP**: `67c6c182-8a09-4687-914e-2fbb01eff5dc`
- ✅ Has icon
- ✅ Has FREE price
- Score: 35

**ACTION**: Add paid price ($4.44) to this product

**ARCHIVE**:
- `dbe2314b-7ebb-4306-98ae-34f7298984f8` (FREE, no icon)
- `cbe13cb6-c46e-43f4-9ed7-e97a53c81287` ($4.44, no icon)

---

### 13. NO3D Membership (1 variant)

**KEEP**: `abee39f0-c7d8-4e08-b28b-01a49cd77ec2`
- ✅ Has icon
- ✅ Recurring subscription ($11.11/month)
- ✅ Unique product (no duplicates)
- Score: 50

**ACTION**: None - keep as-is

---

### 14. Print Bed Preview_obj (2 variants)

**KEEP**: Either variant (both are similar)
- Both are FREE
- Neither has icon
- Score: 15 each

**ACTION**: Keep one, archive the other (choose most recently modified)

**ARCHIVE**:
- The older variant

---

### 15. Test Product - Dojo Bool v5 (1 variant)

**DELETE**: `9c25f1a0-8484-403c-ae27-a6d7ab44a089`
- Test product
- Should be permanently deleted

**ACTION**: Contact Polar support to delete this test product

---

## Summary

### Products to Keep (15 total)
1. Dojo Bolt Gen v05: `2fbe03f5-f6bc-4d53-a309-1b9aa7fa010c`
2. Dojo Bolt Gen v05_Obj: `eb28f590-e6eb-463a-830d-95243e51de89`
3. Dojo Bool v5: `9e9925e7-788f-4ca1-81ec-9c1b5ae61e43`
4. Dojo Calipers: `2092d69f-a243-468c-b1ca-48f7cea19e68`
5. Dojo Crv Wrapper v4: `ee82acc9-63a8-4b79-a7bd-a06ec8722391`
6. Dojo Gluefinity Grid_obj: `b3c265a8-272d-41b7-930d-529538b41f8a`
7. Dojo Knob: `c17384fb-dee6-4d86-891c-ed02bbb2e5d7`
8. Dojo Knob_obj: `53bbe0f8-7f9f-4d40-8387-473355277ece`
9. Dojo Mesh Repair: `714ffbe4-b381-4884-a1da-7c2e8f8b2a91`
10. Dojo Print Viz_V4.5: `c668211b-f0ac-4b54-82ac-5f97c8f4adcc`
11. Dojo_Squircle v4.5: `fec65858-a3d7-47dc-987c-487a239ea94c`
12. Dojo Squircle v4.5_obj: `67c6c182-8a09-4687-914e-2fbb01eff5dc`
13. NO3D Membership: `abee39f0-c7d8-4e08-b28b-01a49cd77ec2`
14. Print Bed Preview_obj: (choose one)
15. (Test product to be deleted)

### Products to Archive (42 total)
See individual product sections above for complete list.

### Actions Required

1. **Add missing prices** to kept products:
   - Products that only have FREE: Add $4.44 paid price
   - Products that only have paid: Add FREE price option

2. **Archive duplicates**: Use Polar API or dashboard to archive all duplicate variants

3. **Contact Polar support**: Request permanent deletion of:
   - All archived products
   - Test product: `9c25f1a0-8484-403c-ae27-a6d7ab44a089`

## Implementation Script

A script to help with this consolidation is available:
- `scripts/run-product-analysis.js` - Analyzes and provides recommendations
- `scripts/smart-consolidate-products.js` - Can execute consolidation (needs completion)

## Next Steps

1. Review this plan
2. Execute price additions to kept products
3. Archive duplicate products
4. Contact Polar support for permanent deletion
5. Implement prevention measures to avoid future duplicates
