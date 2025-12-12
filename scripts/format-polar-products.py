#!/usr/bin/env python3
"""
Format Polar products list into a readable table
"""

def format_price(price_obj):
    """Format price object into readable string"""
    if not price_obj:
        return "No price"
    
    amount_type = price_obj.get("amount_type", "")
    if amount_type == "free":
        return "FREE"
    elif amount_type == "fixed":
        amount = price_obj.get("price_amount", 0) / 100  # Convert cents to dollars
        currency = price_obj.get("price_currency", "usd").upper()
        return f"${amount:.2f} {currency}"
    else:
        return amount_type

def format_products_summary(products_data):
    """Format products into a summary table"""
    print("=" * 110)
    print("ACTIVE PRODUCTS IN POLAR".center(110))
    print("=" * 110)
    
    total_count = products_data.get("pagination", {}).get("total_count", 0)
    products = products_data.get("items", [])
    
    print(f"\nTotal Active Products: {total_count}")
    print(f"Products in this response: {len(products)}")
    
    # Group by product name
    product_groups = {}
    for product in products:
        name = product.get("name", "Unnamed")
        product_id = product.get("id", "")
        is_recurring = product.get("is_recurring", False)
        
        # Get price info
        prices = product.get("prices", [])
        active_price = None
        for price in prices:
            if not price.get("is_archived", False):
                active_price = price
                break
        
        price_str = format_price(active_price)
        product_type = "Recurring" if is_recurring else "One-time"
        
        if name not in product_groups:
            product_groups[name] = {
                "variants": [],
                "prices": set(),
                "types": set()
            }
        
        product_groups[name]["variants"].append({
            "id": product_id,
            "price": price_str,
            "type": product_type
        })
        product_groups[name]["prices"].add(price_str)
        product_groups[name]["types"].add(product_type)
    
    print(f"Unique Product Names: {len(product_groups)}")
    print("\n" + "=" * 110)
    print(f"{'Product Name':<50} {'Variants':<10} {'Prices':<30} {'Type':<15}")
    print("=" * 110)
    
    # Sort by name
    for name in sorted(product_groups.keys()):
        info = product_groups[name]
        variant_count = len(info["variants"])
        prices = sorted(info["prices"])
        price_str = ", ".join(prices[:3])
        if len(prices) > 3:
            price_str += f" (+{len(prices)-3} more)"
        
        types = ", ".join(sorted(info["types"]))
        
        print(f"{name[:48]:<50} {variant_count:<10} {price_str[:28]:<30} {types[:13]:<15}")
    
    print("=" * 110)
    print("\nNote: Products may have multiple variants with different prices.")
    print("Most products are Blender assets available as both FREE and paid versions.")

if __name__ == "__main__":
    # This would normally read from API response
    # For now, it's a template
    print("This script formats Polar product data.")
    print("Use it with the product data from polar_products_list MCP tool.")





