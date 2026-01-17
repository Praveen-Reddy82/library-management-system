# 🚀 Deployment Guide

This guide covers deploying the Library Management System to production.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or cloud-based like MongoDB Atlas)
- Domain/Server for hosting
- SSL Certificate (for HTTPS in production)

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000

# Frontend URL (for CORS) - Update with your production frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# JWT Secret Key - CHANGE THIS! Use a strong random string
JWT_SECRET=your-very-secure-random-secret-key-here

# MongoDB Connection (if using MongoDB)
# MONGODB_URI=mongodb://localhost:27017/library-management
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management?retryWrites=true&w=majority
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# API Base URL - Update with your production backend URL
REACT_APP_API_URL=https://your-backend-domain.com
```

## Build for Production

### 1. Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `frontend/build/` directory.

### 2. Backend Setup

The backend is already production-ready. Ensure all dependencies are installed:

```bash
cd backend
npm install --production
```

## Deployment Options

### Option 1: Deploy to VPS/Cloud Server (Recommended)

#### Using PM2 (Process Manager)

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Start Backend with PM2:**
   ```bash
   cd backend
   pm2 start index.js --name library-backend
   pm2 save
   pm2 startup
   ```

3. **Serve Frontend:**
   - Option A: Use a web server like Nginx
   - Option B: Use PM2 with serve:
     ```bash
     npm install -g serve
     cd frontend
     pm2 serve build 3000 --name library-frontend --spa
     ```

4. **Configure Nginx (if using):**
   ```nginx
   # Backend API
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # Frontend
   server {
       listen 80;
       server_name yourdomain.com;
       
       root /path/to/frontend/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Option 2: Deploy to Heroku

#### Backend Deployment:

1. **Create Heroku app:**
   ```bash
   heroku create your-library-backend
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set FRONTEND_URL=https://your-frontend.herokuapp.com
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

#### Frontend Deployment:

1. **Add static buildpack:**
   ```bash
   heroku create your-library-frontend
   heroku buildpacks:add heroku/nodejs
   ```

2. **Update `frontend/package.json` scripts:**
   ```json
   "scripts": {
     "start": "serve -s build",
     "heroku-postbuild": "npm run build"
   }
   ```

3. **Install serve:**
   ```bash
   npm install --save serve
   ```

4. **Set environment variables and deploy**

### Option 3: Deploy to Vercel/Netlify

#### Frontend (Vercel/Netlify):

1. Connect your GitHub repository
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/build`
4. Set environment variable: `REACT_APP_API_URL`

#### Backend (Railway/Render):

1. Connect your GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Set environment variables

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Update CORS settings with production frontend URL
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set secure cookie flags if using cookies
- [ ] Review and restrict file upload sizes
- [ ] Set up rate limiting
- [ ] Configure proper MongoDB authentication
- [ ] Use environment variables for all sensitive data
- [ ] Set up proper logging and monitoring
- [ ] Configure firewall rules

## Post-Deployment

1. **Test all functionality:**
   - User registration/login
   - Book management
   - Borrowing/returning books
   - File uploads (images/PDFs)
   - Profile updates

2. **Monitor logs:**
   ```bash
   pm2 logs
   ```

3. **Set up backups:**
   - Database backups (if using MongoDB)
   - File uploads backup

4. **Performance monitoring:**
   - Monitor server resources
   - Set up error tracking (e.g., Sentry)
   - Monitor API response times

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` in backend matches your frontend domain exactly
- Check that CORS middleware is properly configured

### File Upload Issues
- Verify uploads directory exists and has write permissions
- Check file size limits in multer configuration

### API Connection Issues
- Verify `REACT_APP_API_URL` matches your backend URL
- Check network/firewall settings

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `npm run build -- --no-cache`

## Support

For issues or questions, please refer to the main README.md or open an issue in the repository.
