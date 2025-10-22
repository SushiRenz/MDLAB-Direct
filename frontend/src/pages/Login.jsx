import React, { useState, useEffect } from 'react';
import '../design/Login.css';
import mdlabLogo from '../assets/mdlab-logo.png';
import api from '../services/api'; // Use the configured axios instance instead

function Login({ onNavigateToSignUp, onNavigateToDashboard, onNavigateToAdminLogin }) {
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset component state when component mounts (useful when navigating from SignUp)
  useEffect(() => {
    console.log('Login component mounted/reset');
    setFormData({
      identifier: '',
      password: ''
    });
    setRememberMe(false);
    setLoading(false);
    setError('');
    setShowPassword(false);
  }, []);

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
      console.log('Attempting login with:', formData.identifier);
      
      const response = await api.post('/auth/login', {
        identifier: formData.identifier.trim(),
        password: formData.password
      });

      const data = response.data;
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);

      // Success - store user data and redirect based on role
      if (data.success && data.token) {
        console.log('Login successful for user:', data.user.firstName, data.user.lastName, '- Role:', data.user.role);
        
        // Check user role - ONLY PATIENTS can login through this page
        const userRole = data.user.role;
        
        if (userRole === 'patient') {
          // Only patients allowed on this login page
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
          
          setTimeout(() => {
            setLoading(false);
            onNavigateToDashboard();
          }, 500);
        } else if (userRole === 'admin' || userRole === 'pathologist' || userRole === 'medtech' || userRole === 'receptionist') {
          // Staff/admin accounts should use staff portal
          setLoading(false);
          setError('Staff accounts must use the Staff Portal. Please click the arrow in the top-right corner.');
        } else {
          // Unknown role
          setLoading(false);
          setError('Account role not recognized. Please contact administrator.');
        }
      } else {
        console.log('Login response missing token or success flag');
        setError('Login failed. Please try again.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        // Server responded with error status
        const data = err.response.data;
        let errorMessage = 'Login failed. Please try again.';
        
        if (err.response.status === 401) {
          // Check if the message specifically mentions deactivation
          if (data.message && data.message.toLowerCase().includes('deactivated')) {
            errorMessage = data.message;
          } else {
            // This covers both "user not found" AND "wrong password"
            errorMessage = 'Invalid username/email or password. Please check your credentials and try again.';
          }
        } else if (err.response.status === 423) {
          errorMessage = 'Account is temporarily locked due to too many failed attempts. Please try again later.';
        } else if (err.response.status === 403) {
          errorMessage = 'Account has been deactivated. Please contact administrator.';
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

  const handleSignUpClick = (e) => {
    e.preventDefault();
    onNavigateToSignUp();
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    onNavigateToAdminLogin();
  };

  return (
    <div className="login-container">
      {/* Subtle Admin Arrow - Top Right */}
      <div 
        onClick={handleAdminClick}
        style={{
          position: 'absolute',
          top: '20px',
          right: '25px',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          opacity: '0.4',
          transition: 'all 0.3s ease',
          borderRadius: '50%',
          zIndex: 10,
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.4';
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Staff Portal"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ color: '#4b5563' }}
        >
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>

      <div className="login-left">
        <img 
          src={mdlabLogo} 
          alt="MDLAB Logo" 
          className="login-logo"
          onClick={handleLogoClick}
          onError={(e) => {
            console.error('Logo failed to load:', e.target.src);
            e.target.style.display = 'block'; // Ensure it's still visible even if image fails
          }}
          onLoad={() => {
            console.log('Logo loaded successfully');
          }}
        />
      </div>
      
      <div className="login-right">
        <div className="login-box">
          <h1 className="login-title">LOGIN</h1>
          
          {/* Error message display */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="identifier"
              placeholder="Username or Email"
              className="login-input"
              value={formData.identifier}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="login-input"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                disabled={loading}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            
            <div className="login-options">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </form>
          
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
