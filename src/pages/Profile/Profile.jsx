import React, { useState, useEffect } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { validateProfile } from "../../utils/validations/profileValidation";
import { IoPersonSharp } from "react-icons/io5";
import {
  MdEmail,
  MdReceiptLong,
  MdAccountBalance,
  MdOutlineCreditCard,
  MdOutlineNumbers,
  MdOutlineQrCode2,
  MdCurrencyRupee,
  MdOutlinePolicy,
  MdOutlineLanguage,
} from "react-icons/md";
import { FaPhoneAlt, FaAddressBook, FaAddressCard } from "react-icons/fa";
import { HiMiniBuildingOffice } from "react-icons/hi2";
import { IoMdPeople } from "react-icons/io";
import { BsBank2 } from "react-icons/bs";
import { MdOutlineGavel } from "react-icons/md";

const Profile = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loadingCountry, setLoadingCountry] = useState(true);
  const [image, setImage] = useState(null);
  const [upiQR, setUpiQR] = useState(null);
  const [countries, setCountries] = useState([]);
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
    fetch("https://api.frankfurter.dev/v1/currencies")
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
    fetch(
      "https://restcountries.com/v2/all?fields=name,callingCodes,alpha2Code",
    )
      .then((res) => res.json())
      .then((data) => {
        const list = data
          .filter((c) => c.callingCodes[0])
          .map((c) => ({
            name: c.name,
            code: `+${c.callingCodes[0]}`,
            alpha2: c.alpha2Code,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
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
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCountryChange = (e) => {
    setFormData({ ...formData, countryCode: e.target.value, contact: "" });
    setErrors({ ...errors, countryCode: "", contact: "" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleUpiQR = (e) => {
    const file = e.target.files[0];
    if (file) setUpiQR(URL.createObjectURL(file));
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

  return (
    <div className="profile-page">
      {/* Avatar */}
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
        {/* Full Name */}
        <div className="float-field">
          <div className="input-with-icon">
            <IoPersonSharp className="input-icon" size={16} />
            <input
              className={`float-input has-icon ${formData.name ? "has-value" : ""} ${errors.name ? "input-error" : ""}`}
              type="text"
              name="name"
              placeholder=" "
              value={formData.name}
              onChange={handleChange}
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
              className={`float-input has-icon ${formData.email ? "has-value" : ""} ${errors.email ? "input-error" : ""}`}
              type="email"
              name="email"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
            />
            <label className="float-label icon-label">Email</label>
          </div>
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        {/* Contact Number */}
        <div className="float-field">
          <div
            className={`phone-input-box ${formData.contact ? "has-value" : ""}`}
          >
            <FaPhoneAlt
              size={13}
              style={{ marginLeft: "14px", color: "#667eea", flexShrink: 0 }}
            />
            <select
              className="phone-code-select"
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
            <div className="phone-divider" />
            <input
              className="phone-number-input"
              type="tel"
              name="contact"
              placeholder="Contact number"
              value={formData.contact}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, contact: val });
                setErrors({ ...errors, contact: "" });
              }}
            />
          </div>
          {errors.countryCode && (
            <p className="field-error">{errors.countryCode}</p>
          )}
          {errors.contact && <p className="field-error">{errors.contact}</p>}
        </div>

        {/* Company */}
        <div className="float-field">
          <div className="input-with-icon">
            <HiMiniBuildingOffice className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.company ? "has-value" : ""} ${errors.company ? "input-error" : ""}`}
              type="text"
              name="company"
              placeholder=" "
              value={formData.company}
              onChange={handleChange}
            />
            <label className="float-label icon-label">Company Name</label>
          </div>
          {errors.company && <p className="field-error">{errors.company}</p>}
        </div>

        {/* Address */}
        <div className="float-field">
          <div className="input-with-icon">
            <FaAddressBook className="input-icon" size={16} />
            <input
              className={`float-input has-icon ${formData.address ? "has-value" : ""} ${errors.address ? "input-error" : ""}`}
              type="text"
              name="address"
              placeholder=" "
              value={formData.address}
              onChange={handleChange}
            />
            <label className="float-label icon-label">Address</label>
          </div>
          {errors.address && <p className="field-error">{errors.address}</p>}
        </div>

        {/* Number of Customers */}
        <div className="float-field">
          <div className="input-with-icon">
            <IoMdPeople className="input-icon" size={18} />
            <input
              className={`float-input has-icon ${formData.customers ? "has-value" : ""} ${errors.customers ? "input-error" : ""}`}
              type="number"
              name="customers"
              placeholder=" "
              value={formData.customers}
              onChange={handleChange}
            />
            <label className="float-label icon-label">
              Number of Customers
            </label>
          </div>
          {errors.customers && (
            <p className="field-error">{errors.customers}</p>
          )}
        </div>

        {/* PAN */}
        <div className="float-field">
          <div className="input-with-icon">
            <FaAddressCard className="input-icon" size={16} />
            <input
              className={`float-input has-icon ${formData.pan ? "has-value" : ""}`}
              type="text"
              name="pan"
              placeholder=" "
              value={formData.pan}
              onChange={handleChange}
            />
            <label className="float-label icon-label">PAN Number</label>
          </div>
        </div>

        {/* GST */}
        <div className="float-field">
          <div className="input-with-icon">
            <MdReceiptLong className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.gst ? "has-value" : ""}`}
              type="text"
              name="gst"
              placeholder=" "
              value={formData.gst}
              onChange={handleChange}
            />
            <label className="float-label icon-label">GST Number</label>
          </div>
        </div>

        {/* Terms */}
        <div className="float-field">
          <div className="input-with-icon textarea-icon-wrapper">
            <MdOutlineGavel className="input-icon textarea-icon" size={17} />
            <textarea
              className={`float-textarea has-icon ${formData.terms ? "has-value" : ""}`}
              name="terms"
              placeholder=" "
              value={formData.terms}
              onChange={handleChange}
            />
            <label className="float-label icon-label">
              Terms and Conditions
            </label>
          </div>
        </div>

        {/* Currency */}
<div className="float-field">
  <label className="float-label-static" style={{ color: "#667eea" }}>
    <MdCurrencyRupee size={16} style={{ verticalAlign: "middle", marginRight: "6px", color: "#667eea" }} />
    Currency
  </label>
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
        <option key={code} value={code}>{code} — {name}</option>
      ))}
    </select>
  )}
  {errors.currency && <p className="field-error">{errors.currency}</p>}
</div>
        {/* Website */}
        <div className="float-field">
          <div className="input-with-icon">
            <MdOutlineLanguage className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.website ? "has-value" : ""}`}
              type="url"
              name="website"
              placeholder=" "
              value={formData.website}
              onChange={handleChange}
            />
            <label className="float-label icon-label">Website (optional)</label>
          </div>
        </div>

        {/* Bank Details */}
        <div className="form-section-title">
          <MdAccountBalance size={18} style={{ color: "#667eea" }} />
          Bank Details
        </div>

        {/* Account Number */}
        <div className="float-field">
          <div className="input-with-icon">
            <MdOutlineCreditCard className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.accountNumber ? "has-value" : ""}`}
              type="number"
              name="accountNumber"
              placeholder=" "
              value={formData.accountNumber}
              onChange={handleChange}
            />
            <label className="float-label icon-label">Account Number</label>
          </div>
        </div>

        {/* Bank Name */}
        <div className="float-field">
          <div className="input-with-icon">
            <BsBank2 className="input-icon" size={16} />
            <input
              className={`float-input has-icon ${formData.bankName ? "has-value" : ""}`}
              type="text"
              name="bankName"
              placeholder=" "
              value={formData.bankName}
              onChange={handleChange}
            />
            <label className="float-label icon-label">Bank Name</label>
          </div>
        </div>

        {/* IFSC Code */}
        <div className="float-field">
          <div className="input-with-icon">
            <MdOutlineNumbers className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.ifscCode ? "has-value" : ""}`}
              type="text"
              name="ifscCode"
              placeholder=" "
              value={formData.ifscCode}
              onChange={handleChange}
            />
            <label className="float-label icon-label">IFSC Code</label>
          </div>
        </div>

        {/* UPI QR */}
        {/* UPI QR */}
        <div className="form-section-title">
          <MdOutlineQrCode2 size={18} style={{ color: "#677eea" }} />
          UPI QR Code
        </div>

        <div className="float-field">
          <label className="float-label-static">Upload UPI QR Image</label>

          {/* hidden input */}
          <input
            type="file"
            accept="image/*"
            id="upi-input"
            className="profile-avatar-edit-input"
            onChange={handleUpiQR}
          />

          {/* clicking the box triggers the input */}
          <label htmlFor="upi-input" className="upi-qr-wrapper">
            {upiQR ? (
              <img src={upiQR} alt="UPI QR" className="upi-qr-img" />
            ) : (
              <div className="upi-qr-placeholder">
                <MdOutlineQrCode2 size={40} color="#aaa" />
                <p>Tap to upload QR</p>
                <span className="upi-qr-hint">Click anywhere here</span>
              </div>
            )}
            {upiQR && <span className="upi-qr-change">Change QR</span>}
          </label>
        </div>

        <button type="submit" className="profile-submit-btn">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
