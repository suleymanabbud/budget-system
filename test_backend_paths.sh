#!/bin/bash

# Test all Backend paths
# اختبار جميع مسارات Backend

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   اختبار مسارات Backend${NC}"
echo -e "${BLUE}   Testing Backend Paths${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Test direct Backend
echo -e "${YELLOW}اختبار Backend مباشرة (port 8001):${NC}"
echo ""
ENDPOINTS=(
    "http://localhost:8001/"
    "http://localhost:8001/api/docs"
    "http://localhost:8001/api/v1"
    "http://localhost:8001/api/v1/auth/login"
    "http://localhost:8001/health"
)

for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "405" ]; then
        echo -e "${GREEN}✅ $endpoint: HTTP $STATUS${NC}"
    elif [ "$STATUS" = "404" ]; then
        echo -e "${RED}❌ $endpoint: HTTP $STATUS${NC}"
    else
        echo -e "${YELLOW}⚠️  $endpoint: HTTP $STATUS${NC}"
    fi
done

echo ""
echo -e "${YELLOW}اختبار من خلال Nginx (/budget-api):${NC}"
echo ""
NGINX_ENDPOINTS=(
    "http://localhost/budget-api/docs"
    "http://localhost/budget-api/v1"
    "http://localhost/budget-api/v1/"
    "http://localhost/budget-api/v1/auth/login"
)

for endpoint in "${NGINX_ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "405" ]; then
        echo -e "${GREEN}✅ $endpoint: HTTP $STATUS${NC}"
    elif [ "$STATUS" = "404" ]; then
        echo -e "${RED}❌ $endpoint: HTTP $STATUS${NC}"
    else
        echo -e "${YELLOW}⚠️  $endpoint: HTTP $STATUS${NC}"
    fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"

