import React, { useState, useEffect } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { validateProfile } from "../../utils/validations/profileValidation";


const Profile = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loadingCountry, setLoadingCountry] = useState(true);
  const [image, setImage] = useState(null);
  const [upiQR, setUpiQR] = useState(null);
  const [countries, setCountries]   = useState([]);      
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    contact: "",
    company: "",
    address: "",
    customers: "",
    pan: "",
    gst: "",
    terms: "",
    currency: "",
    website: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
  });

  useEffect(() => {
    fetch("https://openexchangerates.org/api/currencies.json")
      .then((res) => res.json())
      .then((data) => {
        const list = Object.entries(data).map(([code, name]) => ({
          code,
          name,
        }));
        setCurrencies(list);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load currencies");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("https://restcountries.com/v2/all?fields=name,callingCodes,alpha2Code")
      .then(res => res.json())
      .then(data => {
        const list = data
          .filter(c => c.callingCodes[0])   // remove empty codes
          .map(c => ({
            name: c.name,
            code: `+${c.callingCodes[0]}`,
            alpha2: c.alpha2Code,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)); // sort alphabetically
        setCountries(list);
        setLoadingCountry(false);
      })
      .catch(() => {
        setError("Failed to load country codes");
        setLoadingCountry(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({  ...errors,   [e.target.name]: "" });
  };

  // when country code changes, clear contact field
  const handleCountryChange = (e) => {
    setFormData({ ...formData, countryCode: e.target.value, contact: "" });
    setErrors({  ...errors,   countryCode: "", contact: "" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

const handleSubmit = (e) => {
  e.preventDefault();

  const validationErrors = validateProfile(formData);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors); 
    return;
  }

  setErrors({});       
  setSuccess(true);
  setTimeout(() => navigate("/"), 2000);
};
  const handleUpiQR = (e) => {
    const file = e.target.files[0];
    if (file) setUpiQR(URL.createObjectURL(file));
  };

  return (
    <div className="profile-page page">
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper">
          {image ? (
            <img src={image} alt="profile" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-placeholder">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            id="profile-input"
            className="profile-avatar-edit-input"
            onChange={handleImageChange}
          />
          <label htmlFor="profile-input" className="profile-avatar-edit-btn">
            +
          </label>
        </div>
        <p className="profile-avatar-name">{formData.name || "Your Name"}</p>
      </div>

      <h2 className="profile-heading">Your Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />
            {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

       {/* Replace your existing contact field with this */}
<div className="form-field">
  <label className="form-label">Contact Number</label>
  <div className="contact-row">

    {/* Country Code Dropdown */}
    {loadingCountry ? (
      <p className="currency-loading">Loading...</p>
    ) : (
      <select
        className="form-select country-code-select"
        name="countryCode"
        value={formData.countryCode}
        onChange={handleCountryChange}
      >
        {countries.map(({ code, name, alpha2 }) => (
          <option key={alpha2} value={code}>
            {code} {name}
          </option>
        ))}
      </select>
    )}

    {/* Contact Input */}
    <input
      className="form-input contact-input"
      type="tel"
      name="contact"
      placeholder="Enter contact number"
      value={formData.contact}
      onChange={(e) => {
        const val = e.target.value.replace(/\D/g, "");
        setFormData({ ...formData, contact: val });
        setErrors({ ...errors, contact: "" });
      }}
    />

  </div>
  {errors.countryCode && <p className="field-error">{errors.countryCode}</p>}
  {errors.contact     && <p className="field-error">{errors.contact}</p>}
</div>

        <div className="form-field">
          <label className="form-label">Company Name</label>
          <input
            className="form-input"
            type="text"
            name="company"
            placeholder="Enter name of your company"
            value={formData.company}
            onChange={handleChange}
          />
          {errors.company && <p className="field-error">{errors.company}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Address</label>
          <input
            className="form-input"
            type="text"
            name="address"
            placeholder="Enter your address"
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && <p className="field-error">{errors.address}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Number of Customers</label>
          <input
            className="form-input"
            type="number"
            name="customers"
            placeholder="Enter number of customers"
            value={formData.customers}
            onChange={handleChange}
          />
          {errors.customers && <p className="field-error">{errors.customers}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">PAN Number</label>
          <input
            className="form-input"
            type="text"
            name="pan"
            placeholder="Enter PAN number"
            value={formData.pan}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="form-label">GST Number</label>
          <input
            className="form-input"
            type="text"
            name="gst"
            placeholder="Enter GST number"
            value={formData.gst}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Terms and Conditions</label>
          <textarea
            className="form-textarea"
            name="terms"
            placeholder="Add Terms and Conditions"
            value={formData.terms}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Currency</label>
          {loading ? (
            <p className="currency-loading">Loading currencies...</p>
          ) : error ? (
            <p className="currency-error">{error}</p>
          ) : (
            <select
              className="form-select"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="">Select currency</option>
              {currencies.map(({ code, name }) => (
                <option key={code} value={code}>
                  {code} — {name}
                </option>
              ))}
            </select>
          )}
          {errors.currency && <p className="field-error">{errors.currency}</p>}
        </div>
        <div className="form-field">
          <label className="form-label">Website</label>
          <input
            className="form-input"
            type="url"
            name="website"
            placeholder="https://yourwebsite.com"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        <div className="form-section-title">Bank Details</div>

        <div className="form-field">
          <label className="form-label">Account Number</label>
          <input
            className="form-input"
            type="number"
            name="accountNumber"
            placeholder="Enter account number"
            value={formData.accountNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Bank Name</label>
          <input
            className="form-input"
            type="text"
            name="bankName"
            placeholder="Enter bank name"
            value={formData.bankName}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="form-label">IFSC Code</label>
          <input
            className="form-input"
            type="text"
            name="ifscCode"
            placeholder="Enter IFSC code"
            value={formData.ifscCode}
            onChange={handleChange}
          />
        </div>

        <div className="form-section-title">UPI QR Code</div>

        <div className="form-field">
          <label className="form-label">Upload UPI QR Image</label>
          <div className="upi-qr-wrapper">
            {upiQR ? (
              <img src={upiQR} alt="UPI QR" className="upi-qr-img" />
            ) : (
              <div className="upi-qr-placeholder">
                <span className="upi-qr-icon">📷</span>
                <p>Tap to upload QR</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              id="upi-input"
              className="profile-avatar-edit-input"
              onChange={handleUpiQR}
            />
            <label htmlFor="upi-input" className="upi-qr-edit-btn">
              {upiQR ? "Change QR" : "Upload QR"}
            </label>
          </div>
        </div>
        {success && (
          <div className="success-message">Profile updated successfully!</div>
        )}
        <button type="submit" className="profile-submit-btn">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
