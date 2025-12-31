# ⚡ Quick Command Reference

## 🚀 Start Applications

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Admin Panel
cd admin-panel
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

## 🌐 Access URLs

- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3001
- Frontend: http://localhost:3000

## 🔍 Check for Errors

```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# View logs
# Backend logs will show in Terminal 1
# Admin logs will show in Terminal 2
# Frontend logs will show in Terminal 3
```

## 🧪 Quick Test Commands

```bash
# Test backend health
curl http://localhost:5000/api/health

# Check if admin panel is running
curl http://localhost:3001

# Check if frontend is running
curl http://localhost:3000
```

## 📖 Quick Documentation Access

| Need | Read This |
|------|-----------|
| Quick start | `README_OBJECT_FIX.md` |
| Complete solution | `FINAL_SOLUTION_SUMMARY.md` |
| Debugging | `HOW_TO_DEBUG_OBJECT_ERRORS.md` |
| Code examples | `USAGE_EXAMPLES.md` |
| Testing | `TEST_THE_FIX.md` |

## 🛠️ Quick Fixes

### Fix Object Rendering Error

```tsx
// ❌ Wrong
<div>{user}</div>

// ✅ Correct (choose one)
<div>{user?.name}</div>                    // Method 1
<SafeText value={user} />                   // Method 2
<div>{toText(user)}</div>                   // Method 3
```

### Import Statements

```tsx
// For SafeText component
import SafeText from '@/components/SafeText';

// For toText utility
import { toText, safeGet } from '@/lib/utils';
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Kill the process or use different port |
| Module not found | Run `npm install` |
| Build error | Delete `.next` folder and restart |
| API not responding | Check backend is running on port 5000 |

## ⌨️ Keyboard Shortcuts

- **F12** - Open Developer Tools
- **Ctrl+Shift+C** - Inspect element
- **Ctrl+Shift+J** - Open console
- **Ctrl+R** - Reload page
- **Ctrl+Shift+R** - Hard reload

## 📋 Testing Checklist

- [ ] Backend started
- [ ] Admin panel started  
- [ ] Frontend started
- [ ] All pages load
- [ ] No console errors
- [ ] User data displays
- [ ] Error Boundary tested

## 🎯 Quick Actions

```bash
# Stop all servers: Ctrl+C in each terminal

# Restart after code changes
# (Admin & Frontend auto-reload with hot reload)
# Backend: Restart manually with npm start

# Clean build
cd admin-panel
rm -rf .next
npm run dev

cd frontend  
rm -rf .next
npm run dev
```

## 🔧 Troubleshooting

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version (should be 18+)
node --version
```
