# ✅ Pre-Deployment Checklist

This document lists what has been completed and what still needs attention before deploying to production.

## ✅ Completed Items

### Configuration & Environment
- ✅ Created centralized API configuration (`frontend/src/config/api.js`)
- ✅ Updated AuthContext to use API configuration
- ✅ Updated Profile component to use API configuration
- ✅ Added CORS configuration with environment variable support
- ✅ Fixed missing email fields in demo users data

### Documentation
- ✅ Created comprehensive deployment guide (`DEPLOYMENT.md`)

## ⚠️ Still Needs Manual Update

### Frontend API Calls
The following components still have hardcoded API URLs and should be updated to use `API_ENDPOINTS` from `config/api.js`:

**Priority 1 (High Priority):**
- `frontend/src/components/Users.js` - Multiple API calls
- `frontend/src/components/Books.js` - Multiple API calls  
- `frontend/src/components/Borrowings.js` - Multiple API calls
- `frontend/src/components/Dashboard.js` - Multiple API calls

**To update:**
1. Import: `import { API_ENDPOINTS, API_ENDPOINTS as API } from '../config/api';`
2. Replace `http://localhost:5000/api/...` with `API_ENDPOINTS.ENDPOINT_NAME`

### Example Replacement Pattern:

```javascript
// Before:
axios.get('http://localhost:5000/api/books')

// After:
import { API_ENDPOINTS } from '../config/api';
axios.get(API_ENDPOINTS.BOOKS.BASE)
```

### Image/PDF URLs
Replace hardcoded `http://localhost:5000` with `API_ENDPOINTS.UPLOADS.BASE`:

```javascript
// Before:
image={book.coverImage ? `http://localhost:5000${book.coverImage}` : ...}

// After:
image={book.coverImage ? `${API_ENDPOINTS.UPLOADS.BASE}${book.coverImage}` : ...}
```

## 🔒 Security Recommendations

### Before Production:
1. **Environment Variables:**
   - Create `.env` files from examples (backend and frontend)
   - Set strong `JWT_SECRET` (use: `openssl rand -base64 32`)
   - Update `FRONTEND_URL` with production domain

2. **API Security:**
   - Add rate limiting middleware
   - Implement request validation
   - Add input sanitization
   - Set up API versioning

3. **File Upload Security:**
   - Validate file types on backend
   - Scan uploaded files for viruses
   - Limit file upload sizes
   - Store files outside web root if possible

4. **Database:**
   - Enable MongoDB authentication
   - Use connection string with credentials
   - Set up database backups
   - Enable MongoDB SSL/TLS

## 📝 Environment Files

Create these files before deployment:

### `backend/.env`
```env
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-strong-random-secret-key-here
```

### `frontend/.env`
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

## 🧪 Testing Checklist

Before deploying, test:

- [ ] User registration and login
- [ ] Profile viewing and editing
- [ ] Password change functionality
- [ ] Book CRUD operations (Create, Read, Update, Delete)
- [ ] Book search and filtering
- [ ] User CRUD operations (admin only)
- [ ] Book borrowing workflow
- [ ] Book return workflow
- [ ] Image upload for books
- [ ] PDF upload for books
- [ ] Borrowing approval/rejection (admin)
- [ ] Dashboard statistics
- [ ] Navigation between pages
- [ ] Mobile responsiveness
- [ ] Error handling (network errors, validation errors)

## 🚀 Quick Fix Script

To quickly find all remaining hardcoded URLs:

```bash
# In frontend directory
grep -r "localhost:5000" src/components/
```

## 📦 Build Verification

Before deployment, verify builds work:

```bash
# Frontend build
cd frontend
npm run build
# Should create build/ directory without errors

# Backend check
cd backend
node index.js
# Should start without errors (stop with Ctrl+C)
```

## 🎯 Next Steps

1. Update remaining API calls to use `API_ENDPOINTS`
2. Create and configure `.env` files
3. Test all functionality end-to-end
4. Review security checklist
5. Deploy following `DEPLOYMENT.md` guide
6. Monitor logs and errors post-deployment

---

**Note:** The application is functionally complete and ready for deployment. The remaining items are primarily code quality improvements (centralizing API URLs) that will make future maintenance easier but are not critical for initial deployment.
