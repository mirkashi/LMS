# 🛠️ Maintenance & Troubleshooting Guide - 9tangle LMS

Complete guide for maintaining, monitoring, and troubleshooting your LMS in production.

---

## 📊 Monitoring & Health Checks

### System Health Endpoint

Add to `backend/routes/adminRoutes.js`:

```javascript
// GET /admin/health
router.get('/health', (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
    mongodb: mongoConnected ? 'CONNECTED' : 'DISCONNECTED',
    postgresql: pgConnected ? 'CONNECTED' : 'DISCONNECTED',
    memory: process.memoryUsage(),
  };
  
  res.json(health);
});
```

Monitor with:
```bash
# Check every 5 minutes
*/5 * * * * curl https://yourdomain.com/api/admin/health

# Or use monitoring service
# - Uptime Robot (https://uptimerobot.com)
# - Status Page (https://www.statuspage.io)
```

---

## 🔍 Monitoring Checklist

### Daily Checks
- [ ] Check error logs for critical errors
- [ ] Verify database connections are healthy
- [ ] Check disk space on server
- [ ] Review failed authentication attempts
- [ ] Check email delivery status
- [ ] Monitor API response times

### Weekly Checks
- [ ] Review server CPU/Memory usage
- [ ] Check database backup completion
- [ ] Review user activity trends
- [ ] Verify SSL certificate validity
- [ ] Check third-party service status (Stripe, Email, etc.)
- [ ] Review payment transactions

### Monthly Checks
- [ ] Database optimization (VACUUM, REINDEX)
- [ ] Security audit logs
- [ ] Review and update dependencies
- [ ] Performance analysis
- [ ] Backup recovery test
- [ ] Review failed payments and refunds

---

## 🐛 Common Issues & Solutions

### Issue 1: High Memory Usage

**Symptoms:**
- Server becomes slow
- Process crashes
- OutOfMemory errors

**Solutions:**
```javascript
// 1. Add memory monitoring
const memWatch = require('@airbnb/node-memwatch');
memWatch.on('leak', (info) => {
  console.error('Memory leak detected:', info);
});

// 2. Implement request timeout
app.use(timeout('5s'));

// 3. Optimize queries
// ❌ Bad: Load all data
const courses = await Course.find();

// ✅ Good: Paginate
const courses = await Course.find()
  .limit(10)
  .skip((page - 1) * 10);

// 4. Clear cache periodically
setInterval(() => {
  cache.clear();
}, 60000); // Clear every minute
```

### Issue 2: Database Connection Drops

**Symptoms:**
- "Cannot connect to MongoDB"
- "Connection refused" errors
- Intermittent API failures

**Solutions:**
```javascript
// 1. Add connection retry logic
const connectDB = async (retries = 5) => {
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
      break;
    } catch (error) {
      retries--;
      console.log(`Retry ${5 - retries}...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

// 2. Implement connection pooling
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// 3. Monitor connection health
mongoose.connection.on('error', (err) => {
  console.error('Database error:', err);
  // Send alert
});

mongoose.connection.on('disconnected', () => {
  console.error('Database disconnected');
  // Attempt reconnection
});
```

### Issue 3: Email Not Sending

**Symptoms:**
- Users not receiving verification emails
- Verification token appears valid but email is missing
- SMTP connection timeout

**Solutions:**
```javascript
// 1. Check email service configuration
if (!process.env.EMAIL_SERVICE) {
  throw new Error('EMAIL_SERVICE not configured');
}

// 2. Test email configuration
const testEmail = async () => {
  try {
    const transporter = createTransporter();
    const info = await transporter.verify();
    console.log('Email service ready:', info);
  } catch (error) {
    console.error('Email service error:', error);
  }
};

// 3. Add retry logic for failed emails
const sendEmailWithRetry = async (to, subject, html, retries = 3) => {
  while (retries > 0) {
    try {
      return await transporter.sendMail({ to, subject, html });
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

// 4. Log email operations
console.log(`Sending email to ${to} at ${new Date().toISOString()}`);
```

### Issue 4: Slow API Responses

**Symptoms:**
- API takes > 1 second to respond
- Users report slow loading
- Database queries take long time

**Solutions:**
```javascript
// 1. Add database indexes
// In MongoDB:
db.courses.createIndex({ category: 1 });
db.users.createIndex({ email: 1 });
db.orders.createIndex({ createdAt: -1 });

// In PostgreSQL:
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

// 2. Implement request caching
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

app.get('/courses', (req, res) => {
  const cacheKey = `courses_${req.query.category}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);
  
  // Fetch data...
  cache.set(cacheKey, data);
  res.json(data);
});

// 3. Optimize queries with select/projection
// ❌ Bad
const course = await Course.findById(id);

// ✅ Good
const course = await Course.findById(id).select('title price category');

// 4. Add response compression
const compression = require('compression');
app.use(compression());

// 5. Use pagination
app.get('/courses', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const courses = await Course.find()
    .limit(limit * 1)
    .skip((page - 1) * limit);
  res.json({ courses, page, total: await Course.countDocuments() });
});
```

### Issue 5: Payment Failures

**Symptoms:**
- Users unable to complete purchase
- Stripe/PayPal errors
- Orders stuck in pending state

**Solutions:**
```javascript
// 1. Implement payment retry logic
const processPayment = async (stripeToken, amount, retries = 3) => {
  while (retries > 0) {
    try {
      return await stripe.charges.create({
        amount: amount * 100,
        currency: 'usd',
        source: stripeToken,
      });
    } catch (error) {
      retries--;
      if (error.code === 'card_declined') {
        throw new Error('Card declined');
      }
      if (retries === 0) throw error;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

// 2. Handle webhook notifications
app.post('/webhooks/stripe', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'charge.succeeded':
      updateOrderStatus(event.data.object.metadata.orderId, 'completed');
      break;
    case 'charge.failed':
      updateOrderStatus(event.data.object.metadata.orderId, 'failed');
      break;
  }
  
  res.json({ received: true });
});

// 3. Store payment attempts
await PaymentAttempt.create({
  orderId,
  stripeId,
  amount,
  status: 'failed',
  error: error.message,
  timestamp: new Date(),
});
```

### Issue 6: Authentication Failures

**Symptoms:**
- "Invalid token" errors
- Logout doesn't work
- Login redirects to login page

**Solutions:**
```javascript
// 1. Verify JWT configuration
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is too short');
}

// 2. Check token expiration
const decoded = jwt.decode(token);
console.log('Token expires at:', new Date(decoded.exp * 1000));

// 3. Verify CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 4. Test token generation
const testToken = jwt.sign(
  { userId: 'test', role: 'user' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
console.log('Generated token:', testToken);
```

---

## 🚨 Emergency Procedures

### Server Down

1. **Check server status**
   ```bash
   ps aux | grep node
   systemctl status lms-backend
   ```

2. **Check error logs**
   ```bash
   tail -f /var/log/lms/error.log
   docker logs lms-backend
   ```

3. **Restart server**
   ```bash
   systemctl restart lms-backend
   # Or
   docker restart lms-backend
   ```

4. **Check dependencies**
   ```bash
   npm list --depth=0
   npm audit
   ```

### Database Down

1. **Check MongoDB**
   ```bash
   mongo --eval "db.adminCommand('ping')"
   ```

2. **Check PostgreSQL**
   ```bash
   psql -U postgres -c "SELECT 1"
   ```

3. **Restore from backup**
   ```bash
   # MongoDB
   mongorestore --uri="mongodb://..." backup/

   # PostgreSQL
   psql -U postgres < backup.sql
   ```

### High Load/DDoS

1. **Implement rate limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

2. **Check server metrics**
   ```bash
   top
   vmstat 1 5
   iotop
   ```

3. **Scale horizontally**
   - Add more server instances
   - Use load balancer (Nginx, HAProxy)
   - Enable caching (Redis, Memcached)

---

## 📦 Backup & Recovery

### Automated Daily Backup

Create `scripts/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup MongoDB
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongo_$DATE"

# Backup PostgreSQL
pg_dump -U postgres lms_database > "$BACKUP_DIR/postgres_$DATE.sql"

# Compress backups
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/mongo_$DATE" "$BACKUP_DIR/postgres_$DATE.sql"

# Delete backups older than 30 days
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.tar.gz"
```

Schedule with cron:
```bash
# Daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Restore from Backup

```bash
# Extract backup
tar -xzf backup_20250113_020000.tar.gz

# Restore MongoDB
mongorestore --drop ./backup_20250113_020000/mongo_*

# Restore PostgreSQL
psql -U postgres lms_database < postgres_20250113_020000.sql
```

---

## 🔒 Security Maintenance

### Weekly Security Tasks

- [ ] Check for failed login attempts
- [ ] Review admin activity logs
- [ ] Check for suspicious file uploads
- [ ] Verify firewall rules
- [ ] Update SSL certificate (if close to expiry)

### Monthly Security Tasks

- [ ] Update dependencies
  ```bash
  npm audit
  npm update
  ```

- [ ] Rotate secrets
  ```bash
  # Generate new JWT_SECRET
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] Review user permissions
- [ ] Check for SQL injection attempts
- [ ] Verify 2FA is working

### Yearly Security Tasks

- [ ] Full security audit
- [ ] Penetration testing
- [ ] Backup security review
- [ ] Disaster recovery drill
- [ ] Update security policies

---

## 📈 Performance Optimization

### Database Optimization

```javascript
// 1. Add database indexes
// Course lookup by ID
db.courses.createIndex({ _id: 1 });

// User email verification
db.users.createIndex({ email: 1, isEmailVerified: 1 });

// Orders by status
db.orders.createIndex({ status: 1, createdAt: -1 });

// 2. Clean up old data
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

// Remove expired password reset tokens
db.users.updateMany(
  { resetTokenExpiry: { $lt: thirtyDaysAgo } },
  { $unset: { resetToken: "", resetTokenExpiry: "" } }
);

// Archive old orders
db.orders.moveMany(
  { createdAt: { $lt: thirtyDaysAgo }, status: 'completed' },
  { database: 'archive' }
);
```

### API Optimization

```javascript
// 1. Implement pagination
app.get('/api/courses', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const [courses, total] = await Promise.all([
    Course.find().skip(skip).limit(limit),
    Course.countDocuments(),
  ]);
  
  res.json({
    courses,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

// 2. Use field projection
app.get('/api/courses/:id', async (req, res) => {
  const course = await Course.findById(req.params.id).select('title price category');
  res.json(course);
});

// 3. Add response caching
const getCoursesWithCache = async () => {
  const key = 'courses_list';
  const cached = cache.get(key);
  if (cached) return cached;
  
  const courses = await Course.find();
  cache.set(key, courses, 300); // 5 minute TTL
  return courses;
};
```

### Frontend Optimization

```javascript
// 1. Lazy load images
<img src={course.image} loading="lazy" alt={course.title} />

// 2. Code splitting
const AdminPanel = dynamic(() => import('../components/AdminPanel'));

// 3. Optimize bundle
// next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
};
```

---

## 📊 Logging Best Practices

### Structured Logging

```javascript
const logger = require('winston');

// Log format
logger.log({
  level: 'info',
  message: 'User registered',
  userId: user._id,
  email: user.email,
  timestamp: new Date(),
  env: process.env.NODE_ENV,
});

// Different log levels
logger.error('Critical error'); // errors
logger.warn('Warning message');  // warnings
logger.info('Info message');     // info
logger.debug('Debug message');   // debug
```

### Log Files

```bash
# Check logs
tail -f /var/log/lms/error.log
tail -f /var/log/lms/access.log

# Search logs
grep "error" /var/log/lms/error.log
grep "user_id:123" /var/log/lms/access.log
```

---

## 🔧 Maintenance Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Staging environment tested
- [ ] Backups created
- [ ] Rollback plan documented
- [ ] Monitoring configured
- [ ] Team notified

### Post-Deployment
- [ ] Verify all features working
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Verify backups
- [ ] Update documentation
- [ ] Notify stakeholders

### Monthly Maintenance
- [ ] Database optimization
- [ ] Log rotation/archival
- [ ] Dependency updates
- [ ] Security audit
- [ ] Performance review
- [ ] Backup testing

### Quarterly Maintenance
- [ ] Full system audit
- [ ] Capacity planning
- [ ] Disaster recovery test
- [ ] Security assessment
- [ ] Performance optimization
- [ ] Documentation review

---

## 📞 Support & Escalation

### Issue Severity Levels

| Level | Response Time | Example |
|-------|---------------|---------|
| Critical | 15 minutes | Database down, payment processing down |
| High | 1 hour | API responses slow, email not sending |
| Medium | 4 hours | Feature bug, UI issue |
| Low | 1 day | Documentation error, minor UI polish |

### Escalation Path

1. **Level 1:** Try basic troubleshooting (restart, logs)
2. **Level 2:** Check server resources and dependencies
3. **Level 3:** Restore from backup or failover
4. **Level 4:** Contact hosting provider, third-party services

---

## 📚 Documentation

Keep these documents updated:
- [ ] API documentation
- [ ] Architecture diagram
- [ ] Deployment runbook
- [ ] Incident response plan
- [ ] Team contact list
- [ ] Known issues list

---

**Maintenance & Troubleshooting Guide Complete! 🎉**
