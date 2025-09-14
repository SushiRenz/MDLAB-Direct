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
      // Always start at login - disable automatic session restoration
      // Clear any existing session data on app startup
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setCurrentView('login');
      
      console.log('App started - redirected to login page');
    };
    
    validateStoredSession();
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
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
