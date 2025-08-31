import React, { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const navigateToSignUp = () => {
    setCurrentPage('signup');
  };

  const navigateToLogin = () => {
    setCurrentPage('login');
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <>
      {currentPage === 'login' && (
        <Login 
          onNavigateToSignUp={navigateToSignUp} 
          onNavigateToDashboard={navigateToDashboard}
        />
      )}
      {currentPage === 'signup' && <SignUp onNavigateToLogin={navigateToLogin} />}
      {currentPage === 'dashboard' && <Dashboard onNavigateToLogin={navigateToLogin} />}
    </>
  );
}

export default App;
