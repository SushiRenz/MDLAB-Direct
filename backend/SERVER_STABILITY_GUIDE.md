# 🔧 Server Stability & Troubleshooting Guide

## 🚨 **Common Causes of Server Shutdowns**

### **1. Unhandled Promise Rejections**
- **What happens**: MongoDB connection issues, async errors
- **Solution**: Enhanced error handling added (server won't crash in development)

### **2. Memory Leaks**
- **What happens**: Server runs out of memory over time
- **Solution**: Monitor memory usage via `/api/health` endpoint

### **3. MongoDB Connection Issues**
- **What happens**: Database disconnects, server loses connection
- **Solution**: Auto-reconnection logic and connection monitoring added

### **4. Windows-specific Issues**
- **What happens**: Console closes, Ctrl+C handling
- **Solution**: Windows-specific signal handling added

---

## ✅ **Fixes Applied**

### **Enhanced Error Handling**
```javascript
// Now logs errors but continues running in development
process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Promise Rejection:', err.message);
  // Only crashes in production, continues in development
});
```

### **MongoDB Stability**
```javascript
// Better connection options
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
};
```

### **Graceful Shutdown**
```javascript
// Handles SIGTERM, SIGINT properly
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### **Server Timeouts**
```javascript
// Prevents hanging connections
server.timeout = 120000; // 2 minutes
server.keepAliveTimeout = 65000; // 65 seconds
```

---

## 🔍 **Monitoring Tools**

### **1. Enhanced Health Check**
```bash
# Check server status
npm run health
```

### **2. Server Monitor (NEW)**
```bash
# Start server with monitoring
npm run dev:monitor

# Or run monitor separately
npm run monitor
```

### **3. Windows Server Manager (NEW)**
```bash
# Double-click to run
server-manager.bat
```

---

## 🛠️ **Usage Instructions**

### **For Development:**
```bash
# Option 1: Normal development (with auto-restart)
npm run dev

# Option 2: Development with health monitoring
npm run dev:monitor

# Option 3: Use Windows Server Manager
# Double-click server-manager.bat and choose option 2
```

### **For Production:**
```bash
# Install PM2 for production
npm install -g pm2

# Start with PM2 (auto-restart, logging)
pm2 start server.js --name mdlab-backend

# Monitor with PM2
pm2 monit
pm2 logs mdlab-backend
```

---

## 🔧 **Troubleshooting Steps**

### **If Server Still Crashes:**

1. **Check Windows Event Logs**
   - Open Event Viewer
   - Look for Node.js application errors

2. **Check Memory Usage**
   - Visit: `http://localhost:5000/api/health`
   - Monitor memory usage over time

3. **Check MongoDB Status**
   - Ensure MongoDB service is running
   - Check MongoDB logs for errors

4. **Use Process Monitor**
   - Install Process Monitor (ProcMon)
   - Monitor file/registry access

5. **Check for Port Conflicts**
   ```bash
   netstat -ano | findstr :5000
   ```

### **Emergency Recovery:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Kill specific port processes
for /f "tokens=5" %a in ('netstat -aon ^| findstr :5000') do taskkill /F /PID %a

# Restart MongoDB service
net stop MongoDB
net start MongoDB
```

---

## 📊 **Monitoring Endpoints**

- **Health Check**: `GET /api/health` - Full system status
- **Simple Ping**: `GET /api/ping` - Keep-alive check
- **Monitor Script**: Automatic health checking every 30 seconds

---

## 🎯 **Best Practices**

1. **Always use `npm run dev:monitor` during development**
2. **Check health endpoint regularly**
3. **Use PM2 for production deployment**
4. **Monitor memory usage trends**
5. **Keep MongoDB service running**
6. **Use the Windows Server Manager for easy control**

---

## 🆘 **Still Having Issues?**

If the server continues to shut down:

1. Run with monitor: `npm run dev:monitor`
2. Check the console output for error patterns
3. Note the exact time of shutdown
4. Check if it correlates with specific user actions
5. Monitor the `/api/health` endpoint for memory/connection issues

The enhanced error handling should prevent most crashes and provide better logging to identify the root cause.