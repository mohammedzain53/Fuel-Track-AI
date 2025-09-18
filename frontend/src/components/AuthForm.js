// frontend/src/components/AuthForm.js
import React, { useState, useEffect } from 'react';

export default function AuthForm({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Add floating animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      const floatingElements = document.querySelectorAll('.floating-element');
      floatingElements.forEach((el, index) => {
        el.style.transform = `translateY(${Math.sin(Date.now() * 0.001 + index) * 10}px)`;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        onLogin(data.user, data.token);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('Registration successful! You can now login.');
        setActiveTab('login');
        setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Animated Background Elements */}
      <div className="auth-background">
        <div className="floating-element fuel-icon">⛽</div>
        <div className="floating-element car-icon">🚗</div>
        <div className="floating-element chart-icon">📊</div>
        <div className="floating-element ai-icon">🤖</div>
        <div className="floating-element money-icon">💰</div>
        <div className="floating-element gas-icon">⛽</div>
      </div>

      <div className="auth-content">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-logo">
            <div className="logo-icon">⛽</div>
            <h1 className="brand-title">Fuel Track AI</h1>
            <p className="brand-subtitle">Smart Fuel Management Made Simple</p>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Track fuel expenses effortlessly</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🗺️</span>
              <span>Find nearby gas stations</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>AI-powered insights</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Analyze fuel efficiency</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="auth-form-container">
          <div className="auth-form-card">
            {/* Tab Navigation */}
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                <span className="tab-icon">🔐</span>
                Sign In
              </button>
              <button 
                className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                <span className="tab-icon">👤</span>
                Sign Up
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="auth-alert error">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}
            {success && (
              <div className="auth-alert success">
                <span className="alert-icon">✅</span>
                {success}
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-header">
                  <h2>Welcome Back!</h2>
                  <p>Sign in to continue tracking your fuel expenses</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      className="form-input"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-button primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <span className="button-icon">🚀</span>
                      Sign In
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="auth-form">
                <div className="form-header">
                  <h2>Join Fuel Track AI</h2>
                  <p>Create your account and start tracking fuel expenses</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className="form-input"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      className="form-input"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="Create a password"
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔐</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-button success" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <span className="button-icon">✨</span>
                      Create Account
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="auth-footer">
              <p>
                {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  className="link-button"
                  onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                >
                  {activeTab === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}