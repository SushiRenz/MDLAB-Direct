import React, { useState } from 'react';
import '../design/AdminLogin.css';
import mdlabLogo from '../assets/mdlab-logo.png';
import api from '../services/api'; // Use the configured axios instance

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
      
      const response = await api.post('/auth/login', {
        identifier: formData.identifier.trim(),
        password: formData.password
      });

      const data = response.data;
      console.log('Admin login response status:', response.status);
      console.log('Admin login response data:', data);

      // Success - but check if user is admin/staff
      if (data.success && data.token) {
        const userRole = data.user.role;
        
        if (userRole === 'admin' || userRole === 'pathologist' || userRole === 'medtech' || userRole === 'receptionist') {
          // Valid admin/staff user
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
          
          console.log('Staff login successful:', data.user);
          
          setTimeout(() => {
            setLoading(false);
            onNavigateToDashboard();
          }, 500);
        } else if (userRole === 'patient') {
          // Patient trying to access staff login
          setError('This is the Staff Portal. Patients should use the main login page - click "Back to Patient Login" below.');
          setLoading(false);
        } else {
          // Unknown role
          setError('Account role not recognized. Please contact administrator.');
          setLoading(false);
        }
      } else {
        console.log('Admin login response missing token or success flag');
        setError('Login failed. Please try again.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Admin login error:', err);
      
      if (err.response) {
        // Server responded with error status
        const data = err.response.data;
        let errorMessage = 'Staff login failed. Please try again.';
        
        if (err.response.status === 401) {
          errorMessage = 'Invalid staff credentials. Please check your username/email and password.';
        } else if (err.response.status === 423) {
          errorMessage = 'Account is temporarily locked due to too many failed attempts. Please try again later.';
        } else if (err.response.status === 403) {
          errorMessage = 'Account has been deactivated. Please contact system administrator.';
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setError(errorMessage);
      } else {
        // Network or other error
        setError('Network error. Please check if the server is running and try again.');
      }
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
