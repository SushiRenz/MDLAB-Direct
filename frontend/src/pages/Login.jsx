import React, { useState } from 'react';
import '../design/Login.css';
import mdlabLogo from '../assets/mdlab-logo.png';

function Login({ onNavigateToSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password, rememberMe });
    // Add your login logic here
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Add Google login logic here
  };

  const handleLogoClick = () => {
    window.open('https://www.facebook.com/vizcayalab', '_blank');
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    onNavigateToSignUp();
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img 
          src={mdlabLogo} 
          alt="MDLAB Logo" 
          className="login-logo"
          onClick={handleLogoClick}
        />
      </div>
      
      <div className="login-right">
        <div className="login-box">
          <h1 className="login-title">LOGIN</h1>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="login-options">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
          
          <div className="google-login" onClick={handleGoogleLogin}>
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </div>
          
          <div className="signup-row">
            <span>Don't have an account?</span>
            <a href="#" className="signup-link" onClick={handleSignUpClick}>Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
