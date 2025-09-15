import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import MedTechDashboard from './pages/MedTechDashboard';
import PathologistDashboard from './pages/PathologistDashboard';
import PatientDashboard from './pages/PatientDashboard';
import { API_ENDPOINTS } from './config/api';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is already authenticated on app start
  useEffect(() => {
    const validateStoredSession = async () => {
      // Check if this is a fresh browser session or just a page reload
      const isNewSession = !sessionStorage.getItem('mdlab_session_active');
      
      if (isNewSession) {
        // Fresh browser session - clear everything and go to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setIsAuthenticated(false);
        setCurrentView('login');
        
        // Mark session as active
        sessionStorage.setItem('mdlab_session_active', 'true');
        
        console.log('Fresh browser session - redirected to login page');
      } else {
        // Page reload - try to restore previous state
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          try {
            const userData = JSON.parse(user);
            
            // Validate token with backend
            const response = await fetch(API_ENDPOINTS.ME, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              // Token is valid - restore user session
              setCurrentUser(userData);
              setIsAuthenticated(true);
              
              // Route to appropriate dashboard based on role
              switch (userData.role) {
                case 'admin':
                  setCurrentView('dashboard');
                  break;
                case 'medtech':
                  setCurrentView('medtech-dashboard');
                  break;
                case 'pathologist':
                  setCurrentView('pathologist-dashboard');
                  break;
                case 'patient':
                  setCurrentView('patient-portal');
                  break;
                default:
                  setCurrentView('dashboard');
              }
              
              console.log('Session restored after page reload for user:', userData.role);
            } else {
              // Token is invalid - clear and go to login
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setCurrentUser(null);
              setIsAuthenticated(false);
              setCurrentView('login');
              console.log('Invalid token - redirected to login');
            }
          } catch (error) {
            // Error validating token or parsing user data - go to login
            console.error('Error validating session:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
            setIsAuthenticated(false);
            setCurrentView('login');
          }
        } else {
          // No stored credentials - go to login
          setCurrentView('login');
          console.log('No stored credentials - redirected to login');
        }
      }
    };
    
    validateStoredSession();
  }, []);

  // Update document title based on current view
  useEffect(() => {
    const updateTitle = () => {
      switch (currentView) {
        case 'login':
          document.title = 'MDLAB Direct - Login';
          break;
        case 'signup':
          document.title = 'MDLAB Direct - Sign Up';
          break;
        case 'admin-login':
          document.title = 'MDLAB Direct - Staff Portal';
          break;
        case 'dashboard':
          document.title = 'MDLAB Direct - Admin Dashboard';
          break;
        case 'medtech-dashboard':
          document.title = 'MDLAB Direct - MedTech Dashboard';
          break;
        case 'pathologist-dashboard':
          document.title = 'MDLAB Direct - Pathologist Dashboard';
          break;
        case 'patient-portal':
          document.title = 'MDLAB Direct - Patient Portal';
          break;
        default:
          document.title = 'MDLAB Direct';
      }
    };

    updateTitle();
  }, [currentView]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear sessionStorage to ensure fresh session on next visit
    sessionStorage.removeItem('mdlab_session_active');
    
    // Clear session state
    setIsAuthenticated(false);
    setCurrentUser(null);
    
    // Force navigation to login page
    setCurrentView('login');
    
    console.log('User logged out and session cleared');
    
    // Optional: Call backend logout endpoint
    fetch(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).catch(err => console.log('Backend logout call failed:', err));
  };

  const handleNavigateToSignUp = () => {
    setCurrentView('signup');
  };

  const handleNavigateToLogin = () => {
    // Clear any existing authentication state when navigating to login
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleNavigateToAdminLogin = () => {
    setCurrentView('admin-login');
  };

  const handleNavigateToDashboard = () => {
    // This will be called after successful login
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        
        // Role-based routing
        switch (userData.role) {
          case 'admin':
            console.log('Routing to admin dashboard');
            setCurrentView('dashboard'); // Admin Dashboard
            break;
          case 'medtech':
            console.log('Routing to medtech dashboard');
            setCurrentView('medtech-dashboard'); // MedTech Dashboard
            break;
          case 'pathologist':
            console.log('Routing to pathologist dashboard');
            setCurrentView('pathologist-dashboard'); // Pathologist Dashboard
            break;
          case 'patient':
            console.log('Routing to patient portal');
            setCurrentView('patient-portal'); // Patient Portal (for future)
            break;
          default:
            console.log('Unknown role, routing to default dashboard:', userData.role);
            setCurrentView('dashboard'); // Fallback to admin dashboard
        }
        
        console.log('Navigating to dashboard for user:', userData, 'Role:', userData.role);
      } catch (error) {
        console.error('Error parsing user data during navigation:', error);
        // Stay on login if data is invalid
        setCurrentView('login');
      }
    } else {
      console.error('No token or user data found, staying on login');
      setCurrentView('login');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <Login
            onNavigateToSignUp={handleNavigateToSignUp}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToAdminLogin={handleNavigateToAdminLogin}
          />
        );
      case 'signup':
        return (
          <SignUp
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToDashboard={handleNavigateToDashboard}
          />
        );
      case 'admin-login':
        return (
          <AdminLogin
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToDashboard={handleNavigateToDashboard}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      case 'medtech-dashboard':
        return (
          <MedTechDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      case 'pathologist-dashboard':
        return (
          <PathologistDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      case 'patient-portal':
        return (
          <PatientDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <Login
            onNavigateToSignUp={handleNavigateToSignUp}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToAdminLogin={handleNavigateToAdminLogin}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;
