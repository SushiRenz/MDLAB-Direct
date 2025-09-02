import React, { useState } from 'react';
import '../design/Login.css';
import mdlabLogo from '../assets/mdlab-logo.png';

function Login({ onNavigateToSignUp, onNavigateToDashboard }) {
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);

      if (!response.ok) {
        // Handle different error status codes - ALL should show error without reload
        let errorMessage = 'Login failed. Please try again.';
        
        if (response.status === 401) {
          // This covers both "user not found" AND "wrong password"
          errorMessage = 'Invalid username/email or password. Please check your credentials and try again.';
        } else if (response.status === 423) {
          errorMessage = 'Account is temporarily locked due to too many failed attempts. Please try again later.';
        } else if (response.status === 403) {
          errorMessage = 'Account has been deactivated. Please contact administrator.';
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        console.log('Setting error message:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        return; // Important: return here to prevent further execution
      }

      // Success - store user data and redirect
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Login successful:', data.user);
        
        // Small delay to show success, then redirect
        setTimeout(() => {
          setLoading(false);
          onNavigateToDashboard();
        }, 500);
      } else {
        console.log('Login response missing token or success flag');
        setError('Login failed. Please try again.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check if the server is running and try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google login is not yet implemented');
  };

  const handleLogoClick = () => {
    window.open('https://www.facebook.com/vizcayalab', '_blank');
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    onNavigateToSignUp();
  };

  // Quick login buttons for testing (remove in production)
  const quickLogin = (role) => {
    if (role === 'admin') {
      setFormData({ identifier: 'admin@mdlab.com', password: 'Admin123!' });
    } else if (role === 'medtech') {
      setFormData({ identifier: 'medtech@mdlab.com', password: 'MedTech123!' });
    } else if (role === 'pathologist') {
      setFormData({ identifier: 'pathologist@mdlab.com', password: 'Pathologist123!' });
    } else if (role === 'patient') {
      setFormData({ identifier: 'patient@example.com', password: 'Patient123!' });
    }
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
          
          {/* Error message display */}
          {error && (
            <div style={{
              background: '#fee',
              border: '2px solid #f00',
              color: '#c33',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              ⚠️ {error}
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
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="login-input"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            
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
          
          {/* Quick login buttons for testing */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>Development Tools:</p>
              
              {/* API Test Button */}
              <div style={{ marginBottom: '10px' }}>
                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:5000/api/health');
                      const data = await response.json();
                      alert('Backend is working: ' + JSON.stringify(data));
                    } catch (error) {
                      alert('Backend connection failed: ' + error.message);
                    }
                  }}
                  style={{ padding: '5px 10px', fontSize: '11px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                >
                  Test Backend Connection
                </button>
              </div>
              
              {/* Quick Login */}
              <p style={{ margin: '10px 0 5px 0', fontSize: '11px', color: '#666' }}>Quick Login:</p>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => quickLogin('admin')} style={{ padding: '5px 10px', fontSize: '11px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Admin</button>
                <button type="button" onClick={() => quickLogin('medtech')} style={{ padding: '5px 10px', fontSize: '11px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>MedTech</button>
                <button type="button" onClick={() => quickLogin('pathologist')} style={{ padding: '5px 10px', fontSize: '11px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Pathologist</button>
                <button type="button" onClick={() => quickLogin('patient')} style={{ padding: '5px 10px', fontSize: '11px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Patient</button>
              </div>
            </div>
          )}
          
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
