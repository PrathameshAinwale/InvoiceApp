import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdEmail, MdLockOutline } from 'react-icons/md';
import { IoPersonSharp } from 'react-icons/io5';
import './Auth.css';

const Signup = () => {
  const navigate    = useNavigate();
  const { signup }  = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim())     errs.name     = 'Name is required';
    if (!formData.email.trim())    errs.email    = 'Email is required';
    if (!formData.password.trim()) errs.password = 'Password is required';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirm) errs.confirm = 'Passwords do not match';
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
      signup(formData.email, formData.password, formData.name);
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
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Sign up to get started</p>

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Name */}
          <div className="float-field">
            <div className="input-with-icon">
              <IoPersonSharp className="input-icon" size={16} />
              <input
                className={`float-input has-icon ${formData.name ? 'has-value' : ''} ${errors.name ? 'input-error' : ''}`}
                type="text" name="name" placeholder=" "
                value={formData.name} onChange={handleChange}
              />
              <label className="float-label icon-label">Full Name</label>
            </div>
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

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

          {/* Confirm Password */}
          <div className="float-field">
            <div className="input-with-icon">
              <MdLockOutline className="input-icon" size={17} />
              <input
                className={`float-input has-icon ${formData.confirm ? 'has-value' : ''} ${errors.confirm ? 'input-error' : ''}`}
                type="password" name="confirm" placeholder=" "
                value={formData.confirm} onChange={handleChange}
              />
              <label className="float-label icon-label">Confirm Password</label>
            </div>
            {errors.confirm && <p className="field-error">{errors.confirm}</p>}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>

    </div>
  );
};

export default Signup;