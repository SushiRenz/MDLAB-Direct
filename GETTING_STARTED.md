# 🚀 MDLAB Direct - Getting Started Guide

## Your Project is Now Integrated! 🎉

You now have one unified project with three parts:
- 🖥️ **Backend** - API Server
- 💻 **Frontend** - Web Dashboard  
- 📱 **Mobile** - Patient App

## 📂 What Changed?

### Before:
```
Desktop/
├── MDLAB-Direct/
│   ├── backend/
│   └── frontend/
└── YourExpoProject/  (separate folder)
```

### After:
```
Desktop/
└── MDLAB-Direct/
    ├── backend/
    ├── frontend/
    ├── mobile/        ← Your Expo app is now here!
    ├── package.json   ← New: Manages all three
    ├── start.ps1      ← New: Easy startup script
    └── README.md      ← New: Complete documentation
```

## 🎯 How to Use

### Method 1: Quick Start Script (Easiest!) 🌟

1. **Right-click** on `start.ps1`
2. Select **"Run with PowerShell"**
3. Choose from the menu:
   - Press `1` for everything
   - Press `2` for backend + web
   - Press `3` for backend + mobile
   - Press `7` to install dependencies first

### Method 2: Command Line

Open PowerShell in the project root folder:

```powershell
# Start everything at once
npm run dev

# Or start individually
npm run backend     # Backend only
npm run frontend    # Web only
npm run mobile      # Mobile only
```

## 📱 Testing Your Mobile App

### On Your Phone:

1. **Install Expo Go**
   - iOS: Search "Expo Go" in App Store
   - Android: Search "Expo Go" in Play Store

2. **Start the mobile app**
   - Double-click `start.ps1` → Choose option `3` or `1`
   - OR run: `npm run mobile`

3. **Scan QR Code**
   - Open Expo Go on your phone
   - Scan the QR code shown in terminal
   - ⚠️ **Important:** Phone and computer must be on same WiFi!

4. **Test Features:**
   - Register new patient account
   - Browse lab services
   - Book appointments
   - View test results

## 🌐 URLs & Access

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://192.168.1.112:5000 | API Server |
| Web Dashboard | http://localhost:5173 | Staff Portal |
| Mobile App | Expo Go | Patient Portal |

## 🔑 Test Accounts

### Web Dashboard (http://localhost:5173)

**Owner:**
- Username: `admin@mdlab.com`
- Password: (your admin password)

**Receptionist:**
- Username: `receptionist@mdlab.com`
- Password: (your receptionist password)

### Mobile App (Expo Go)

**Patient:**
- Register a new account in the app
- OR use existing patient credentials

## ⚙️ Configuration Check

### Is your backend IP correct?

1. Open Command Prompt and run:
   ```cmd
   ipconfig
   ```

2. Look for "IPv4 Address" under your active network adapter

3. **If IP changed** from `192.168.1.112`:
   - Update in `mobile/services/api.ts`:
     ```typescript
     const BACKEND_IP = 'YOUR.NEW.IP.HERE';
     ```

## 🛠️ First Time Setup

If you haven't installed dependencies yet:

```powershell
# Method 1: Use the script
# Double-click start.ps1 → Choose option 7

# Method 2: Command line
npm run install-all
```

This installs dependencies for:
- ✅ Backend (Node.js packages)
- ✅ Frontend (React packages)
- ✅ Mobile (Expo packages)

## 🐛 Common Issues

### "Backend not running" error in mobile app

**Solution:**
1. Make sure backend is started first
2. Check if backend IP is correct
3. Verify phone and computer on same WiFi

### QR Code not scanning

**Solution:**
1. Try pressing `r` in terminal to reload
2. Or manually type the URL shown in Expo Go

### "Network request failed"

**Solution:**
1. Check Windows Firewall - allow port 5000
2. Verify backend is running
3. Update IP in mobile/services/api.ts

### Mobile app won't start

**Solution:**
1. Delete `mobile/node_modules` folder
2. Run: `cd mobile && npm install`
3. Try again: `npm start`

## 📚 Documentation

- **Full README:** See `README.md` in root folder
- **Backend Docs:** Check `backend/` folder
- **Frontend Docs:** Check `frontend/` folder  
- **Mobile Docs:** Check `mobile/` folder

## 🎓 Quick Command Reference

```powershell
# From root folder:
npm run dev                  # Start all services
npm run backend              # Backend only
npm run frontend             # Web only
npm run mobile               # Mobile only
npm run install-all          # Install all dependencies

# Or use the convenient start.ps1 script!
```

## ✅ Verify Everything Works

### Step-by-Step Test:

1. **Start Backend** (option 4 in start.ps1)
   - Should see: "Server running on port 5000"
   - Should see: "MongoDB connected"

2. **Start Web Dashboard** (option 5 in start.ps1)
   - Should open: http://localhost:5173
   - Try logging in as Owner

3. **Start Mobile App** (option 6 in start.ps1)
   - Scan QR code with Expo Go
   - Should load the app on your phone

4. **Test Integration:**
   - Create appointment in mobile app
   - Check if it appears in web dashboard (Receptionist > Appointments)
   - Create payment in web dashboard
   - Verify in Owner > Payments

## 🎉 You're All Set!

Your project is now:
- ✅ Organized in one place
- ✅ Easy to start with one script
- ✅ Fully documented
- ✅ Ready for development

### Need Help?

- Check `README.md` for detailed info
- Review error messages in terminal
- Verify all services are running
- Check network configuration

---

**Happy Coding! 🚀**

*Last Updated: November 6, 2025*
