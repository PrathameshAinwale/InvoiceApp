import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { IoPersonSharp } from 'react-icons/io5';
import { MdEmail, MdOutlineLocationOn } from 'react-icons/md';
import { FaPhoneAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import customers from '../../../data/customer.json';
import './CustomerForm1.css';
import TopNav from '../../../components/common/TopNav';

const categories = ['Business', 'Individual'];
const statuses   = ['paid', 'pending', 'overdue'];

const emptyForm = {
  name: '', email: '', phone: '',
  country: '', category: '', status: 'paid',
};

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const { t }    = useTranslation();

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors]     = useState({});
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    if (isEdit) {
      const existing = customers.find(c => c.id === id);
      if (existing) {
        setFormData({
          name:     existing.name     || '',
          email:    existing.email    || '',
          phone:    existing.phone    || '',
          country:  existing.country  || '',
          category: existing.category || '',
          status:   existing.status   || 'paid',
        });
      }
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({  ...errors,   [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim())  errs.name     = t("customerForm.nameError");
    if (!formData.email.trim()) errs.email    = t("customerForm.emailError");
    if (!formData.phone.trim()) errs.phone    = t("customerForm.phoneError");
    if (!formData.category)     errs.category = t("customerForm.categoryError");
    if (!formData.status)       errs.status   = t("customerForm.statusError");
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log(isEdit ? 'Updating:' : 'Adding:', formData);
    setSuccess(true);
    setTimeout(() => navigate('/customers'), 2000);
  };

  return (
    <>
      <TopNav />
      <div className="customer-form-page page">

        {/* Header */}
        <div className="customer-form-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>
          <h2 className="customer-form-title">
            {isEdit ? t("customerForm.editTitle") : t("customerForm.addTitle")}
          </h2>
        </div>

        <form className="customer-form" onSubmit={handleSubmit}>

          {/* Name */}
          <div className="float-field">
            <div className="input-with-icon">
              <IoPersonSharp className="input-icon" size={16} />
              <input
                className={`float-input-customer has-icon ${formData.name ? 'has-value' : ''} ${errors.name ? 'input-error' : ''}`}
                type="text" name="name" placeholder=" "
                value={formData.name} onChange={handleChange}
              />
              <label className="float-label icon-label">{t("customerForm.fullName")}</label>
            </div>
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="float-field">
            <div className="input-with-icon">
              <MdEmail className="input-icon" size={17} />
              <input
                className={`float-input-customer has-icon ${formData.email ? 'has-value' : ''} ${errors.email ? 'input-error' : ''}`}
                type="email" name="email" placeholder=" "
                value={formData.email} onChange={handleChange}
              />
              <label className="float-label icon-label">{t("customerForm.email")}</label>
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="float-field">
            <div className="input-with-icon">
              <FaPhoneAlt className="input-icon" size={14} />
              <input
                className={`float-input-customer has-icon ${formData.phone ? 'has-value' : ''} ${errors.phone ? 'input-error' : ''}`}
                type="tel" name="phone" placeholder=" "
                value={formData.phone} onChange={handleChange}
              />
              <label className="float-label icon-label">{t("customerForm.phone")}</label>
            </div>
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>

          {/* Country */}
          <div className="float-field">
            <div className="input-with-icon">
              <MdOutlineLocationOn className="input-icon" size={18} />
              <input
                className={`float-input-customer has-icon ${formData.country ? 'has-value' : ''}`}
                type="text" name="country" placeholder=" "
                value={formData.country} onChange={handleChange}
              />
              <label className="float-label icon-label">{t("customerForm.country")}</label>
            </div>
          </div>

          {/* Category */}
          <div className="float-field">
            <label className="float-label-static">{t("customerForm.customerType")}</label>
            <div className="status-options">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`status-option-btn ${formData.category === cat ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, category: cat })}
                >
                  {t(`customerForm.categories.${cat}`)}
                </button>
              ))}
            </div>
            {errors.category && <p className="field-error">{errors.category}</p>}
          </div>

          {/* Status */}
          <div className="float-field">
            <label className="float-label-static">{t("customerForm.paymentStatus")}</label>
            <div className="status-options">
              {statuses.map(s => (
                <button
                  key={s}
                  type="button"
                  className={`status-option-btn ${formData.status === s ? `active ${s}` : ''}`}
                  onClick={() => setFormData({ ...formData, status: s })}
                >
                  {t(`customerForm.statuses.${s}`)}
                </button>
              ))}
            </div>
            {errors.status && <p className="field-error">{errors.status}</p>}
          </div>

          {/* Success Message */}
          {success && (
            <div className="success-message">
              {isEdit ? t("customerForm.successEdit") : t("customerForm.successAdd")}
            </div>
          )}

          <button type="submit" className="customer-submit-btn">
            {isEdit ? t("customerForm.submitEdit") : t("customerForm.submitAdd")}
          </button>

        </form>
      </div>
    </>
  );
};

export default CustomerForm;