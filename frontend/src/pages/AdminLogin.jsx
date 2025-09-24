import React, { useState } from 'react';
import '../design/AdminLogin.css';
import mdlabLogo from '../assets/mdlab-logo.png';
import { API_ENDPOINTS } from '../config/api';

function AdminLogin({ onNavigateToLogin, onNavigateToDashboard }) {
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.identifier || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      console.log('Admin login attempt with:', formData.identifier);
      
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();
      console.log('Admin login response status:', response.status);
      console.log('Admin login response data:', data);

      if (!response.ok) {
        // Handle different error status codes
        let errorMessage = 'Login failed. Please try again.';
        
        if (response.status === 401) {
          errorMessage = 'Invalid staff credentials. Please check your username/email and password.';
        } else if (response.status === 423) {
          errorMessage = 'Account is temporarily locked due to too many failed attempts. Please try again later.';
        } else if (response.status === 403) {
          errorMessage = 'Account has been deactivated. Please contact system administrator.';
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        console.log('Setting admin error message:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Success - but check if user is admin/staff
      if (data.success && data.token) {
        const userRole = data.user.role;
        
        if (userRole === 'admin' || userRole === 'pathologist' || userRole === 'medtech' || userRole === 'receptionist') {
          // Valid admin/staff user
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          console.log('Staff login successful:', data.user);
          
          setTimeout(() => {
            setLoading(false);
            onNavigateToDashboard();
          }, 500);
        } else {
          // Patient trying to access staff login
          setError('Access denied. This portal is for staff only.');
          setLoading(false);
        }
      } else {
        console.log('Admin login response missing token or success flag');
        setError('Login failed. Please try again.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Admin login error:', err);
      setError('Network error. Please check if the server is running and try again.');
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    window.open('https://www.facebook.com/vizcayalab', '_blank');
  };

  const handleBackToLogin = () => {
    onNavigateToLogin();
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-left">
        <img 
          src={mdlabLogo} 
          alt="MDLAB Logo" 
          className="admin-login-logo"
          onClick={handleLogoClick}
        />
      </div>
      
      <div className="admin-login-right">
        <div className="admin-login-box">
          <div className="admin-login-header">
            <h1 className="admin-login-title">STAFF PORTAL</h1>
            <p className="admin-login-subtitle">Staff Access Only</p>
          </div>
          
          {/* Error message display */}
          {error && (
            <div className="admin-error-message">
              {error}
            </div>
          )}
          
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="identifier"
              placeholder="Staff Username or Email"
              className="admin-login-input"
              value={formData.identifier}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            
            <div className="admin-password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Staff Password"
                className="admin-login-input"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="admin-password-toggle"
                disabled={loading}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            
            <div className="admin-login-options">
              <label className="admin-remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                Remember me
              </label>
            </div>
            
            <button 
              type="submit" 
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Access Staff Portal'}
            </button>
          </form>
          
          <div className="admin-back-row">
            <button 
              onClick={handleBackToLogin}
              className="admin-back-link"
              disabled={loading}
            >
              ← Back to Patient Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
