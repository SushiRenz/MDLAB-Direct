# 📁 MDLAB Direct - Project Structure

## Complete Folder Structure

```
MDLAB-Direct/
│
├── 📄 package.json              # Root package manager (NEW!)
├── 📄 README.md                 # Complete documentation (NEW!)
├── 📄 GETTING_STARTED.md        # Quick start guide (NEW!)
├── 📄 start.ps1                 # Easy startup script (NEW!)
├── 📄 .gitignore                # Git ignore rules
│
├── 🖥️ backend/                  # Backend API Server
│   ├── controllers/             # Business logic
│   ├── models/                  # Database schemas
│   ├── routes/                  # API endpoints
│   ├── middleware/              # Auth, validation, etc.
│   ├── config/                  # Configuration files
│   ├── utils/                   # Helper functions
│   ├── server.js                # Main server file
│   ├── package.json             # Backend dependencies
│   └── .env                     # Environment variables
│
├── 💻 frontend/                 # React Web Dashboard
│   ├── src/
│   │   ├── pages/              # Dashboard pages
│   │   │   ├── Dashboard.jsx           # Owner dashboard
│   │   │   ├── ReceptionistDashboard.jsx
│   │   │   ├── MedTechDashboard.jsx
│   │   │   ├── PathologistDashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── services/           # API services
│   │   │   └── api.js          # API client
│   │   ├── components/         # Reusable components
│   │   ├── styles/             # CSS files
│   │   └── App.jsx             # Root component
│   ├── public/                 # Static assets
│   ├── index.html              # HTML entry point
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
│
└── 📱 mobile/                   # Expo Mobile App (YOUR APP!)
    ├── app/                     # App screens (Expo Router)
    │   ├── (tabs)/             # Tab navigation
    │   │   ├── index.tsx       # Home screen
    │   │   ├── appointments.tsx # Appointments
    │   │   ├── results.tsx     # Test results
    │   │   └── profile.tsx     # User profile
    │   ├── auth/               # Auth screens
    │   │   ├── login.tsx       # Login
    │   │   └── register.tsx    # Register
    │   └── _layout.tsx         # Root layout
    │
    ├── components/              # Reusable components
    ├── services/                # API services
    │   └── api.ts              # API client (connects to backend!)
    ├── contexts/                # React contexts
    ├── hooks/                   # Custom hooks
    ├── constants/               # App constants
    ├── assets/                  # Images, fonts, etc.
    ├── app.json                 # Expo configuration
    ├── package.json             # Mobile dependencies
    └── tsconfig.json            # TypeScript config
```

## 🔗 How They Connect

```
┌─────────────┐
│   Mobile    │ ◄──── Expo Go App on Phone
│   (Expo)    │       (Patient Portal)
└──────┬──────┘
       │
       │ HTTP Requests
       │ (192.168.1.112:5000)
       ▼
┌─────────────┐
│   Backend   │ ◄──── Node.js + Express
│   (API)     │       MongoDB Database
└──────┬──────┘
       │
       │ HTTP Requests
       │ (localhost:5000)
       ▼
┌─────────────┐
│  Frontend   │ ◄──── React + Vite
│   (Web)     │       (Staff Dashboard)
└─────────────┘
```

## 🎯 Key Files to Know

### Root Level (Project Management)

| File | Purpose |
|------|---------|
| `start.ps1` | 🚀 Easy startup - Just double-click! |
| `package.json` | 📦 Manages all three projects |
| `README.md` | 📖 Complete documentation |
| `GETTING_STARTED.md` | 🎓 Quick start guide |

### Backend (API Server)

| File | Purpose |
|------|---------|
| `server.js` | 🚀 Main server entry point |
| `.env` | 🔐 Secret configuration (DB, JWT, etc.) |
| `routes/` | 🛣️ API endpoint definitions |
| `controllers/` | 🎮 Business logic handlers |
| `models/` | 💾 Database schemas |

### Frontend (Web Dashboard)

| File | Purpose |
|------|---------|
| `src/pages/Dashboard.jsx` | 👑 Owner dashboard |
| `src/pages/ReceptionistDashboard.jsx` | 📋 Receptionist portal |
| `src/services/api.js` | 🌐 API client for backend |
| `vite.config.js` | ⚙️ Build configuration |

### Mobile (Patient App)

| File | Purpose |
|------|---------|
| `services/api.ts` | 🌐 API client (CONNECTS TO BACKEND!) |
| `app/(tabs)/index.tsx` | 🏠 Home screen |
| `app/auth/login.tsx` | 🔑 Login screen |
| `app.json` | ⚙️ Expo configuration |

## 🔧 Configuration Files

### Backend Environment (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/MDLAB_DIRECT
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Mobile API Config (services/api.ts)
```typescript
const BACKEND_IP = '192.168.1.112';  // ← YOUR COMPUTER'S IP
const BACKEND_PORT = '5000';
```

### Frontend API Config (.env)
```env
VITE_API_URL=http://192.168.1.112:5000/api
```

## 📊 Data Flow Example

### Patient Books Appointment (Mobile → Backend → Web):

```
1. Patient opens Mobile App
   └─► mobile/app/(tabs)/appointments.tsx

2. Fills appointment form
   └─► Calls: appointmentAPI.createAppointment()

3. Sends to Backend
   └─► POST http://192.168.1.112:5000/api/appointments

4. Backend processes
   ├─► routes/appointments.js
   ├─► controllers/appointmentController.js
   └─► models/Appointment.js

5. Saves to MongoDB
   └─► Database: MDLAB_DIRECT.appointments

6. Receptionist sees it
   └─► frontend/ReceptionistDashboard.jsx
   └─► Refreshes: appointmentAPI.getAppointments()
```

## 🎨 User Interfaces

### Web Dashboard Sections:

```
Owner Dashboard:
├─ 👥 User Management (Patient, MedTech, Pathologist, Receptionist, Admin)
├─ 💰 Payments (View, Delete, Print receipts)
├─ 📱 Mobile Lab (Schedule management)
└─ ⚙️ System
    ├─ Services
    ├─ Appointments
    └─ Test Results

Receptionist Dashboard:
├─ 🏠 Dashboard (Quick stats)
├─ 📅 Appointments (Book, View, Manage)
└─ 💰 Payments (Confirm payments, View records)

MedTech Dashboard:
├─ 🧪 Test Queue (Samples to process)
└─ ✅ Complete Results (Finished tests)

Pathologist Dashboard:
├─ 🔬 Review Queue (Results to verify)
└─ ✅ Verified Results (Approved tests)
```

### Mobile App Screens:

```
Patient App (Expo):
├─ 🏠 Home (Services, Quick actions)
├─ 📅 Appointments (Book, View history)
├─ 🧪 Test Results (View released results)
└─ 👤 Profile (Account settings)
```

## 🗂️ Database Collections

```
MongoDB - MDLAB_DIRECT Database:
├─ users                    # All user accounts
├─ appointments             # Appointment bookings
├─ testresults              # Lab test results
├─ services                 # Lab services/tests catalog
├─ payments                 # Payment records
└─ mobilelabschedules       # Mobile lab locations & times
```

## 📡 API Endpoints Summary

```
/api/auth
├─ POST /register          # User registration
├─ POST /login             # User login
├─ GET /me                 # Get current user
└─ PUT /profile            # Update profile

/api/appointments
├─ GET /                   # Get appointments
├─ POST /                  # Create appointment
├─ PUT /:id                # Update appointment
└─ PUT /:id/cancel         # Cancel appointment

/api/test-results
├─ GET /my                 # Get patient's results
└─ PUT /:id/mark-viewed    # Mark result as viewed

/api/services
├─ GET /                   # Get all services
└─ GET /popular            # Get popular services

/api/finance
├─ GET /payments           # Get payment records
├─ POST /payments          # Create payment
└─ DELETE /payments/:id    # Delete payment

/api/mobile-lab
├─ GET /current-week       # This week's schedule
├─ GET /current-active     # Current location
└─ GET /next-location      # Next location
```

## 🚀 Development Workflow

### Typical Development Day:

1. **Start Services:**
   ```
   Double-click start.ps1 → Choose option 1
   ```

2. **Backend Changes:**
   - Edit files in `backend/`
   - Server auto-restarts (nodemon)
   - Test: http://localhost:5000/api/...

3. **Web Changes:**
   - Edit files in `frontend/src/`
   - Page auto-refreshes (HMR)
   - Test: http://localhost:5173

4. **Mobile Changes:**
   - Edit files in `mobile/app/`
   - Shake phone → Reload in Expo Go
   - Or press `r` in terminal

5. **Testing Integration:**
   - Make change in one part
   - Test in other parts
   - Verify data flow works

---

**Understanding this structure helps you navigate and develop the system efficiently!** 🎯
