#!/bin/bash
# Test API endpoints for subscription system

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

echo "🧪 Testing API Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=${4:-}
    
    echo "Testing: $name"
    echo "  URL: $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" || echo -e "\n000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" || echo -e "\n000")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "  ${GREEN}✅ Status: $http_code${NC}"
        echo "  Response: $(echo "$body" | head -c 200)"
        if [ ${#body} -gt 200 ]; then
            echo "..."
        fi
    else
        echo -e "  ${RED}❌ Status: $http_code${NC}"
        echo "  Response: $body"
    fi
    echo ""
}

# Test 1: Catalog Version
test_endpoint "Catalog Version" "$BASE_URL/api/v1/catalog/version"

# Test 2: User Entitlements (without customer_id - should fail gracefully)
test_endpoint "User Entitlements (no customer)" "$BASE_URL/api/v1/user/entitlements"

# Test 3: User Entitlements (with test customer_id)
test_endpoint "User Entitlements (test customer)" "$BASE_URL/api/v1/user/entitlements?customer_id=test_customer_123"

# Test 4: Library Download (without customer_id - should fail)
test_endpoint "Library Download (no customer)" "$BASE_URL/api/v1/library/download"

# Test 5: Library Download (with test customer_id - will fail auth but should return proper error)
test_endpoint "Library Download (test customer)" "$BASE_URL/api/v1/library/download?customer_id=test_customer_123"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ API endpoint tests complete"
echo ""
echo "Note: Some endpoints require valid Polar customer IDs to return data"
echo "      Authentication errors are expected for test customer IDs"



