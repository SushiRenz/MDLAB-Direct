import React, { useState } from 'react';
import '../design/SignUp.css';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

function SignUp({ onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      isStrong: minLength && hasUpperCase && hasLowerCase && hasNumbers
    };
  };

  // Check if username exists
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) return;
    
    setIsCheckingUsername(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-username?username=${username}`);
      if (response.status === 409) {
        setValidationErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      } else {
        setValidationErrors(prev => ({ ...prev, username: '' }));
      }
    } catch (error) {
      console.log('Username check failed (server may not have this endpoint yet)');
    }
    setIsCheckingUsername(false);
  };

  // Check if email exists
  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) return;
    
    setIsCheckingEmail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-email?email=${email}`);
      if (response.status === 409) {
        setValidationErrors(prev => ({ ...prev, email: 'Email is already registered' }));
      } else {
        setValidationErrors(prev => ({ ...prev, email: '' }));
      }
    } catch (error) {
      console.log('Email check failed (server may not have this endpoint yet)');
    }
    setIsCheckingEmail(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear main error when user starts typing
    if (error) setError('');

    // Real-time validation
    const newErrors = { ...validationErrors };

    if (name === 'email') {
      if (value && !validateEmail(value)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        newErrors.email = '';
        // Check availability after a delay
        if (value) {
          setTimeout(() => checkEmailAvailability(value), 500);
        }
      }
    }

    if (name === 'username') {
      if (value.length > 0 && value.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      } else {
        newErrors.username = '';
        // Check availability after a delay
        if (value.length >= 3) {
          setTimeout(() => checkUsernameAvailability(value), 500);
        }
      }
    }

    if (name === 'password') {
      const passwordValidation = validatePassword(value);
      if (value && !passwordValidation.isStrong) {
        const issues = [];
        if (!passwordValidation.minLength) issues.push('at least 6 characters');
        if (!passwordValidation.hasUpperCase) issues.push('one uppercase letter');
        if (!passwordValidation.hasLowerCase) issues.push('one lowercase letter');
        if (!passwordValidation.hasNumbers) issues.push('one number');
        newErrors.password = `Password must contain ${issues.join(', ')}`;
      } else {
        newErrors.password = '';
      }
      
      // Also validate confirmPassword when password changes
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        newErrors.confirmPassword = '';
      }
    }

    if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        newErrors.confirmPassword = '';
      }
    }

    setValidationErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Final validation before submission
    const passwordValidation = validatePassword(formData.password);
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (!passwordValidation.isStrong) {
      setError('Password must contain at least 6 characters, one uppercase letter, one lowercase letter, and one number');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check if there are any validation errors
    if (Object.values(validationErrors).some(error => error !== '')) {
      setError('Please fix the validation errors before submitting');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: 'patient' // Always register as patient
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Registration successful! You can now log in.');
        // Clear form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          phone: '',
          role: 'patient'
        });
        
        // Clear any existing auth tokens to prevent conflicts
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          onNavigateToLogin();
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    onNavigateToLogin();
  };

  return (
    <div className="signup-container">
      <div className="signup-center">
        <div className="signup-box">
          <h1 className="signup-title">Create Patient Account</h1>

          <form onSubmit={handleSubmit} className="signup-form">
            {error && <div style={{
              color: '#dc2626',
              background: '#fef2f2',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              textAlign: 'center',
              border: '1px solid #fecaca',
              fontSize: '14px',
              fontWeight: '500'
            }}>{error}</div>}
            
            {success && <div style={{
              color: '#16a34a',
              background: '#f0fdf4',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              textAlign: 'center',
              border: '1px solid #bbf7d0',
              fontSize: '14px',
              fontWeight: '500'
            }}>{success}</div>}

            <div className="name-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="signup-input signup-input-half"
                required
                disabled={loading}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="signup-input signup-input-half"
                required
                disabled={loading}
              />
            </div>

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className="signup-input"
              required
              disabled={loading}
              style={{
                borderColor: validationErrors.username ? '#dc2626' : 
                           isCheckingUsername ? '#d97706' : 
                           formData.username && !validationErrors.username ? '#16a34a' : ''
              }}
            />
            {validationErrors.username && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: '12px', 
                marginTop: '-10px', 
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                {validationErrors.username}
              </div>
            )}
            {isCheckingUsername && (
              <div style={{ 
                color: '#d97706', 
                fontSize: '12px', 
                marginTop: '-10px', 
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                Checking availability...
              </div>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="signup-input"
              required
              disabled={loading}
              style={{
                borderColor: validationErrors.email ? '#dc2626' : 
                           isCheckingEmail ? '#d97706' : 
                           formData.email && !validationErrors.email && validateEmail(formData.email) ? '#16a34a' : ''
              }}
            />
            {validationErrors.email && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: '12px', 
                marginTop: '-10px', 
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                {validationErrors.email}
              </div>
            )}
            {isCheckingEmail && (
              <div style={{ 
                color: '#d97706', 
                fontSize: '12px', 
                marginTop: '-10px', 
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                Checking availability...
              </div>
            )}

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (Optional)"
              value={formData.phone}
              onChange={handleInputChange}
              className="signup-input"
              disabled={loading}
            />

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="signup-input"
                required
                disabled={loading}
                style={{
                  borderColor: validationErrors.password ? '#dc2626' : 
                             formData.password && !validationErrors.password ? '#16a34a' : ''
                }}
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
            {validationErrors.password && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: '12px', 
                marginTop: '-10px', 
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                {validationErrors.password}
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="signup-input"
                required
                disabled={loading}
                style={{
                  borderColor: validationErrors.confirmPassword ? '#dc2626' : 
                             formData.confirmPassword && !validationErrors.confirmPassword && formData.confirmPassword === formData.password ? '#16a34a' : ''
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: '12px', 
                marginTop: '-10px', 
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                {validationErrors.confirmPassword}
              </div>
            )}

            <button 
              type="submit" 
              className="signup-btn"
              disabled={loading || Object.values(validationErrors).some(error => error !== '')}
              style={{
                opacity: (loading || Object.values(validationErrors).some(error => error !== '')) ? 0.6 : 1,
                cursor: (loading || Object.values(validationErrors).some(error => error !== '')) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Patient Account'}
            </button>
          </form>

          <div className="login-row">
            <span>Already have an account?</span>
            <button 
              onClick={handleLoginClick}
              className="login-link"
              disabled={loading}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
