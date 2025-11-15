import React, { useState, useEffect } from 'react';
import '../design/Login.css';
import mdlabLogo from '../assets/mdlab-logo.png';
import api from '../services/api'; // Use the configured axios instance instead
import authDebugger from '../utils/authDebugger';

function Login({ onNavigateToSignUp, onNavigateToDashboard, onNavigateToAdminLogin }) {
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: code & new password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    identifier: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  // Reset component state when component mounts (useful when navigating from SignUp)
  useEffect(() => {
    console.log('Login component mounted/reset');
    authDebugger.log('Login component mounted', {
      hasExistingToken: !!sessionStorage.getItem('token'),
      hasExistingUser: !!sessionStorage.getItem('user'),
      hasRememberedToken: !!localStorage.getItem('rememberedToken'),
      hasRememberedUser: !!localStorage.getItem('rememberedUser'),
      currentUrl: window.location.href
    });
    
    // Check if there are remembered credentials
    const rememberedUser = localStorage.getItem('rememberedUser');
    const rememberedToken = localStorage.getItem('rememberedToken');
    
    if (rememberedUser && rememberedToken) {
      try {
        const userData = JSON.parse(rememberedUser);
        console.log('Found remembered credentials for:', userData.firstName, userData.lastName);
        
        // Auto-fill the username and set remember me to true
        setFormData({
          identifier: userData.username || userData.email,
          password: ''
        });
        setRememberMe(true);
        
        authDebugger.log('Auto-filled remembered credentials', {
          userEmail: userData.email,
          userName: `${userData.firstName} ${userData.lastName}`
        });
      } catch (error) {
        console.error('Error parsing remembered user data:', error);
        // Clear invalid remembered data
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('rememberedToken');
      }
    }
    
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
    
    authDebugger.log('Form input changed', {
      fieldName: name,
      fieldValue: value.substring(0, 20) + (value.length > 20 ? '...' : ''),
      currentFormData: {
        identifier: formData.identifier,
        hasPassword: !!formData.password
      }
    });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear any existing error first
    setError('');

    authDebugger.log('Login form submitted', {
      identifier: formData.identifier,
      hasPassword: !!formData.password,
      passwordLength: formData.password?.length,
      formDataComplete: formData
    });

    // Basic validation
    if (!formData.identifier || !formData.password) {
      authDebugger.log('Login validation failed', {
        missingIdentifier: !formData.identifier,
        missingPassword: !formData.password
      });
      setError('Please fill in all fields');
      return false;
    }

    // Prevent multiple submissions
    if (loading) {
      return false;
    }

    setLoading(true);
    authDebugger.log('Starting login process', {
      identifier: formData.identifier,
      loadingState: true
    });

    try {
      console.log('Attempting login with:', formData.identifier);
      authDebugger.log('Login attempt started', {
        identifier: formData.identifier,
        hasPassword: !!formData.password
      });
      
      const response = await api.post('/auth/login', {
        identifier: formData.identifier.trim(),
        password: formData.password
      });

      const data = response.data;
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);
      authDebugger.log('Login API response received', {
        status: response.status,
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user,
        userRole: data.user?.role
      });

      // Success - store user data and redirect based on role
      if (data.success && data.token) {
        console.log('Login successful for user:', data.user.firstName, data.user.lastName, '- Role:', data.user.role);
        
        // Check user role - ONLY PATIENTS can login through this page
        const userRole = data.user.role;
        
        if (userRole === 'patient') {
          // Only patients allowed on this login page
          authDebugger.log('Storing patient session data', {
            token: data.token.substr(0, 20) + '...',
            userEmail: data.user.email,
            userRole: data.user.role,
            userName: `${data.user.firstName} ${data.user.lastName}`,
            rememberMe: rememberMe
          });
          
          // Always store in sessionStorage for the current session
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
          
          // If Remember Me is checked, also store in localStorage for persistence
          if (rememberMe) {
            localStorage.setItem('rememberedToken', data.token);
            localStorage.setItem('rememberedUser', JSON.stringify(data.user));
            console.log('Credentials remembered for future sessions');
            
            authDebugger.log('Credentials saved to localStorage', {
              userEmail: data.user.email,
              userName: `${data.user.firstName} ${data.user.lastName}`,
              persistent: true
            });
          } else {
            // If not remembering, clear any previously remembered credentials
            localStorage.removeItem('rememberedToken');
            localStorage.removeItem('rememberedUser');
            console.log('Previous remembered credentials cleared');
          }
          
          authDebugger.log('Session data stored, navigating to dashboard');
          
          setTimeout(() => {
            setLoading(false);
            onNavigateToDashboard();
          }, 500);
        } else if (userRole === 'admin' || userRole === 'pathologist' || userRole === 'medtech' || userRole === 'receptionist') {
          // Staff/admin accounts should use staff portal
          authDebugger.log('User is staff, not patient', {
            userRole: userRole,
            message: 'Staff accounts must use staff portal'
          });
          setLoading(false);
          setError('Staff accounts must use the Staff Portal. Please click the arrow in the top-right corner.');
        } else {
          // Unknown role
          authDebugger.log('Unknown user role', {
            userRole: userRole,
            message: 'Account role not recognized'
          });
          setLoading(false);
          setError('Account role not recognized. Please contact administrator.');
        }
      } else {
        console.log('Login response missing token or success flag');
        authDebugger.log('Login failed - missing token or success flag', {
          success: data.success,
          hasToken: !!data.token,
          responseData: data
        });
        setLoading(false);
        setError('Login failed. Please try again.');
      }

    } catch (err) {
      console.error('Login error:', err);
      authDebugger.log('Login error occurred', {
        errorMessage: err.message,
        errorResponse: err.response?.data,
        errorStatus: err.response?.status
      });
      
      setLoading(false);
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        const data = err.response.data;
        
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
      } else {
        // Network or other error
        errorMessage = 'Network error. Please check if the server is running and try again.';
      }
      
      // Set error state for UI display
      setError(errorMessage);
    }
    
    return false;
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

  // Forgot Password Functions
  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
    setForgotPasswordStep(1);
    setForgotPasswordData({
      identifier: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const handleCloseForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordStep(1);
    setForgotPasswordData({
      identifier: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordLoading(false);
  };

  const handleForgotPasswordInputChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData({
      ...forgotPasswordData,
      [name]: value
    });
    if (forgotPasswordError) setForgotPasswordError('');
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');
    
    if (!forgotPasswordData.identifier.trim()) {
      setForgotPasswordError('Please enter your email or username');
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        identifier: forgotPasswordData.identifier.trim()
      });

      if (response.data.success) {
        setForgotPasswordSuccess('Verification code sent to your email!');
        setForgotPasswordStep(2);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.response?.data?.message) {
        setForgotPasswordError(err.response.data.message);
      } else {
        setForgotPasswordError('Failed to send reset code. Please try again.');
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');

    // Validation
    if (!forgotPasswordData.verificationCode.trim()) {
      setForgotPasswordError('Please enter the verification code');
      return;
    }

    if (!forgotPasswordData.newPassword) {
      setForgotPasswordError('Please enter a new password');
      return;
    }

    if (forgotPasswordData.newPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setForgotPasswordError('Passwords do not match');
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        identifier: forgotPasswordData.identifier,
        verificationCode: forgotPasswordData.verificationCode,
        newPassword: forgotPasswordData.newPassword
      });

      if (response.data.success) {
        setForgotPasswordSuccess('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          handleCloseForgotPasswordModal();
        }, 2000);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      if (err.response?.data?.message) {
        setForgotPasswordError(err.response.data.message);
      } else {
        setForgotPasswordError('Failed to reset password. Please try again.');
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResendCode = async () => {
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    try {
      const response = await api.post('/auth/forgot-password', {
        identifier: forgotPasswordData.identifier
      });

      if (response.data.success) {
        setForgotPasswordSuccess('New verification code sent to your email!');
      }
    } catch (err) {
      console.error('Resend code error:', err);
      if (err.response?.data?.message) {
        setForgotPasswordError(err.response.data.message);
      } else {
        setForgotPasswordError('Failed to resend code. Please try again.');
      }
    } finally {
      setForgotPasswordLoading(false);
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
          <h1 className="login-title">Sign In</h1>
          
          {/* Remembered credentials indicator */}
          {rememberMe && formData.identifier && (
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #38bdf8',
              color: '#0369a1',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z"/>
              </svg>
              <span>Welcome back! Your login has been remembered.</span>
            </div>
          )}

          {/* Error message display */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fde8e8 100%)',
              border: '2px solid #f87171',
              color: '#dc2626',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '15px',
              textAlign: 'center',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(248, 113, 113, 0.2)',
              animation: 'errorPulse 0.5s ease-out',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit} autoComplete="off" noValidate>
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
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setRememberMe(isChecked);
                    
                    // If user unchecks "Remember me", clear any remembered credentials
                    if (!isChecked) {
                      localStorage.removeItem('rememberedToken');
                      localStorage.removeItem('rememberedUser');
                      console.log('Remembered credentials cleared due to unchecking Remember me');
                    }
                  }}
                  disabled={loading}
                />
                Remember me
              </label>
              <a href="#" className="forgot-link" onClick={handleForgotPasswordClick}>Forgot password?</a>
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

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '0',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#21AEA8',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {forgotPasswordStep === 1 ? 'Forgot Password' : 'Reset Password'}
              </h3>
              <button
                onClick={handleCloseForgotPasswordModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {forgotPasswordStep === 1 ? (
                // Step 1: Enter Email/Username
                <form onSubmit={handleSendResetCode}>
                  <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '16px' }}>
                    Enter your username to receive a verification code at your registered email address.
                  </p>

                  <input
                    type="text"
                    name="identifier"
                    placeholder="Username"
                    value={forgotPasswordData.identifier}
                    onChange={handleForgotPasswordInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginBottom: '16px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      backgroundColor: 'white',
                      color: '#333'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#21AEA8'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    disabled={forgotPasswordLoading}
                    required
                  />

                  {forgotPasswordError && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {forgotPasswordError}
                    </div>
                  )}

                  {forgotPasswordSuccess && (
                    <div style={{
                      background: '#f0f9ff',
                      border: '1px solid #bfdbfe',
                      color: '#1e40af',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {forgotPasswordSuccess}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleCloseForgotPasswordModal}
                      style={{
                        padding: '10px 20px',
                        border: '2px solid #6c757d',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#6c757d',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: forgotPasswordLoading ? '#ccc' : '#21AEA8',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: forgotPasswordLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {forgotPasswordLoading ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                </form>
              ) : (
                // Step 2: Enter Code and New Password
                <form onSubmit={handleResetPassword}>
                  <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '16px' }}>
                    Enter the 6-digit verification code sent to your email and set a new password.
                  </p>

                  <input
                    type="text"
                    name="verificationCode"
                    placeholder="6-Digit Verification Code"
                    value={forgotPasswordData.verificationCode}
                    onChange={handleForgotPasswordInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginBottom: '12px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      textAlign: 'center',
                      letterSpacing: '2px',
                      backgroundColor: 'white',
                      color: '#333'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#21AEA8'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    disabled={forgotPasswordLoading}
                    maxLength="6"
                    required
                  />

                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={forgotPasswordLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#21AEA8',
                        fontSize: '14px',
                        cursor: forgotPasswordLoading ? 'not-allowed' : 'pointer',
                        textDecoration: 'underline',
                        opacity: forgotPasswordLoading ? 0.5 : 1,
                        padding: '4px 8px'
                      }}
                    >
                      {forgotPasswordLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                  </div>

                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={forgotPasswordData.newPassword}
                    onChange={handleForgotPasswordInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginBottom: '16px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      backgroundColor: 'white',
                      color: '#333'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#21AEA8'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    disabled={forgotPasswordLoading}
                    required
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={forgotPasswordData.confirmPassword}
                    onChange={handleForgotPasswordInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginBottom: '16px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      backgroundColor: 'white',
                      color: '#333'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#21AEA8'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    disabled={forgotPasswordLoading}
                    required
                  />

                  {forgotPasswordError && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {forgotPasswordError}
                    </div>
                  )}

                  {forgotPasswordSuccess && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {forgotPasswordSuccess}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep(1)}
                      style={{
                        padding: '10px 20px',
                        border: '2px solid #6c757d',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#6c757d',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: forgotPasswordLoading ? '#ccc' : '#21AEA8',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: forgotPasswordLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {forgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
