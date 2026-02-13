#!/bin/bash

# Test Runner Script for Secure Login System
# This script runs all test suites and generates reports

echo "═══════════════════════════════════════════════════════════════════"
echo "🔐 SECURE LOGIN SYSTEM - COMPREHENSIVE TEST RUNNER"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend is running
echo "🔍 Checking if backend server is running..."
if curl -s http://localhost:3000/api/auth/logout > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running!${NC}"
    echo "Please start the backend server first:"
    echo "  cd server && npm start"
    exit 1
fi

# Check if frontend is running
echo "🔍 Checking if frontend is running..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
    echo "For Selenium tests, please start the frontend:"
    echo "  cd client && npm run dev"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "📝 TEST EXECUTION"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Change to tests directory
cd "$(dirname "$0")"

# Run Functional Tests
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Running Functional Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node functional_tests.js
FUNCTIONAL_EXIT=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📏 Running Boundary Value Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node boundary_tests.js
BOUNDARY_EXIT=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  Running Security Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node security_tests.js
SECURITY_EXIT=$?

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "📊 TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════════"

# Calculate results
TOTAL_SUITES=3
PASSED_SUITES=0

if [ $FUNCTIONAL_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Functional Tests: PASSED${NC}"
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    echo -e "${RED}❌ Functional Tests: FAILED${NC}"
fi

if [ $BOUNDARY_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Boundary Value Tests: PASSED${NC}"
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    echo -e "${RED}❌ Boundary Value Tests: FAILED${NC}"
fi

if [ $SECURITY_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Security Tests: PASSED${NC}"
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    echo -e "${RED}❌ Security Tests: FAILED${NC}"
fi

echo ""
echo "Test Suites: $PASSED_SUITES / $TOTAL_SUITES passed"

# List generated reports
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "📄 GENERATED REPORTS"
echo "═══════════════════════════════════════════════════════════════════"

if [ -f "test_report.html" ]; then
    echo -e "${GREEN}✓${NC} test_report.html (Functional Tests)"
fi

if [ -f "boundary_test_report.html" ]; then
    echo -e "${GREEN}✓${NC} boundary_test_report.html (Boundary Tests)"
fi

if [ -f "security_test_report.html" ]; then
    echo -e "${GREEN}✓${NC} security_test_report.html (Security Tests)"
fi

if [ -f "selenium_test_report.html" ]; then
    echo -e "${GREEN}✓${NC} selenium_test_report.html (Selenium Tests)"
fi

echo ""
echo "Open these HTML files in a browser to view detailed reports."
echo ""

# Ask if user wants to run Selenium tests
echo "═══════════════════════════════════════════════════════════════════"
read -p "Run Selenium UI automation tests? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "🤖 Running Selenium Tests..."
        node feature_test.js
    else
        echo -e "${RED}❌ Cannot run Selenium tests - Frontend not running${NC}"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✨ Test execution completed!"
echo "═══════════════════════════════════════════════════════════════════"

# Exit with failure if any test suite failed
if [ $PASSED_SUITES -eq $TOTAL_SUITES ]; then
    exit 0
else
    exit 1
fi
