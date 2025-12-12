#!/usr/bin/env python3
"""
Analyze Polar products and provide smart consolidation recommendations.

This script:
1. Scores each product based on completeness (icon, description, prices, etc.)
2. Identifies which variant to keep for each product name
3. Recommends consolidation strategy (merge FREE + paid into one product)
4. Provides actionable recommendations

Usage:
    python3 scripts/analyze-product-duplicates.py
"""

import json
import sys
from collections import defaultdict
from datetime import datetime

def score_product(product):
    """Score a product based on completeness and quality"""
    score = 0
    reasons = []
    
    # Has icon/media (20 points)
    if product.get('medias') and len(product['medias']) > 0:
        score += 20
        reasons.append('has icon')
    
    # Has good description (15 points for detailed, 5 for basic)
    desc = product.get('description', '')
    if len(desc) > 50 and not desc.startswith('Blender asset:'):
        score += 15
        reasons.append('good description')
    elif len(desc) > 20:
        score += 5
        reasons.append('basic description')
    
    # Has paid price (10 points)
    prices = product.get('prices', [])
    has_paid = any(
        not p.get('is_archived', False) and 
        p.get('amount_type') == 'fixed' and 
        p.get('price_amount', 0) > 0
        for p in prices
    )
    if has_paid:
        score += 10
        reasons.append('has paid price')
    
    # Has FREE price (5 points)
    has_free = any(
        not p.get('is_archived', False) and 
        p.get('amount_type') == 'free'
        for p in prices
    )
    if has_free:
        score += 5
        reasons.append('has free price')
    
    # Has benefits/files (10 points)
    if product.get('benefits') and len(product['benefits']) > 0:
        score += 10
        reasons.append('has benefits')
    
    # Recently modified (5 points)
    modified_at = product.get('modified_at') or product.get('created_at')
    if modified_at:
        try:
            mod_date = datetime.fromisoformat(modified_at.replace('Z', '+00:00'))
            days_ago = (datetime.now(mod_date.tzinfo) - mod_date).days
            if days_ago < 30:
                score += 5
                reasons.append('recently updated')
        except:
            pass
    
    # Has metadata (5 points)
    if product.get('metadata') and len(product.get('metadata', {})) > 0:
        score += 5
        reasons.append('has metadata')
    
    return score, reasons

def format_price(price_obj):
    """Format price object into readable string"""
    if not price_obj:
        return "No price"
    
    amount_type = price_obj.get("amount_type", "")
    if amount_type == "free":
        return "FREE"
    elif amount_type == "fixed":
        amount = price_obj.get("price_amount", 0) / 100
        currency = price_obj.get("price_currency", "usd").upper()
        return f"${amount:.2f} {currency}"
    else:
        return amount_type

def analyze_products(products_data):
    """Analyze products and generate recommendations"""
    
    products = products_data.get('items', [])
    print(f"\n📊 Analyzing {len(products)} products...\n")
    
    # Group by name
    groups = defaultdict(list)
    for product in products:
        groups[product['name']].append(product)
    
    # Score each product
    scored_groups = {}
    for name, variants in groups.items():
        scored_groups[name] = []
        for product in variants:
            score, reasons = score_product(product)
            scored_groups[name].append({
                'product': product,
                'score': score,
                'reasons': reasons,
            })
        # Sort by score descending
        scored_groups[name].sort(key=lambda x: x['score'], reverse=True)
    
    # Generate recommendations
    recommendations = {
        'keep': [],
        'consolidate': [],
        'archive': [],
    }
    
    for name, scored_variants in scored_groups.items():
        if len(scored_variants) == 1:
            # Single variant - keep it
            sv = scored_variants[0]
            price = sv['product'].get('prices', [{}])[0]
            recommendations['keep'].append({
                'name': name,
                'product': sv['product'],
                'score': sv['score'],
                'reasons': sv['reasons'],
                'price': format_price(price),
            })
        else:
            # Multiple variants
            best = scored_variants[0]
            others = scored_variants[1:]
            
            # Collect all unique prices
            all_prices = set()
            for sv in scored_variants:
                for price in sv['product'].get('prices', []):
                    if not price.get('is_archived', False):
                        price_str = format_price(price)
                        all_prices.add(price_str)
            
            # Check if consolidation needed (multiple price types)
            has_free = any('FREE' in p for p in all_prices)
            has_paid = any('$' in p for p in all_prices)
            
            if has_free and has_paid:
                # Need to consolidate - keep best, archive others
                recommendations['consolidate'].append({
                    'name': name,
                    'keep': best['product'],
                    'keep_score': best['score'],
                    'keep_reasons': best['reasons'],
                    'archive': [sv['product'] for sv in others],
                    'all_prices': sorted(all_prices),
                    'current_prices': [format_price(p) for p in best['product'].get('prices', []) if not p.get('is_archived', False)],
                })
            else:
                # Same price type - just keep best
                recommendations['keep'].append({
                    'name': name,
                    'product': best['product'],
                    'score': best['score'],
                    'reasons': best['reasons'],
                    'price': format_price(best['product'].get('prices', [{}])[0]),
                })
                recommendations['archive'].extend([sv['product'] for sv in others])
    
    return recommendations

def display_recommendations(recommendations):
    """Display formatted recommendations"""
    
    print('=' * 100)
    print('PRODUCT CONSOLIDATION RECOMMENDATIONS'.center(100))
    print('=' * 100)
    print()
    
    # Products to keep as-is
    if recommendations['keep']:
        print(f"✅ KEEP AS-IS ({len(recommendations['keep'])} products):")
        for item in sorted(recommendations['keep'], key=lambda x: x['name']):
            print(f"   • {item['name']:<45} Score: {item['score']:>3} | {item['price']:<20} | {', '.join(item['reasons'])}")
        print()
    
    # Products to consolidate
    if recommendations['consolidate']:
        print(f"🔄 CONSOLIDATE ({len(recommendations['consolidate'])} products):")
        print("   (Keep best variant, archive others, add missing prices to kept product)")
        print()
        for item in sorted(recommendations['consolidate'], key=lambda x: x['name']):
            print(f"   📦 {item['name']}:")
            print(f"      ✅ KEEP: {item['keep']['id'][:8]}... (Score: {item['keep_score']})")
            print(f"         Reasons: {', '.join(item['keep_reasons'])}")
            print(f"         Current prices: {', '.join(item['current_prices']) or 'none'}")
            print(f"         Available prices to add: {', '.join([p for p in item['all_prices'] if p not in item['current_prices']])}")
            print(f"      🗑️  ARCHIVE ({len(item['archive'])} variants):")
            for p in item['archive']:
                price = format_price(p.get('prices', [{}])[0])
                print(f"         • {p['id'][:8]}... | {price}")
            print()
    
    # Products to archive
    if recommendations['archive']:
        print(f"🗑️  ARCHIVE DUPLICATES ({len(recommendations['archive'])} products):")
        for product in sorted(recommendations['archive'], key=lambda x: x['name']):
            price = format_price(product.get('prices', [{}])[0])
            print(f"   • {product['name']:<45} | {price}")
        print()
    
    # Summary
    print('=' * 100)
    print('SUMMARY:')
    print(f"   Products to keep: {len(recommendations['keep'])}")
    print(f"   Products to consolidate: {len(recommendations['consolidate'])}")
    print(f"   Products to archive: {len(recommendations['archive'])}")
    total_active = len(recommendations['keep']) + len(recommendations['consolidate'])
    reduction = len(recommendations['archive']) + len(recommendations['consolidate'])
    print(f"   Total active products after consolidation: {total_active}")
    print(f"   Reduction: {reduction} products → {len(recommendations['consolidate'])} products")
    print('=' * 100)
    print()
    
    print('💡 NEXT STEPS:')
    print('   1. Review the recommendations above')
    print('   2. For products marked "CONSOLIDATE":')
    print('      - Keep the recommended product')
    print('      - Add missing prices to that product (FREE or paid)')
    print('      - Archive the duplicate variants')
    print('   3. Archive all products in the "ARCHIVE DUPLICATES" section')
    print('   4. Contact Polar support to permanently delete archived products if needed')
    print()

if __name__ == '__main__':
    print("""
    ╔════════════════════════════════════════════════════════════════╗
    ║     Polar Product Consolidation Analysis                      ║
    ╚════════════════════════════════════════════════════════════════╝
    """)
    
    print("⚠️  This script analyzes products but doesn't make changes.")
    print("   Use the Polar MCP tool to fetch products, then run this analysis.\n")
    
    # For now, we'll need to fetch products via MCP and pass them here
    # Or we can create a version that uses the MCP tool directly
    print("To use this script:")
    print("1. Fetch products using Polar MCP: polar_products_list")
    print("2. Save the JSON response")
    print("3. Pass it to this script or modify it to use MCP directly")
    print()
    
    # Example: if products were passed as JSON
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            products_data = json.load(f)
        recommendations = analyze_products(products_data)
        display_recommendations(recommendations)
    else:
        print("Run with: python3 scripts/analyze-product-duplicates.py <products.json>")
        print("Or modify the script to fetch products via MCP directly")





