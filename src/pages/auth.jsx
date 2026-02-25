import React, { useState } from 'react';
import './auth.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import Joyride from 'react-joyride';

export default function Auth({ showNotification, showModal }) {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [runTour, setRunTour] = useState(true);
  const { signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithFacebook } = useFirebase();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
    regName: '',
    regEmail: '',
    regPassword: '',
    regConfirm: '',
    rememberMe: false,
    terms: false
  });

  const steps = [
    {
      target: '.auth-tabs',
      content: 'Switch between Login and Registration',
      title: 'Toggle Forms',
      placement: 'bottom',
    },
    {
      target: '.form-group',
      content: 'Fill in your details to get started',
      title: 'Your Information',
      placement: 'bottom',
    },
    {
      target: '.btn',
      content: 'Click here to create your account or login',
      title: 'Submit Form',
      placement: 'top',
    },
    {
      target: '.social-login',
      content: 'Or sign in quickly with Google or Facebook',
      title: 'Social Login',
      placement: 'top',
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { loginEmail, loginPassword } = formData;

    if (!loginEmail || !loginPassword) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(loginEmail, loginPassword);

    if (result.success) {
      showNotification('🎉 Login successful! Welcome back!', 'success');
      setTimeout(() => navigate('/'), 2000);
    } else {
      showNotification(result.error, 'error');
      showModal({
        type: 'error',
        title: 'Login Failed',
        message: result.error,
        confirmText: 'Try Again'
      });
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { regName, regEmail, regPassword, regConfirm, terms } = formData;

    if (!regName || !regEmail || !regPassword || !regConfirm) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    if (regPassword !== regConfirm) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (!terms) {
      showNotification('You must agree to the terms and conditions', 'warning');
      return;
    }

    setLoading(true);
    const result = await signUpWithEmail(regEmail, regPassword, {
      name: regName,
      phone: ''
    });

    if (result.success) {
      showNotification('🎉 Registration successful! Welcome to Sport IQ!', 'success');
      showModal({
        type: 'success',
        title: 'Welcome Aboard!',
        message: 'Your account has been created successfully. Start exploring our predictions!',
        confirmText: 'Start Winning',
        onConfirm: () => navigate('/predictions')
      });
    } else {
      showNotification(result.error, 'error');
      showModal({
        type: 'error',
        title: 'Registration Failed',
        message: result.error,
        confirmText: 'Try Again'
      });
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    let result;

    if (provider === 'google') {
      result = await signInWithGoogle();
    } else if (provider === 'facebook') {
      result = await signInWithFacebook();
    }

    if (result.success) {
      showNotification(`🎉 Successfully signed in with ${provider}!`, 'success');
      setTimeout(() => navigate('/'), 2000);
    } else {
      showNotification(result.error, 'error');
    }
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setRunTour(false);
    setTimeout(() => setRunTour(true), 100);
  };

  return (
    <div className="auth-container">
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        styles={{
          options: { primaryColor: '#22c55e' }
        }}
      />

      <div className="auth-tabs">
        <div
          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => handleTabChange('login')}
        >
          Login
        </div>
        <div
          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => handleTabChange('register')}
        >
          Register
        </div>
      </div>

      <form
        className="auth-form"
        style={{ display: activeTab === 'login' ? 'block' : 'none' }}
        onSubmit={handleLoginSubmit}
      >
        <div className="form-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your predictions</p>
        </div>

        <div className="form-group">
          <label htmlFor="loginEmail">Email Address</label>
          <input
            type="email"
            id="loginEmail"
            name="loginEmail"
            value={formData.loginEmail}
            onChange={handleInputChange}
            placeholder="Your email address"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="loginPassword">Password</label>
          <input
            type="password"
            id="loginPassword"
            name="loginPassword"
            value={formData.loginPassword}
            onChange={handleInputChange}
            placeholder="Your password"
            disabled={loading}
            required
          />
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="remember"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={loading}
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          <NavLink to="#" className="forgot-password" onClick={(e) => {
            e.preventDefault();
            showNotification('Password reset feature coming soon!', 'info');
          }}>Forgot password?</NavLink>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login to Account'}
        </button>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-login">
          <button 
            type="button" 
            className="social-btn" 
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <span>Google</span>
          </button>
          {/*<button 
            type="button" 
            className="social-btn" 
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
          >
            <span>Facebook</span>
          </button>*/}
        </div>

        <div className="form-footer">
          Don't have an account? <NavLink to="#" onClick={(e) => { e.preventDefault(); handleTabChange('register'); }}>Sign up here</NavLink>
        </div>
      </form>

      <form
        className="auth-form"
        style={{ display: activeTab === 'register' ? 'block' : 'none' }}
        onSubmit={handleRegisterSubmit}
      >
        <div className="form-header">
          <h2>Create Account</h2>
          <p>Join thousands of winning bettors</p>
        </div>

        <div className="form-group">
          <label htmlFor="reg-name">Full Name</label>
          <input
            type="text"
            id="reg-name"
            name="regName"
            value={formData.regName}
            onChange={handleInputChange}
            placeholder="Your full name"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email Address</label>
          <input
            type="email"
            id="reg-email"
            name="regEmail"
            value={formData.regEmail}
            onChange={handleInputChange}
            placeholder="Your email address"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input
            type="password"
            id="reg-password"
            name="regPassword"
            value={formData.regPassword}
            onChange={handleInputChange}
            placeholder="Create a password"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-confirm">Confirm Password</label>
          <input
            type="password"
            id="reg-confirm"
            name="regConfirm"
            value={formData.regConfirm}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            disabled={loading}
            required
          />
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
            <label htmlFor="terms">I agree to the <NavLink to="#" style={{ color: "var(--primary)"}}>Terms & Conditions</NavLink></label>
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-login">
          <button 
            type="button" 
            className="social-btn" 
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <span>Google</span>
          </button>
          {/*<button 
            type="button" 
            className="social-btn" 
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
          >
            <span>Facebook</span>
          </button>*/}
        </div>

        <div className="form-footer">
          Already have an account? <NavLink to="#" onClick={(e) => { e.preventDefault(); handleTabChange('login'); }}>Sign in here</NavLink>
        </div>
      </form>
    </div>
  );
}