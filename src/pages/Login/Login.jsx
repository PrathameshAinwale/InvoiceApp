import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdEmail } from 'react-icons/md';
import { MdLockOutline } from 'react-icons/md';
import './Auth.css';

const Login = () => {
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim())    errs.email    = 'Email is required';
    if (!formData.password.trim()) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(formData.email, formData.password);
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="auth-page">

      {/* Logo */}
      <div className="auth-logo-section">
        <div className="auth-logo">
          <img src="https://placehold.co/60x60/667eea/ffffff?text=Logo" alt="logo" />
        </div>
        <h1 className="auth-app-name">InvoiceApp</h1>
        <p className="auth-tagline">Manage your business invoices</p>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Email */}
          <div className="float-field">
            <div className="input-with-icon">
              <MdEmail className="input-icon" size={17} />
              <input
                className={`float-input has-icon ${formData.email ? 'has-value' : ''} ${errors.email ? 'input-error' : ''}`}
                type="email" name="email" placeholder=" "
                value={formData.email} onChange={handleChange}
              />
              <label className="float-label icon-label">Email</label>
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="float-field">
            <div className="input-with-icon">
              <MdLockOutline className="input-icon" size={17} />
              <input
                className={`float-input has-icon ${formData.password ? 'has-value' : ''} ${errors.password ? 'input-error' : ''}`}
                type="password" name="password" placeholder=" "
                value={formData.password} onChange={handleChange}
              />
              <label className="float-label icon-label">Password</label>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Sign Up</Link>
        </p>
      </div>

    </div>
  );
};

export default Login;