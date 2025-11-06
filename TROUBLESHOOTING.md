# 🔧 MDLAB Direct - Troubleshooting Guide

## Common Issues & Solutions

---

## 🖥️ Backend Issues

### ❌ "MongoDB connection failed"

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
MongoDB connection error
```

**Solutions:**
1. **Check if MongoDB is running:**
   ```powershell
   # Check if mongod process is running
   Get-Process mongod
   ```

2. **Start MongoDB:**
   ```powershell
   # Method 1: As a service
   net start MongoDB
   
   # Method 2: Manual start
   mongod
   ```

3. **Verify MongoDB is accessible:**
   ```powershell
   # Connect using mongo shell
   mongo
   # or
   mongosh
   ```

---

### ❌ "Port 5000 already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. **Find what's using port 5000:**
   ```powershell
   netstat -ano | findstr :5000
   ```

2. **Kill the process:**
   ```powershell
   # Replace PID with the number from above
   taskkill /PID <PID> /F
   ```

3. **Or change port in backend/.env:**
   ```env
   PORT=5001  # Use different port
   ```

---

### ❌ "JWT_SECRET not defined"

**Symptoms:**
```
Error: JWT_SECRET must be defined
```

**Solution:**
Create or fix `backend/.env`:
```env
JWT_SECRET=your-super-secret-key-here-make-it-long-and-random
```

---

## 💻 Frontend Issues

### ❌ "Failed to fetch" or "Network Error"

**Symptoms:**
- Login not working
- API calls failing
- Console shows CORS errors

**Solutions:**
1. **Check if backend is running:**
   ```powershell
   # Visit in browser
   http://localhost:5000/api
   ```

2. **Verify API URL in frontend/.env:**
   ```env
   VITE_API_URL=http://192.168.1.112:5000/api
   ```

3. **Check CORS settings in backend:**
   - Open `backend/server.js`
   - Ensure CORS is enabled for your frontend URL

---

### ❌ "npm run dev not working"

**Symptoms:**
```
command not found: vite
```

**Solution:**
```powershell
cd frontend
npm install
npm run dev
```

---

### ❌ "White screen" or "Blank page"

**Solutions:**
1. **Check console for errors** (F12 in browser)
2. **Clear browser cache** (Ctrl + Shift + Delete)
3. **Rebuild:**
   ```powershell
   cd frontend
   rm -rf node_modules
   npm install
   npm run dev
   ```

---

## 📱 Mobile App Issues

### ❌ "Unable to connect to backend"

**Symptoms:**
```
Network request failed
[TypeError: Network request failed]
```

**Solutions:**

1. **Verify backend is running:**
   - Visit: http://192.168.1.112:5000/api
   - Should show API info

2. **Check your computer's IP:**
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address"

3. **Update IP in mobile/services/api.ts:**
   ```typescript
   const BACKEND_IP = 'YOUR.NEW.IP.HERE';
   ```

4. **Ensure same WiFi network:**
   - Phone and computer must be on same network
   - Disable VPN if active

5. **Check Windows Firewall:**
   ```powershell
   # Allow port 5000
   New-NetFirewallRule -DisplayName "MDLAB Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

---

### ❌ "Unable to resolve host"

**Symptoms:**
```
TypeError: Network request failed
getaddrinfo ENOTFOUND 192.168.1.112
```

**Solutions:**
1. **IP address changed** - Update in `mobile/services/api.ts`
2. **Backend not running** - Start backend first
3. **Firewall blocking** - Add exception for port 5000

---

### ❌ "Expo Go not loading app"

**Symptoms:**
- QR code scans but nothing happens
- "Something went wrong" error

**Solutions:**

1. **Restart Expo dev server:**
   ```powershell
   # Press Ctrl+C to stop
   cd mobile
   npm start
   ```

2. **Clear Expo cache:**
   ```powershell
   cd mobile
   npx expo start -c
   ```

3. **Reinstall dependencies:**
   ```powershell
   cd mobile
   rm -rf node_modules
   npm install
   ```

4. **Check Expo Go is latest version:**
   - Update Expo Go app from store

---

### ❌ "Red screen: Cannot find module"

**Symptoms:**
```
Error: Cannot find module './SomeComponent'
```

**Solutions:**
1. **Check file path and spelling**
2. **Restart metro bundler:**
   - Press `r` in terminal
   - Or shake phone → Reload

---

## 🔐 Authentication Issues

### ❌ "Invalid credentials" (but they're correct)

**Solutions:**
1. **Check database has the user:**
   ```javascript
   // In mongo shell
   use MDLAB_DIRECT
   db.users.find({ email: "your-email@example.com" })
   ```

2. **Password hashing issue:**
   - Re-register the user
   - Or reset password in database

---

### ❌ "Token expired" or "Unauthorized"

**Solutions:**
1. **Clear stored credentials:**
   
   **Web:**
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Refresh page and login again

   **Mobile:**
   - Logout and login again
   - Or clear app data in phone settings

---

## 📦 Dependency Issues

### ❌ "npm install fails"

**Solutions:**

1. **Clear npm cache:**
   ```powershell
   npm cache clean --force
   ```

2. **Delete package-lock and node_modules:**
   ```powershell
   rm package-lock.json
   rm -rf node_modules
   npm install
   ```

3. **Use correct Node version:**
   ```powershell
   node --version  # Should be v18 or higher
   ```

---

### ❌ "Module not found after install"

**Solution:**
```powershell
# Restart dev server
# Backend: Ctrl+C then npm start
# Frontend: Ctrl+C then npm run dev
# Mobile: Press r in terminal
```

---

## 🌐 Network Issues

### ❌ Mobile can't connect but web works

**Checklist:**
- [ ] Backend using 0.0.0.0 or your IP (not localhost)
- [ ] Phone on same WiFi as computer
- [ ] Firewall allows port 5000
- [ ] VPN disabled on both devices
- [ ] IP address is current in mobile/services/api.ts

**Test connection:**
```powershell
# From your phone's browser, visit:
http://192.168.1.112:5000/api
# Should show API info
```

---

### ❌ "CORS policy" errors

**Symptoms:**
```
Access to fetch at 'http://...' has been blocked by CORS policy
```

**Solution:**
Check `backend/server.js` CORS configuration:
```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.1.112:5173',
    'exp://192.168.1.112:8081'  // For Expo
  ],
  credentials: true
}));
```

---

## 💾 Database Issues

### ❌ "Duplicate key error"

**Symptoms:**
```
E11000 duplicate key error collection
```

**Solution:**
```javascript
// Remove duplicate in mongo shell
use MDLAB_DIRECT
db.users.remove({ email: "duplicate@email.com" }, { justOne: true })
```

---

### ❌ "Collection doesn't exist"

**Solution:**
```javascript
// Backend will create collections automatically
// Just restart backend server
```

---

## 🐛 Development Issues

### ❌ "Hot reload not working"

**Frontend:**
```powershell
# Delete .vite cache
cd frontend
rm -rf node_modules/.vite
npm run dev
```

**Mobile:**
```powershell
# Restart with cache clear
cd mobile
npx expo start -c
```

---

### ❌ "Changes not reflecting"

**Solutions:**
1. **Hard refresh browser:** Ctrl + Shift + R
2. **Restart dev server**
3. **Clear cache**
4. **Check you're editing correct file**

---

## 📱 Expo Specific Issues

### ❌ "Couldn't start project on Android"

**Solutions:**
1. **Install/update Android tools**
2. **Check USB debugging enabled**
3. **Try different USB cable**
4. **Use QR code instead**

---

### ❌ "Metro Bundler crashed"

**Solution:**
```powershell
cd mobile
npx expo start -c
# Press 'r' to reload
```

---

## 🚀 Performance Issues

### ❌ Backend slow to respond

**Solutions:**
1. **Check MongoDB queries** - Add indexes
2. **Reduce payload size** - Limit fields returned
3. **Enable caching**
4. **Check console for errors**

---

### ❌ Mobile app laggy

**Solutions:**
1. **Enable Hermes** (already enabled in Expo)
2. **Reduce re-renders** - Use React.memo
3. **Optimize images** - Use compressed formats
4. **Lazy load components**

---

## 🔍 Debugging Tips

### Enable Verbose Logging

**Backend:**
```javascript
// In backend/server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

**Mobile:**
```typescript
// In mobile/services/api.ts
console.log('Request:', config);
console.log('Response:', response);
```

---

### Check API Endpoints

```powershell
# Test with curl
curl http://localhost:5000/api/services

# Or visit in browser
http://localhost:5000/api
```

---

### View Database Content

```javascript
// In mongo shell
use MDLAB_DIRECT
db.users.find().pretty()
db.appointments.find().pretty()
db.testresults.find().pretty()
```

---

## 🆘 Still Having Issues?

### Systematic Troubleshooting:

1. **Restart everything:**
   ```powershell
   # Stop all services (Ctrl+C)
   # Restart in order:
   npm run backend
   # Wait for "Server running"
   npm run frontend
   # Wait for frontend to load
   npm run mobile
   ```

2. **Check logs for errors:**
   - Backend terminal
   - Frontend browser console (F12)
   - Mobile Expo DevTools

3. **Verify all services running:**
   - Backend: http://localhost:5000/api
   - Frontend: http://localhost:5173
   - Mobile: Expo DevTools open

4. **Test with minimal setup:**
   - Just backend + one frontend
   - Eliminate variables

5. **Check documentation:**
   - README.md
   - GETTING_STARTED.md
   - PROJECT_STRUCTURE.md

---

## 📝 Report an Issue

If you can't solve it, gather this info:

- [ ] What were you trying to do?
- [ ] What happened instead?
- [ ] Error messages (full text)
- [ ] Screenshots
- [ ] Steps to reproduce
- [ ] Which services are running?
- [ ] Node version: `node --version`
- [ ] npm version: `npm --version`

---

**Remember: Most issues are either network configuration or services not running in the right order!** 🎯

*Last Updated: November 6, 2025*
