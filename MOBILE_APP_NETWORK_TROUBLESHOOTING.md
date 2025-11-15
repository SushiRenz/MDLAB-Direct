# Mobile App Network Troubleshooting Guide

This guide helps you fix network connection issues between the mobile app (Expo Go) and the backend server.

## Common Errors

### Error 1: "AxiosError: Network Error"
### Error 2: "Registration failed" / "Login failed"

These errors occur when the mobile app cannot connect to your backend server.

---

## 🔧 Quick Fixes (Try These First)

### 1. ✅ Make Sure Backend Server is Running

```powershell
# In backend folder
cd backend
npm start
```

**You should see:**
```
Server running on port 5000
MongoDB connected
```

### 2. 🌐 Verify Same WiFi Network

**CRITICAL:** Your mobile device and computer MUST be on the SAME WiFi network!

- Check your computer's WiFi network name
- Check your phone's WiFi network name
- They must match exactly

### 3. 🔢 Update IP Address in Mobile App

#### Step 1: Find Your Computer's IP Address

**On Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.112`)

**On Mac/Linux:**
```bash
ifconfig
```
Look for "inet" under en0 or wlan0 (e.g., `192.168.1.112`)

#### Step 2: Update the IP in Mobile App

Open: `mobile/services/api.ts`

```typescript
// UPDATE THIS LINE with your computer's IP:
const BACKEND_IP = '192.168.1.112'; // <- Change this!
```

#### Step 3: Restart Expo

After changing the IP address:
1. Stop Expo (Ctrl+C in terminal)
2. Restart: `npm start`
3. Shake your phone to reload the app

---

## 🔍 Detailed Troubleshooting Steps

### Step 1: Check Backend Server

```powershell
# Make sure backend is running
cd backend
npm start
```

**Verify it's listening:**
```powershell
netstat -ano | findstr ":5000"
```

You should see:
```
TCP    0.0.0.0:5000    ...    LISTENING
```

### Step 2: Test Backend from Browser

Open in your computer's browser:
```
http://localhost:5000/api/auth/login
```

You should see a response (even if it's an error - that's OK, it means the server is running)

### Step 3: Check Firewall Settings

**Windows Firewall:**
1. Search for "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Find "Node.js" - make sure both Private and Public are checked
4. If not listed, click "Allow another app" and add Node.js

**Or temporarily disable firewall to test:**
```powershell
# Run as Administrator
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
# Remember to re-enable after testing!
```

### Step 4: Verify Network Configuration

**Check if device can reach your computer:**

1. On your phone, open Safari/Chrome
2. Try to access: `http://YOUR_COMPUTER_IP:5000`
   - Example: `http://192.168.1.112:5000`
3. You should see some response from the server

If this doesn't work, the problem is network connectivity, not the app!

### Step 5: Check Mobile App Configuration

Open `mobile/services/api.ts`:

```typescript
const getApiBaseUrl = () => {
  const BACKEND_PORT = '5000';
  const BACKEND_IP = '192.168.1.112'; // ← MUST match your computer's IP!
  
  return `http://${BACKEND_IP}:${BACKEND_PORT}/api`;
};
```

**Common mistakes:**
- ❌ Using `localhost` or `127.0.0.1` (this is the phone, not your computer!)
- ❌ Using old IP address (IP can change after router restart)
- ❌ Wrong port number
- ❌ Missing `http://` or adding `https://`

### Step 6: Test with Network Diagnostics

Add this code to test connectivity:

```typescript
import { NetworkDiagnostics } from '@/utils/networkDiagnostics';

// Run diagnostics
const diagnostics = await NetworkDiagnostics.runFullDiagnostics('http://192.168.1.112:5000/api');

console.log('Internet:', diagnostics.internet.message);
console.log('Backend:', diagnostics.backend.message);
console.log('Auth:', diagnostics.auth.message);
```

---

## 🐛 Common Issues & Solutions

### Issue: "ECONNREFUSED"
**Cause:** Backend server is not running or wrong IP/port

**Solutions:**
1. Start backend server: `cd backend && npm start`
2. Verify IP address in `api.ts`
3. Check firewall isn't blocking port 5000

---

### Issue: "ETIMEDOUT" / "Connection timeout"
**Cause:** Server is unreachable

**Solutions:**
1. Verify same WiFi network
2. Check IP address is correct
3. Disable VPN if active
4. Check firewall settings

---

### Issue: "Network Error"
**Cause:** Device cannot reach server

**Solutions:**
1. ✅ Verify SAME WiFi network
2. ✅ Update IP address in `api.ts`
3. ✅ Restart Expo after changing IP
4. ✅ Check firewall settings

---

### Issue: "Validation failed" / 400 errors
**Cause:** Data sent doesn't meet backend requirements

**Solutions:**
1. Check backend console logs for validation details
2. Make sure all required fields are filled
3. Phone number format (if provided) should be valid
4. Password must have uppercase, lowercase, and number

---

### Issue: Works on one WiFi but not another
**Cause:** IP address changes between networks

**Solution:**
1. Find new IP address: `ipconfig` or `ifconfig`
2. Update `BACKEND_IP` in `mobile/services/api.ts`
3. Restart Expo

---

## ✅ Verification Checklist

Before testing registration/login:

- [ ] Backend server is running (`npm start` in backend folder)
- [ ] Backend shows "Server running on port 5000"
- [ ] MongoDB is connected
- [ ] Phone and computer on SAME WiFi network
- [ ] IP address in `api.ts` matches computer's IP
- [ ] Firewall allows Node.js / port 5000
- [ ] Expo app restarted after IP change
- [ ] Can access `http://YOUR_IP:5000` from phone's browser

---

## 🔬 Advanced Debugging

### Enable Detailed Logging

In `mobile/services/api.ts`, the enhanced error handling now shows:

```typescript
console.error('❌ REGISTRATION ERROR DETAILS:');
console.error('   Error type:', error.constructor.name);
console.error('   Error code:', error.code);
console.error('   Error message:', error.message);
console.error('   Response status:', error.response?.status);
console.error('   Response data:', JSON.stringify(error.response?.data, null, 2));
```

Check Expo console for these detailed error messages!

### Test Backend Directly

Use Postman, Thunder Client, or curl:

```bash
# Test registration
curl -X POST http://YOUR_IP:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123",
    "address": "123 Test St"
  }'
```

---

## 📱 Quick Reference

### Find Computer's IP
```powershell
# Windows
ipconfig

# Mac/Linux
ifconfig
```

### Check Backend is Running
```powershell
# Check if port 5000 is listening
netstat -ano | findstr ":5000"
```

### Restart Everything (Clean Slate)
```powershell
# 1. Stop backend (Ctrl+C)
# 2. Stop Expo (Ctrl+C)

# 3. Start backend
cd backend
npm start

# 4. In new terminal, start Expo
cd mobile
npm start

# 5. On phone: Shake device → Reload
```

---

## 💡 Pro Tips

1. **IP Address Changes:** Your computer's IP may change when:
   - Router restarts
   - You reconnect to WiFi
   - You switch networks

2. **Always Use Your Actual IP:** Never use `localhost`, `127.0.0.1`, or `0.0.0.0` in mobile app config

3. **Phone Number Validation:** Phone number is optional, but if provided, it accepts:
   - Philippine format: `+639123456789`, `09123456789`
   - International format: `+1234567890`
   - Various formats with spaces/dashes: `+63 912 345 6789`

4. **Keep Backend Terminal Open:** You can see incoming requests in real-time

5. **Check Backend Logs:** When registration/login fails, backend console shows detailed error messages

---

## 🆘 Still Not Working?

1. **Check backend console** for error messages
2. **Check Expo console** for detailed error logs  
3. **Verify all checklist items** above
4. **Try accessing backend from phone's browser** first
5. **Restart router** if nothing else works
6. **Check if computer's firewall** is blocking connections

---

## 📝 What Was Fixed

### Backend Changes:
1. **Phone validation made more flexible** - Now accepts various phone formats or can be left empty
2. **Better error messages** - Backend returns detailed validation errors

### Mobile App Changes:
1. **Enhanced error handling** - Shows specific network error messages with solutions
2. **Detailed logging** - Console shows exactly what went wrong
3. **Network diagnostics utility** - Can test connection programmatically
4. **Better user feedback** - Error messages guide users to fix the issue

---

## Example: Successful Setup

```
✅ Backend running on: http://192.168.1.112:5000
✅ Mobile app configured: BACKEND_IP = '192.168.1.112'
✅ Both on WiFi: "MyHomeWiFi"
✅ Firewall allows Node.js
✅ Can access http://192.168.1.112:5000 from phone browser

Result: Registration and login work perfectly! 🎉
```
