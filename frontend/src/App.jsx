import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import MedTechDashboard from './pages/MedTechDashboard';
import PathologistDashboard from './pages/PathologistDashboard';
import PatientDashboard from './pages/PatientDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import { API_ENDPOINTS } from './config/api';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Handle authentication persistence with proper role-based routing
  useEffect(() => {
    const handleAuthenticationAndRouting = async () => {
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');
      
      // Check if there's a saved view for this tab
      const savedView = sessionStorage.getItem('currentView');
      
      // Better detection for fresh tab vs reload:
      // - Fresh tab: no savedView AND navigation type is 'navigate' (not 'reload')
      // - Reload: savedView exists OR navigation type is 'reload'
      const navigationType = performance.getEntriesByType('navigation')[0]?.type;
      const isFreshTab = !savedView && navigationType === 'navigate';
      const isReload = navigationType === 'reload' || navigationType === 'back_forward';
      
      console.log('Navigation detection:', { 
        savedView, 
        navigationType, 
        isFreshTab, 
        isReload,
        hasToken: !!token 
      });
      
      if (token && user) {
        console.log('Found stored credentials - validating session');
        
        // If it's a fresh tab (new tab/window), go to login for multi-account support
        if (isFreshTab) {
          console.log('Fresh tab detected - going to login for multi-account support');
          setCurrentView('login');
          sessionStorage.setItem('currentView', 'login');
          return;
        }
        
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
            const currentUserData = await response.json();
            
            // Use the fresh user data from the server
            const validUser = currentUserData.user || currentUserData;
            
            // Update sessionStorage with fresh user data
            sessionStorage.setItem('user', JSON.stringify(validUser));
            
            // Set authentication state
            setCurrentUser(validUser);
            setIsAuthenticated(true);
            
            // If we have a saved view that matches the user's role, restore it
            // Otherwise, route based on role
            if (savedView) {
              const roleViewMap = {
                'admin': 'dashboard',
                'receptionist': 'receptionist-dashboard',
                'medtech': 'medtech-dashboard',
                'pathologist': 'pathologist-dashboard',
                'patient': 'patient-portal'
              };
              
              const expectedView = roleViewMap[validUser.role];
              
              // If saved view matches user's role, use it; otherwise use role-based default
              if (savedView === expectedView) {
                console.log('Restoring saved view for authenticated user:', savedView);
                setCurrentView(savedView);
              } else {
                console.log('Saved view does not match user role, using role-based routing');
                setCurrentView(expectedView || 'dashboard');
                sessionStorage.setItem('currentView', expectedView || 'dashboard');
              }
            } else {
              // No saved view, route based on role
              console.log('No saved view, routing user based on role:', validUser.role);
              switch (validUser.role) {
                case 'admin':
                  setCurrentView('dashboard');
                  sessionStorage.setItem('currentView', 'dashboard');
                  break;
                case 'receptionist':
                  setCurrentView('receptionist-dashboard');
                  sessionStorage.setItem('currentView', 'receptionist-dashboard');
                  break;
                case 'medtech':
                  setCurrentView('medtech-dashboard');
                  sessionStorage.setItem('currentView', 'medtech-dashboard');
                  break;
                case 'pathologist':
                  setCurrentView('pathologist-dashboard');
                  sessionStorage.setItem('currentView', 'pathologist-dashboard');
                  break;
                case 'patient':
                  setCurrentView('patient-portal');
                  sessionStorage.setItem('currentView', 'patient-portal');
                  break;
                default:
                  console.warn('Unknown role, defaulting to admin dashboard:', validUser.role);
                  setCurrentView('dashboard');
                  sessionStorage.setItem('currentView', 'dashboard');
              }
            }
            
            console.log('Session restored successfully for:', validUser.role, validUser.firstName);
          } else {
            // Token is invalid or expired
            console.log('Invalid token - clearing session');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('currentView');
            setCurrentUser(null);
            setIsAuthenticated(false);
            setCurrentView('login');
          }
        } catch (error) {
          // Error validating token or parsing user data
          console.error('Error validating session:', error);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('currentView');
          setCurrentUser(null);
          setIsAuthenticated(false);
          setCurrentView('login');
        }
      } else {
        // No stored credentials - always go to login
        console.log('No stored credentials - going to login');
        setCurrentView('login');
        sessionStorage.setItem('currentView', 'login');
      }
    };
    
    handleAuthenticationAndRouting();
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
        case 'receptionist-dashboard':
          document.title = 'MDLAB Direct - Receptionist Portal';
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

  // Cross-tab session detection using storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only handle sessionStorage changes (though storage events typically fire for localStorage)
      // We'll use a custom approach since sessionStorage doesn't trigger storage events across tabs
      
      // If another tab clears the session, detect it and redirect to login
      if (e.key === 'sessionCleared' && e.newValue === 'true') {
        console.log('Session cleared in another tab - logging out');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentView('login');
        
        // Clear this tab's session as well
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('currentView');
        
        // Remove the signal
        localStorage.removeItem('sessionCleared');
      }
    };

    // Listen for storage events (works for localStorage only)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle user data updates (e.g., from profile updates)
  const handleUserUpdate = (updatedUser) => {
    console.log('App.jsx - User data updated:', updatedUser);
    setCurrentUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogin = (user) => {
    console.log('handleLogin called with user:', user);
    
    // Store user data in sessionStorage (tab-specific)
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', user.token);
    
    // Update authentication state
    setIsAuthenticated(true);
    setCurrentUser(user);
    
    // Navigate to appropriate dashboard
    navigateBasedOnRole(user.role);
    
    // Force a re-render
    window.location.reload();
  };

  const navigateBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        setCurrentView('dashboard');
        sessionStorage.setItem('currentView', 'dashboard');
        break;
      case 'receptionist':
        setCurrentView('receptionist-dashboard');
        sessionStorage.setItem('currentView', 'receptionist-dashboard');
        break;
      case 'medtech':
        setCurrentView('medtech-dashboard');
        sessionStorage.setItem('currentView', 'medtech-dashboard');
        break;
      case 'pathologist':
        setCurrentView('pathologist-dashboard');
        sessionStorage.setItem('currentView', 'pathologist-dashboard');
        break;
      case 'patient':
        setCurrentView('patient-portal');
        sessionStorage.setItem('currentView', 'patient-portal');
        break;
      default:
        setCurrentView('login');
        sessionStorage.setItem('currentView', 'login');
    }
  };

  const handleLogout = () => {
    // Get token before clearing (for backend logout call)
    const token = sessionStorage.getItem('token');
    
    // Clear sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('currentView');
    
    // Signal other tabs to log out too (using localStorage for cross-tab communication)
    localStorage.setItem('sessionCleared', 'true');
    setTimeout(() => localStorage.removeItem('sessionCleared'), 100);
    
    // Clear session state
    setIsAuthenticated(false);
    setCurrentUser(null);
    
    // Force navigation to login page
    setCurrentView('login');
    
    console.log('User logged out successfully');
    
    // Optional: Call backend logout endpoint
    if (token) {
      fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => console.log('Backend logout call failed:', err));
    }
  };

  const handleNavigateToSignUp = () => {
    setCurrentView('signup');
    sessionStorage.setItem('currentView', 'signup');
  };

  const handleNavigateToLogin = () => {
    // Clear any existing authentication state when navigating to login
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('login');
    sessionStorage.setItem('currentView', 'login');
  };

  const handleNavigateToAdminLogin = () => {
    setCurrentView('admin-login');
    sessionStorage.setItem('currentView', 'admin-login');
  };

  const handleNavigateToDashboard = () => {
    // This will be called after successful login
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        
        // Role-based routing - ALWAYS route based on the current user's role
        console.log('Post-login routing for user role:', userData.role);
        let targetView;
        switch (userData.role) {
          case 'admin':
            console.log('Routing to admin dashboard');
            targetView = 'dashboard';
            setCurrentView('dashboard');
            break;
          case 'receptionist':
            console.log('Routing to receptionist dashboard');
            targetView = 'receptionist-dashboard';
            setCurrentView('receptionist-dashboard');
            break;
          case 'medtech':
            console.log('Routing to medtech dashboard');
            targetView = 'medtech-dashboard';
            setCurrentView('medtech-dashboard');
            break;
          case 'pathologist':
            console.log('Routing to pathologist dashboard');
            targetView = 'pathologist-dashboard';
            setCurrentView('pathologist-dashboard');
            break;
          case 'patient':
            console.log('Routing to patient portal');
            targetView = 'patient-portal';
            setCurrentView('patient-portal');
            break;
          default:
            console.log('Unknown role, routing to default dashboard:', userData.role);
            targetView = 'dashboard';
            setCurrentView('dashboard');
        }
        
        // Save the view to sessionStorage for this tab
        sessionStorage.setItem('currentView', targetView);
        
        console.log('Navigation completed for:', userData.firstName, userData.lastName, '(Role:', userData.role + ')');
      } catch (error) {
        console.error('Error parsing user data during navigation:', error);
        // Stay on login if data is invalid
        setCurrentView('login');
        sessionStorage.setItem('currentView', 'login');
      }
    } else {
      console.error('No token or user data found, staying on login');
      setCurrentView('login');
      sessionStorage.setItem('currentView', 'login');
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
      case 'receptionist-dashboard':
        return (
          <ReceptionistDashboard
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
            onUserUpdate={handleUserUpdate}
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
