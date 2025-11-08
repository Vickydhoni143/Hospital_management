// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../static/common.css';
import '../static/LoginPage.css';

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminVerification, setShowAdminVerification] = useState(false);
  const [adminSecretCode, setAdminSecretCode] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });

  const API_BASE_URL = 'http://localhost:5000/api';
  
  // Admin secret code - you can change this or make it configurable
  const ADMIN_SECRET_CODE = '123';

  useEffect(() => {
    const handlePopState = () => {
      if (selectedRole) {
        setSelectedRole(null);
        setAuthMode('login');
        resetFormData();
        setShowAdminVerification(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedRole]);

  useEffect(() => {
    if (selectedRole) {
      window.history.pushState({ role: selectedRole }, '', `#${selectedRole}`);
    }
  }, [selectedRole]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        const role = userData.role;
        if (role === 'patient') {
          navigate('/patient-dashboard', { replace: true });
        } else if (role === 'doctor') {
          navigate('/doctor-dashboard', { replace: true });
        } else if (role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('roleData');
      }
    }
  }, [navigate]);

  const showFeedback = (message, type = 'success') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackType('');
    }, 5000);
  };

  const validateFullName = (name) => {
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (name.length > 20) return 'Name must be less than 20 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) return 'Phone number must be 10 digits';
    return '';
  };

  const validatePassword = (password) => {
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 12) return 'Password must be at most 12 characters';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one capital letter';
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) return 'Password must contain at least one special character';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 10) score += 1;
    if (/(?=.*[A-Z])/.test(password)) score += 1;
    if (/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) score += 1;
    if (/(?=.*\d)/.test(password)) score += 1;

    let label, color;
    if (score <= 2) {
      label = 'Weak';
      color = '#ff4444';
    } else if (score <= 4) {
      label = 'Good';
      color = '#ffbb33';
    } else {
      label = 'Strong';
      color = '#00C851';
    }

    return { score, label, color };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (feedbackMessage) {
      setFeedbackMessage('');
      setFeedbackType('');
    }

    let error = '';
    switch (name) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      case 'password':
        error = validatePassword(value);
        setPasswordStrength(calculatePasswordStrength(value));
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const resetFormData = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: ''
    });
    setErrors({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    });
    setPasswordStrength({
      score: 0,
      label: '',
      color: ''
    });
    setFeedbackMessage('');
    setFeedbackType('');
    setAdminSecretCode('');
  };

  const validateForm = () => {
    const newErrors = {
      fullName: authMode === 'signup' ? validateFullName(formData.fullName) : '',
      email: validateEmail(formData.email),
      phoneNumber: authMode === 'signup' ? validatePhoneNumber(formData.phoneNumber) : '',
      password: validatePassword(formData.password),
      confirmPassword: authMode === 'signup' ? validateConfirmPassword(formData.confirmPassword, formData.password) : ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const makeApiCall = async (url, data) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setFeedbackMessage('');
    setFeedbackType('');

    if (!validateForm()) {
      showFeedback('Please fix the form errors before submitting.', 'error');
      setIsLoading(false);
      return;
    }

    try {
      if (authMode === 'login') {
        const loginData = {
          email: formData.email,
          password: formData.password,
          selectedRole: selectedRole // Send the selected role to backend
        };

        console.log('🟡 Attempting login with:', loginData);
        const result = await makeApiCall(`${API_BASE_URL}/auth/login`, loginData);
        
        console.log('🟢 Login successful:', result);
        
        // STORE DATA FIRST
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('roleData', JSON.stringify(result.data.roleData));
        
        showFeedback(`Successfully signed in as ${result.data.user.role}!`, 'success');
        
        // NAVIGATE IMMEDIATELY - NO DELAY
        const role = result.data.user.role;
        setTimeout(() => {
          if (role === 'patient') {
            navigate('/patient-dashboard', { replace: true });
          } else if (role === 'doctor') {
            navigate('/doctor-dashboard', { replace: true });
          } else if (role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          }
        }, 100);
        
      } else {
        const registerData = {
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber
        };

        if (selectedRole === 'doctor') {
          registerData.specialization = 'General Medicine';
          registerData.licenseNumber = 'DOC' + Math.floor(10000 + Math.random() * 90000);
          registerData.department = 'Medicine';
          registerData.yearsOfExperience = '5';
        } else if (selectedRole === 'admin') {
          registerData.department = 'Administration';
        }

        await makeApiCall(`${API_BASE_URL}/auth/register`, registerData);
        showFeedback(`Successfully registered as ${selectedRole}! You can now sign in.`, 'success');
        
        setTimeout(() => {
          setAuthMode('login');
          resetFormData();
        }, 2000);
      }
    } catch (error) {
      console.error('🔴 Login error:', error);
      showFeedback(error.message || 'An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    resetFormData();
  };

  const handleRoleSelect = (role) => {
    if (role === 'admin') {
      // Show admin verification instead of going directly to login form
      setShowAdminVerification(true);
    } else {
      // For doctor and patient, proceed directly
      setSelectedRole(role);
      setAuthMode('login');
      resetFormData();
    }
  };

  const handleAdminVerification = (e) => {
    e.preventDefault();
    
    if (!adminSecretCode.trim()) {
      showFeedback('Please enter the admin security code', 'error');
      return;
    }

    if (adminSecretCode === ADMIN_SECRET_CODE) {
      setSelectedRole('admin');
      setAuthMode('login');
      setShowAdminVerification(false);
      resetFormData();
      showFeedback('Admin access granted. Please proceed with login.', 'success');
    } else {
      showFeedback('Invalid security code. Please try again.', 'error');
      setAdminSecretCode('');
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setAuthMode('login');
    resetFormData();
    setShowAdminVerification(false);
  };

  const handleBackFromVerification = () => {
    setShowAdminVerification(false);
    setAdminSecretCode('');
    setFeedbackMessage('');
  };

  const PasswordStrengthIndicator = () => {
    if (!formData.password) return null;

    return (
      <div className="password-strength-indicator">
        <div className="strength-bar">
          <div 
            className="strength-fill"
            style={{
              width: `${(passwordStrength.score / 6) * 100}%`,
              backgroundColor: passwordStrength.color
            }}
          ></div>
        </div>
        <div className="strength-label" style={{ color: passwordStrength.color }}>
          Password Strength: {passwordStrength.label}
        </div>
        <div className="password-requirements">
          <h5>Password Requirements:</h5>
          <ul>
            <li className={formData.password.length >= 6 && formData.password.length <= 12 ? 'met' : ''}>
              6-12 characters
            </li>
            <li className={/(?=.*[A-Z])/.test(formData.password) ? 'met' : ''}>
              At least one capital letter
            </li>
            <li className={/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(formData.password) ? 'met' : ''}>
              At least one special character
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const FeedbackMessage = () => {
    if (!feedbackMessage) return null;

    return (
      <div className={`feedback-message ${feedbackType}`}>
        <div className="feedback-content">
          <i className={`fas ${feedbackType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{feedbackMessage}</span>
        </div>
        <button 
          className="feedback-close"
          onClick={() => {
            setFeedbackMessage('');
            setFeedbackType('');
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    );
  };

  const LoadingSpinner = () => {
    if (!isLoading) return null;

    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>Processing...</p>
      </div>
    );
  };

  const renderAdminVerification = () => (
    <div className="admin-verification-view">
      <button className="back-button" onClick={handleBackFromVerification}>
        ← Back to Role Selection
      </button>

      <div className="verification-header">
        <div className="security-icon">🔒</div>
        <h2>Administrator Security Verification</h2>
        <p>Access to the Administrator portal requires additional security clearance.</p>
      </div>

      <form onSubmit={handleAdminVerification} className="verification-form">
        <div className="form-group">
          <label htmlFor="adminSecretCode">Enter Security Code</label>
          <input
            type="password"
            id="adminSecretCode"
            name="adminSecretCode"
            value={adminSecretCode}
            onChange={(e) => setAdminSecretCode(e.target.value)}
            placeholder="Enter the administrator security code"
            required
            disabled={isLoading}
            className="security-input"
          />
          <small className="security-hint">
            Please contact system administrator if you don't have the security code.
          </small>
        </div>

        <button 
          type="submit" 
          className="submit-btn security-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify & Proceed'}
        </button>

        <FeedbackMessage />
      </form>

      <div className="security-note">
        <h4>⚠️ Security Notice</h4>
        <p>
          The Administrator portal contains sensitive hospital management functions. 
          Unauthorized access is strictly prohibited and may result in legal action.
        </p>
      </div>
    </div>
  );

  const renderRoleSelection = () => (
    <div className="role-selection-view">
      <div className="login-header">
        <div className="hospital-logo">
          <h1>🏥 VS Hospital Login Portal</h1>
        </div>
        <p className="portal-description">
          Please select your role to proceed to the dedicated portal.
        </p>
      </div>

      <div className="role-cards-container">
        <div 
          className="role-card admin-card"
          onClick={() => handleRoleSelect('admin')}
        >
          <div className="role-icon">🔒⚙️</div>
          <h3>Administrator</h3>
          <p>Manage hospital staff, patient records, and system settings.</p>
          <div className="security-badge">Security Protected</div>
          <div className="role-arrow">→</div>
        </div>

        <div 
          className="role-card"
          onClick={() => handleRoleSelect('doctor')}
        >
          <div className="role-icon">🩺</div>
          <h3>Doctor</h3>
          <p>Access patient charts, manage appointments, and update records.</p>
          <div className="role-arrow">→</div>
        </div>

        <div 
          className="role-card"
          onClick={() => handleRoleSelect('patient')}
        >
          <div className="role-icon">👤</div>
          <h3>Patient</h3>
          <p>View your appointments, medical history, and AI health checkup.</p>
          <div className="role-arrow">→</div>
        </div>
      </div>
    </div>
  );

  const renderLoginForm = () => {
    const getRoleTitle = () => {
      switch(selectedRole) {
        case 'admin': return 'Administrator';
        case 'doctor': return 'Doctor';
        case 'patient': return 'Patient';
        default: return '';
      }
    };

    const getRoleDescription = () => {
      switch(selectedRole) {
        case 'admin': return 'Manage hospital operations and system settings';
        case 'doctor': return 'Access patient records and medical management tools';
        case 'patient': return 'View your medical records and appointments';
        default: return '';
      }
    };

    return (
      <div className="login-form-view">
        <button className="back-button" onClick={handleBackToRoleSelection}>
          ← Back to Role Selection
        </button>

        <div className="form-header">
          <h2>{getRoleTitle()} Portal</h2>
          <p>{getRoleDescription()}</p>
        </div>

        <div className="auth-toggle">
          <button
            className={`toggle-btn ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthMode('login')}
            disabled={isLoading}
          >
            Sign In
          </button>
          <button
            className={`toggle-btn ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthMode('signup')}
            disabled={isLoading}
          >
            {selectedRole === 'patient' ? 'Register' : 'Create Account'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === 'signup' ? (
            <>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name (3-20 characters)"
                  required
                  className={errors.fullName ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your 10-digit phone number"
                  required
                  className={errors.phoneNumber ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>

              <div className="form-group role-group">
                <label htmlFor="role">Role</label>
                <div className="role-display">
                  <span className="role-badge">{getRoleTitle()}</span>
                </div>
                <input
                  type="hidden"
                  name="role"
                  value={selectedRole}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (6-12 characters with capital & special)"
                  required
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
                <PasswordStrengthIndicator />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (selectedRole === 'patient' ? 'Register as Patient' : `Create ${getRoleTitle()} Account`)}
              </button>

              <FeedbackMessage />

              <p className="switch-auth">
                Already have an account?{' '}
                <button type="button" onClick={toggleAuthMode} className="link-btn" disabled={isLoading}>
                  Sign in here
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : `Sign In as ${getRoleTitle()}`}
              </button>

              <FeedbackMessage />

              <p className="switch-auth">
                Don't have an account?{' '}
                <button type="button" onClick={toggleAuthMode} className="link-btn" disabled={isLoading}>
                  {selectedRole === 'patient' ? 'Register here' : 'Create account'}
                </button>
              </p>
            </>
          )}
        </form>

        <LoadingSpinner />
      </div>
    );
  };

  return (
    <div className="hospital-app">
      <Header />
      
      <main className="hospital-main-content">
        <div className="login-portal-container">
          <div className="login-portal-card">
            {!selectedRole && !showAdminVerification ? renderRoleSelection() : 
             showAdminVerification ? renderAdminVerification() : 
             renderLoginForm()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;