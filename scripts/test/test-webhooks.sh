#!/bin/bash
# Test webhook endpoints
# Usage: ./scripts/test/test-webhooks.sh [production|local]

set -euo pipefail

ENVIRONMENT="${1:-production}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ "$ENVIRONMENT" = "local" ]; then
    BASE_URL="http://localhost:3000"
    echo -e "${BLUE}Testing webhooks locally${NC}"
else
    BASE_URL="https://solvet-global-e88opqdfs-node-dojos-projects.vercel.app"
    echo -e "${BLUE}Testing webhooks in production${NC}"
fi

echo "Base URL: $BASE_URL"
echo ""

# Test function
test_webhook() {
    local name=$1
    local url=$2
    local payload=$3
    local secret=$4
    local header_name=$5
    
    echo -e "${YELLOW}Testing: $name${NC}"
    echo "  URL: $url"
    
    # Generate signature
    if [ -n "$secret" ]; then
        if [ "$header_name" = "X-Polar-Signature" ]; then
            # Polar uses sha256
            signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$secret" | sed 's/^.* //')
            signature="sha256=$signature"
        else
            # GitHub uses sha256
            signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$secret" | sed 's/^.* //')
            signature="sha256=$signature"
        fi
    else
        signature=""
    fi
    
    # Make request
    if [ -n "$signature" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -H "$header_name: $signature" \
            -d "$payload" \
            "$url" 2>&1 || echo -e "\n000")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$payload" \
            "$url" 2>&1 || echo -e "\n000")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}✅ Status: $http_code${NC}"
        echo "  Response: $body"
    else
        echo -e "  ${RED}❌ Status: $http_code${NC}"
        echo "  Response: $body"
    fi
    echo ""
}

# Get secrets from Doppler
echo -e "${BLUE}Loading secrets from Doppler...${NC}"
POLAR_WEBHOOK_SECRET=$(doppler secrets get POLAR_WEBHOOK_SECRET --plain 2>/dev/null || echo "")
GITHUB_WEBHOOK_SECRET=$(doppler secrets get GITHUB_WEBHOOK_SECRET --plain 2>/dev/null || echo "")

if [ -z "$POLAR_WEBHOOK_SECRET" ]; then
    echo -e "${YELLOW}⚠️  POLAR_WEBHOOK_SECRET not found in Doppler${NC}"
    echo "   Webhook will be tested without signature verification"
fi

if [ -z "$GITHUB_WEBHOOK_SECRET" ]; then
    echo -e "${YELLOW}⚠️  GITHUB_WEBHOOK_SECRET not found in Doppler${NC}"
    echo "   Webhook will be tested without signature verification"
fi

echo ""

# Test Polar Webhook
POLAR_PAYLOAD='{
  "id": "test_event_123",
  "type": "subscription.created",
  "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "data": {
    "id": "sub_test_123",
    "customer_id": "cus_test_123",
    "product_id": "prod_test_123",
    "status": "active"
  }
}'

test_webhook \
    "Polar Webhook - subscription.created" \
    "$BASE_URL/api/v1/webhooks/polar" \
    "$POLAR_PAYLOAD" \
    "$POLAR_WEBHOOK_SECRET" \
    "X-Polar-Signature"

# Test GitHub Webhook
GITHUB_PAYLOAD='{
  "ref": "refs/heads/main",
  "commits": [
    {
      "id": "test_commit_123",
      "message": "Test commit",
      "added": ["DojoTest/TestProduct.json"],
      "modified": [],
      "removed": []
    }
  ],
  "repository": {
    "name": "no3d-tools-library",
    "owner": {
      "name": "node-dojo"
    }
  }
}'

test_webhook \
    "GitHub Webhook - push event" \
    "$BASE_URL/api/v1/webhooks/github" \
    "$GITHUB_PAYLOAD" \
    "$GITHUB_WEBHOOK_SECRET" \
    "X-Hub-Signature-256"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Webhook testing complete!${NC}"
echo ""
echo "To view logs:"
if [ "$ENVIRONMENT" = "local" ]; then
    echo "  Check your Vercel dev server console"
else
    echo "  vercel logs --follow"
fi
