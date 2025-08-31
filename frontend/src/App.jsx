import React, { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const navigateToSignUp = () => {
    setCurrentPage('signup');
  };

  const navigateToLogin = () => {
    setCurrentPage('login');
  };

  return (
    <>
      {currentPage === 'login' && <Login onNavigateToSignUp={navigateToSignUp} />}
      {currentPage === 'signup' && <SignUp onNavigateToLogin={navigateToLogin} />}
    </>
  );
}

export default App;
