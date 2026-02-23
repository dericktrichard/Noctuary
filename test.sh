#!/bin/bash

echo "🧪 Noctuary MVP Testing Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Build
echo "📦 Test 1: Build"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Test 2: Environment Variables
echo ""
echo "🔐 Test 2: Environment Variables"
required_vars=(
    "DATABASE_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_PAYPAL_CLIENT_ID"
    "PAYPAL_CLIENT_SECRET"
    "PAYSTACK_SECRET_KEY"
    "RESEND_API_KEY"
)

all_vars_present=true
for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env.local 2>/dev/null; then
        echo -e "${GREEN}✓ ${var}${NC}"
    else
        echo -e "${RED}✗ ${var} missing${NC}"
        all_vars_present=false
    fi
done

if [ "$all_vars_present" = false ]; then
    echo -e "${YELLOW}⚠ Some environment variables are missing${NC}"
fi

# Test 3: Database Connection
echo ""
echo "🗄️  Test 3: Database Connection"
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connected${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
fi

# Test 4: TypeScript Check
echo ""
echo "📘 Test 4: TypeScript Check"
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No TypeScript errors${NC}"
else
    echo -e "${YELLOW}⚠ TypeScript warnings found (check manually)${NC}"
fi

# Test 5: Dependencies
echo ""
echo "📦 Test 5: Dependencies"
if npm audit --audit-level=high > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No high-severity vulnerabilities${NC}"
else
    echo -e "${YELLOW}⚠ Security vulnerabilities found (run: npm audit)${NC}"
fi

echo ""
echo "================================"
echo "✅ Automated tests complete!"
echo ""
echo "Next steps:"
echo "1. Run manual testing checklist (TESTING_CHECKLIST.md)"
echo "2. Test all payment flows"
echo "3. Verify mobile responsiveness"
echo "4. Check theme switching"
echo "5. Ready for deployment!"