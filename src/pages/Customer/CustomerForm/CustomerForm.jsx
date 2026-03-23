import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { IoPersonSharp } from 'react-icons/io5';
import { MdEmail, MdOutlineLocationOn, MdOutlineHome } from 'react-icons/md';
import { FaPhoneAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import API from '../../../api/api'; // ✅ connected to backend
import './CustomerForm1.css';
import TopNav from '../../../components/common/TopNav';

const categories = ['Business', 'Individual'];

const emptyForm = {
  name:             '',
  email:            '',
  phone:            '',
  country:          '',
  category:         '',
  billing_address:  '',
  shipping_address: '',
};

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const { t }    = useTranslation();

  const [formData, setFormData] = useState(emptyForm);
  const [errors,   setErrors]   = useState({});
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  // ✅ Fetch existing customer in edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetchCustomer = async () => {
      try {
        const res = await API.get(`/customers/${id}`);
        const c   = res.data.customer;
        setFormData({
          name:             c.name             || '',
          email:            c.email            || '',
          phone:            c.phone            || '',
          country:          c.country          || '',
          category:         c.category         || '',
          billing_address:  c.billing_address  || '',
          shipping_address: c.shipping_address || '',
        });
      } catch (err) {
        console.error('Failed to fetch customer:', err.message);
      }
    };
    fetchCustomer();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({  ...errors,   [e.target.name]: '' });
  };

  // ✅ Only name and phone are compulsory
  const validate = () => {
    const errs = {};
    if (!formData.name.trim())  errs.name  = t("customerForm.nameError");
    if (!formData.phone.trim()) errs.phone = t("customerForm.phoneError");
    return errs;
  };

  // ✅ Submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/customers/${id}`, formData);
      } else {
        await API.post('/customers', formData);
      }
      setSuccess(true);
      setTimeout(() => navigate('/customers'), 2000);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
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

          {/* Name ✅ compulsory */}
          <div className="float-field">
            <div className="input-with-icon">
              <IoPersonSharp className="input-icon" size={16} />
              <input
                className={`float-input-customer has-icon ${formData.name ? 'has-value' : ''} ${errors.name ? 'input-error' : ''}`}
                type="text" name="name" placeholder=" "
                value={formData.name} onChange={handleChange}
              />
              <label className="float-label icon-label">
                {t("customerForm.fullName")} <span style={{ color: 'red' }}>*</span>
              </label>
            </div>
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          {/* Email — optional */}
          <div className="float-field">
            <div className="input-with-icon">
              <MdEmail className="input-icon" size={17} />
              <input
                className={`float-input-customer has-icon ${formData.email ? 'has-value' : ''}`}
                type="email" name="email" placeholder=" "
                value={formData.email} onChange={handleChange}
              />
              <label className="float-label icon-label">{t("customerForm.email")}</label>
            </div>
          </div>

          {/* Phone ✅ compulsory */}
          <div className="float-field">
            <div className="input-with-icon">
              <FaPhoneAlt className="input-icon" size={14} />
              <input
                className={`float-input-customer has-icon ${formData.phone ? 'has-value' : ''} ${errors.phone ? 'input-error' : ''}`}
                type="tel" name="phone" placeholder=" "
                value={formData.phone} onChange={handleChange}
              />
              <label className="float-label icon-label">
                {t("customerForm.phone")} <span style={{ color: 'red' }}>*</span>
              </label>
            </div>
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>

          {/* Country — optional */}
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

          {/* Billing Address ✅ new */}
          <div className="float-field">
            <div className="input-with-icon textarea-icon-wrapper">
              <MdOutlineHome className="input-icon textarea-icon" size={18} />
              <textarea
                className={`float-textarea has-icon ${formData.billing_address ? 'has-value' : ''}`}
                name="billing_address" placeholder=" "
                value={formData.billing_address} onChange={handleChange}
              />
              <label className="float-label icon-label">
                {t("customerForm.billingAddress") || "Billing Address"}
              </label>
            </div>
          </div>

          {/* Shipping Address ✅ new */}
          <div className="float-field">
            <div className="input-with-icon textarea-icon-wrapper">
              <MdOutlineLocationOn className="input-icon textarea-icon" size={18} />
              <textarea
                className={`float-textarea has-icon ${formData.shipping_address ? 'has-value' : ''}`}
                name="shipping_address" placeholder=" "
                value={formData.shipping_address} onChange={handleChange}
              />
              <label className="float-label icon-label">
                {t("customerForm.shippingAddress") || "Shipping Address"}
              </label>
            </div>
          </div>

          {/* Category — optional */}
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
          </div>

          {/* General error */}
          {errors.general && (
            <p className="field-error" style={{ textAlign: 'center' }}>{errors.general}</p>
          )}

          {/* Success */}
          {success && (
            <div className="success-message">
              {isEdit ? t("customerForm.successEdit") : t("customerForm.successAdd")}
            </div>
          )}

          <button type="submit" className="customer-submit-btn" disabled={loading}>
            {loading
              ? "Saving..."
              : isEdit ? t("customerForm.submitEdit") : t("customerForm.submitAdd")}
          </button>

        </form>
      </div>
    </>
  );
};

export default CustomerForm;