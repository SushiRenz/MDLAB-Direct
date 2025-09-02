import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is already authenticated on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setCurrentView('dashboard');
        console.log('Restored user session:', userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('login');
    console.log('User logged out');
  };

  const handleNavigateToSignUp = () => {
    setCurrentView('signup');
  };

  const handleNavigateToLogin = () => {
    setCurrentView('login');
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
        setCurrentView('dashboard');
        console.log('Navigating to dashboard for user:', userData);
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
          />
        );
      case 'signup':
        return (
          <SignUp
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
      default:
        return (
          <Login
            onNavigateToSignUp={handleNavigateToSignUp}
            onNavigateToDashboard={handleNavigateToDashboard}
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
