#!/bin/bash

echo "🚀 Library Management System - Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Testing local setup...${NC}"

# Test backend locally
cd backend
npm install
npm start &
BACKEND_PID=$!
sleep 10

# Test if backend is running
if curl -s http://localhost:5000/api/books > /dev/null; then
    echo -e "${GREEN}✅ Backend test passed${NC}"
else
    echo -e "${RED}❌ Backend test failed${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Kill test backend
kill $BACKEND_PID 2>/dev/null
cd ..

echo -e "${YELLOW}Step 2: Backend Deployment (Render.com)${NC}"
echo ""
echo "📋 MANUAL STEPS REQUIRED:"
echo "1. Go to https://render.com"
echo "2. Sign in with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Search and select: Praveen-Reddy82/library-management-system"
echo "5. Configure:"
echo "   - Name: library-management-backend"
echo "   - Root Directory: backend"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "6. Environment Variables:"
cat backend/.env | while IFS= read -r line; do
    echo "   - $line"
done

echo ""
echo -e "${YELLOW}Step 3: Frontend Deployment (Vercel)${NC}"
echo ""
echo "📋 MANUAL STEPS REQUIRED:"
echo "1. Go to https://vercel.com"
echo "2. Sign in with GitHub"
echo "3. Click 'Import Project'"
echo "4. Import: Praveen-Reddy82/library-management-system"
echo "5. Configure:"
echo "   - Project Name: library-management-frontend"
echo "   - Root Directory: frontend"
echo "   - Framework Preset: Create React App"
echo "6. Environment Variable:"
echo "   - REACT_APP_API_URL: https://your-backend-service.onrender.com"
echo ""
echo "7. Click 'Deploy'"

echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Complete backend deployment on Render.com"
echo "2. Complete frontend deployment on Vercel"
echo "3. Update backend FRONTEND_URL with Vercel domain"
echo "4. Seed database: curl https://your-backend.onrender.com/api/seed"
echo ""
echo "Your app will be live at: https://your-frontend.vercel.app"
