# MDLAB Direct - Laboratory Management System

A complete laboratory management system with backend API, web dashboard, and mobile patient app.

## 📁 Project Structure

```
MDLAB-Direct/
├── backend/          # Node.js + Express API Server
├── frontend/         # React Web Dashboard (Owner, Receptionist, MedTech, Pathologist)
├── mobile/           # Expo React Native Mobile App (Patient Portal)
└── package.json      # Root package manager
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- MongoDB installed and running
- For mobile: Expo Go app on your phone OR Android Studio/Xcode for emulator

### 1. Install Dependencies

From the root directory, install all dependencies at once:

```bash
npm run install-all
```

Or install individually:
```bash
npm run install-backend
npm run install-frontend
npm run install-mobile
```

### 2. Configure Backend

1. Navigate to `backend` folder
2. Create `.env` file (or check existing one):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/MDLAB_DIRECT
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

3. Make sure MongoDB is running:
```bash
mongod
```

### 3. Run the Applications

#### Option A: Run All Services Together
```bash
npm run dev
```
This will open 3 terminal windows:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Mobile: Expo DevTools

#### Option B: Run Backend + Web Only
```bash
npm run dev:backend-web
```

#### Option C: Run Backend + Mobile Only
```bash
npm run dev:backend-mobile
```

#### Option D: Run Individually

**Backend:**
```bash
npm run backend
# Or: cd backend && npm start
```

**Frontend (Web Dashboard):**
```bash
npm run frontend
# Or: cd frontend && npm run dev
```

**Mobile (Patient App):**
```bash
npm run mobile
# Or: cd mobile && npm start
```

## 📱 Running the Mobile App

After starting the mobile app (`npm run mobile` or `cd mobile && npm start`):

1. **On Physical Device:**
   - Install "Expo Go" from App Store (iOS) or Play Store (Android)
   - Scan the QR code shown in terminal
   - Make sure your phone and computer are on the same WiFi network

2. **On Emulator:**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (Mac only)

3. **Web Browser (for testing):**
   - Press `w` to open in web browser

## 🌐 Network Configuration

The mobile app is configured to connect to your backend server.

**Current Backend IP:** `192.168.1.112:5000`

### To Update Backend IP for Mobile App:

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Edit `mobile/services/api.ts`:
   ```typescript
   const BACKEND_IP = '192.168.1.112'; // Change this to your IP
   ```

3. Restart the mobile app

## 👥 User Roles & Access

### Web Dashboard (`frontend/`)
- **Owner:** Full system access, payments, reports, user management
- **Receptionist:** Appointments, payments, patient registration
- **MedTech:** Test result entry, sample processing
- **Pathologist:** Test result verification, final approval

### Mobile App (`mobile/`)
- **Patient:** Book appointments, view test results, track history

## 🔧 Development

### Backend (Node.js + Express)
```bash
cd backend
npm start          # Start with nodemon (auto-restart)
npm run dev        # Alternative dev mode
```

**API Base URL:** `http://localhost:5000/api`

**Main Routes:**
- `/api/auth` - Authentication (login, register, profile)
- `/api/appointments` - Appointment management
- `/api/test-results` - Test results
- `/api/services` - Lab services/tests
- `/api/finance` - Payments, billing
- `/api/mobile-lab` - Mobile lab schedules

### Frontend (React + Vite)
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

**URL:** `http://localhost:5173`

### Mobile (Expo + React Native)
```bash
cd mobile
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
```

**Tech Stack:**
- Expo SDK ~54
- React Native 0.81
- Expo Router for navigation
- TypeScript
- Axios for API calls
- AsyncStorage for local data

## 📦 Key Dependencies

### Backend
- Express.js - Web framework
- Mongoose - MongoDB ORM
- JWT - Authentication
- bcrypt - Password hashing

### Frontend
- React 18
- Vite - Build tool
- Axios - HTTP client
- React Router - Navigation

### Mobile
- Expo SDK 54
- React Native 0.81
- Expo Router - File-based navigation
- AsyncStorage - Local storage
- Axios - API client

## 🗄️ Database

**MongoDB Database:** `MDLAB_DIRECT`

**Collections:**
- users
- appointments
- testresults
- services
- payments
- mobilelabschedules

## 🔐 Authentication

All three apps use JWT (JSON Web Token) authentication:

1. **Web Dashboard:** Token stored in localStorage
2. **Mobile App:** Token stored in AsyncStorage
3. **Backend:** Validates token in protected routes

**Token Header Format:**
```
Authorization: Bearer <token>
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/MDLAB_DIRECT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://192.168.1.112:5000/api
```

### Mobile
- API configuration in `mobile/services/api.ts`
- No .env file needed (hardcoded in code)

## 🐛 Troubleshooting

### Backend not starting
- Check if MongoDB is running: `mongod`
- Check if port 5000 is available
- Verify `.env` file exists

### Frontend can't connect to backend
- Check backend is running
- Verify VITE_API_URL in frontend/.env
- Check CORS settings in backend

### Mobile app can't connect
- Ensure phone and computer on same WiFi
- Update BACKEND_IP in mobile/services/api.ts
- Check firewall isn't blocking port 5000
- Backend must be accessible from network (not just localhost)

### "Network Error" in mobile app
- Computer IP changed? Update mobile/services/api.ts
- Backend not running? Start it first
- Firewall blocking? Allow port 5000

## 📱 Testing Mobile App

### Test Credentials
Use existing test accounts or create new ones in the mobile app.

### API Testing
The mobile app includes detailed console logging:
- All API requests
- All API responses
- Authentication flow
- Error messages

Check Expo DevTools console for debugging.

## 🚀 Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use production MongoDB
3. Deploy to hosting service (Heroku, DigitalOcean, AWS, etc.)

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to hosting (Vercel, Netlify, etc.)
3. Update VITE_API_URL to production backend

### Mobile
1. Build APK/IPA using EAS Build
2. Submit to Play Store / App Store
3. Update API endpoint to production backend

## 📞 Support

For issues or questions, check the documentation in each folder:
- `backend/` - Backend API docs
- `frontend/` - Web dashboard docs
- `mobile/` - Mobile app docs

## 🎯 Current Features

### Web Dashboard
✅ User management (all roles)
✅ Appointment scheduling
✅ Payment processing (cash only)
✅ Test result management
✅ Service/test catalog
✅ Mobile lab scheduling
✅ Financial reports

### Mobile App
✅ Patient registration/login
✅ Book appointments
✅ View appointments
✅ View test results
✅ Browse lab services
✅ View mobile lab schedule

---

**Version:** 1.0.0  
**Last Updated:** November 6, 2025
