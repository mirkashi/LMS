# 🚀 Deployment Guide - 9tangle LMS

## Production Deployment Steps

### Frontend Deployment (Vercel)

#### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts and set environment variables
```

#### Option 2: Connect GitHub Repository
1. Push code to GitHub
2. Go to vercel.com
3. Click "New Project"
4. Select your GitHub repository
5. Configure environment variables
6. Deploy

#### Environment Variables on Vercel
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Backend Deployment

#### Option 1: Railway.app (Recommended)
```bash
# Install Railway CLI
npm i -g railway

# Navigate to backend
cd backend

# Login and link project
railway login
railway link

# Deploy
railway up
```

#### Option 2: Render.com
1. Sign up at render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Runtime: Node
   - Build: npm install
   - Start: npm start
5. Set environment variables
6. Deploy

#### Option 3: Heroku (Legacy)
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongo_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Backend Environment Variables

Set on your deployment platform:

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/9tangle

# PostgreSQL
DB_NAME=9tangle
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=your_db_host.com
DB_PORT=5432

# JWT
JWT_SECRET=your_very_long_random_secret_key

# Email (Optional but recommended)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@9tangle.com

# URLs
FRONTEND_URL=https://your-domain.com
```

### Database Migration to Cloud

#### MongoDB Atlas
1. Go to mongodb.com
2. Create free cluster
3. Create database user
4. Get connection string
5. Update MONGODB_URI

#### PostgreSQL Cloud (AWS RDS, Azure, etc.)
1. Create managed database instance
2. Set security groups
3. Create database and user
4. Update DB_* variables

### Domain & SSL Setup

1. Buy domain from registrar (GoDaddy, Namecheap, etc.)
2. Point to your deployment:
   - Frontend: Vercel (auto setup)
   - Backend: Your cloud provider
3. SSL auto-enabled by platforms

### GitHub Actions (Auto-Deploy)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Backend API responds
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Courses display correctly
- [ ] File uploads work
- [ ] Admin panel accessible
- [ ] Database connections working
- [ ] SSL certificate active

### Monitoring & Logging

#### Frontend (Vercel)
- Built-in analytics
- Error tracking
- Performance metrics

#### Backend
- Add PM2 for process management
- Set up logging service (e.g., Loggly, DataDog)
- Monitor database performance

### Backup & Disaster Recovery

```bash
# MongoDB backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/9tangle"

# PostgreSQL backup
pg_dump -h host -U user -d 9tangle > backup.sql

# Restore
psql -h host -U user -d 9tangle < backup.sql
```

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Optimize images
   - Cache static assets

2. **Backend**
   - Enable database indexing
   - Implement caching
   - Use CDN for assets

3. **Database**
   - Regular backups
   - Query optimization
   - Connection pooling

### Security for Production

- [ ] Change all default passwords
- [ ] Set strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable CORS only for your domain
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Use environment variables securely

### Scaling Considerations

- Use load balancer for multiple backend instances
- Database replication for reliability
- CDN for static content delivery
- Caching layer (Redis)
- Message queue (RabbitMQ) for async tasks

## Cost Estimation

### Minimal Setup
- Vercel (Frontend): Free tier
- Railway (Backend): ~$5/month
- MongoDB Atlas: Free tier
- PostgreSQL: ~$15/month
- **Total: ~$20/month**

### Production Setup
- Vercel (Pro): $20/month
- Railway: ~$50/month
- MongoDB Atlas (M10): ~$60/month
- PostgreSQL (larger instance): ~$100/month
- Domain: ~$12/year
- **Total: ~$230/month**

## Rollback Procedure

If deployment fails:

```bash
# Vercel - automatic rollback available
vercel rollback

# Railway
railway up [previous-version]

# Manually
git revert <commit-hash>
git push
```

## Support & Monitoring

1. Set up error alerts
2. Monitor uptime
3. Track performance metrics
4. Set up automated backups
5. Document deployment process

---

For detailed information, refer to each platform's documentation.
