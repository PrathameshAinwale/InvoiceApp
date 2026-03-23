import React, { useState, useEffect } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { validateProfile } from "../../utils/validations/profileValidation";
import { useTranslation } from "react-i18next";
import { IoPersonSharp } from "react-icons/io5";
import {
  MdEmail, MdReceiptLong, MdAccountBalance, MdOutlineCreditCard,
  MdOutlineNumbers, MdOutlineQrCode2, MdCurrencyRupee,
  MdOutlineLanguage,
} from "react-icons/md";
import { FaPhoneAlt, FaAddressBook, FaAddressCard } from "react-icons/fa";
import { HiMiniBuildingOffice } from "react-icons/hi2";
import { BsBank2 } from "react-icons/bs";
import { MdOutlineGavel } from "react-icons/md";

const API_BASE = "http://localhost:5000";
import API from '../../api/api';

// ── Helper: convert File → base64 string ─────────────────
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
  });

const Profile = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [errors, setErrors]                 = useState({});
  const [success, setSuccess]               = useState(false);
  const [loadingCountry, setLoadingCountry] = useState(true);
  const [image, setImage]                   = useState(null);   // preview URL
  const [imageFile, setImageFile]           = useState(null);   // actual File object
  const [upiQR, setUpiQR]                   = useState(null);   // preview URL
  const [upiQRFile, setUpiQRFile]           = useState(null);   // actual File object
  const [countries, setCountries]           = useState([]);
  const [currencies, setCurrencies]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [pageLoading, setPageLoading]       = useState(true);
  const [isEditMode, setIsEditMode]         = useState(false);
  const [hasProfile, setHasProfile]         = useState(false);

  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "", email: "", countryCode: "+91", contact: "",
    company: "", address: "", pan: "", gst: "",
    terms: "", currency: "", website: "", accountNumber: "",
    bankName: "", ifscCode: "",
  });

  // ── Fetch currencies ─────────────────────────────────────
  useEffect(() => {
    fetch("https://api.frankfurter.dev/v1/currencies")
      .then((res) => res.json())
      .then((data) => {
        const list = Object.entries(data).map(([code, name]) => ({ code, name }));
        setCurrencies(list);
        setLoading(false);
      })
      .catch(() => {
        setError(t("profile.currencyError"));
        setLoading(false);
      });
  }, []);

  // ── Fetch countries ──────────────────────────────────────
  useEffect(() => {
    fetch("https://restcountries.com/v2/all?fields=name,callingCodes,alpha2Code")
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
        setError(t("profile.currencyError"));
        setLoadingCountry(false);
      });
  }, []);

  // ── Fetch existing profile on mount ──────────────────────
  useEffect(() => {
    if (!token) {
      setPageLoading(false);
      setIsEditMode(true);
      return;
    }

    fetch(`${API_BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        if (data?.profile) {
          const p = data.profile;
          setFormData({
            name:          p.name           || "",
            email:         p.email          || "",
            countryCode:   p.country_code   || "+91",
            contact:       p.contact        || "",
            company:       p.company        || "",
            address:       p.address        || "",
            pan:           p.pan            || "",
            gst:           p.gst            || "",
            terms:         p.terms          || "",
            currency:      p.currency       || "",
            website:       p.website        || "",
            accountNumber: p.account_number || "",
            bankName:      p.bank_name      || "",
            ifscCode:      p.ifsc_code      || "",
          });
          // ✅ Restore saved avatar & QR from DB (base64 strings)
          if (p.avatar) setImage(p.avatar);
          if (p.upi_qr) setUpiQR(p.upi_qr);

          setHasProfile(true);
          setIsEditMode(false);
        } else {
          setIsEditMode(true);
        }
        setPageLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsEditMode(true);
        setPageLoading(false);
      });
  }, []);

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    if (!isEditMode) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCountryChange = (e) => {
    if (!isEditMode) return;
    setFormData({ ...formData, countryCode: e.target.value, contact: "" });
    setErrors({ ...errors, countryCode: "", contact: "" });
  };

  // ✅ Store File object + create local preview
  const handleImageChange = (e) => {
    if (!isEditMode) return;
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleUpiQR = (e) => {
    if (!isEditMode) return;
    const file = e.target.files[0];
    if (file) {
      setUpiQRFile(file);
      setUpiQR(URL.createObjectURL(file));
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setErrors({});
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
      console.log('🚀 handleSubmit fired');        // ← add
  console.log('📦 formData:', formData);  

    const validationErrors = validateProfile(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // ✅ Convert new files to base64 (only if user picked new files)
      const avatarBase64 = imageFile ? await toBase64(imageFile) : null;
      const upiQRBase64  = upiQRFile ? await toBase64(upiQRFile) : null;

      // ✅ Send snake_case keys to match backend/DB columns
      const payload = {
        name:           formData.name,
        email:          formData.email,
        country_code:   formData.countryCode,
        contact:        formData.contact,
        company:        formData.company,
        address:        formData.address,
        pan:            formData.pan,
        gst:            formData.gst,
        terms:          formData.terms,
        currency:       formData.currency,
        website:        formData.website,
        account_number: formData.accountNumber,
        bank_name:      formData.bankName,
        ifsc_code:      formData.ifscCode,
        avatar:         avatarBase64,  // null if unchanged → backend keeps old value
        upi_qr:         upiQRBase64,   // null if unchanged → backend keeps old value
      };

      const method = hasProfile ? "PUT" : "POST";

      // Use axios client for consistent credentials + headers handling
      const axiosRes = await (method === 'POST'
        ? API.post('/profile', payload)
        : API.put('/profile', payload)
      );

      if (!(axiosRes && (axiosRes.status === 200 || axiosRes.status === 201))) {
        throw new Error((axiosRes && axiosRes.data && axiosRes.data.message) || 'Failed to save profile');
      }

      // ✅ Clear file refs after successful save
      setImageFile(null);
      setUpiQRFile(null);
      setErrors({});
      setSuccess(true);
      setHasProfile(true);
      setIsEditMode(false);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error(err);
      setErrors({ general: err.message || "Something went wrong. Please try again." });
    }
  };

  // ── Page loading ──────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="profile-page" style={{ textAlign: "center", padding: "60px 20px" }}>
        <p style={{ color: "#667eea", fontWeight: 600 }}>Loading profile...</p>
      </div>
    );
  }

  // ── Render (UI completely unchanged) ─────────────────────
  return (
    <div className="profile-page">
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper">
          {image ? (
            <img src={image} alt="profile" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-placeholder">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          {isEditMode && (
            <>
              <input
                type="file" accept="image/*" id="profile-input"
                className="profile-avatar-edit-input"
                onChange={handleImageChange}
              />
              <label htmlFor="profile-input" className="profile-avatar-edit-btn">+</label>
            </>
          )}
        </div>
        <p className="profile-avatar-name">{formData.name || t("profile.yourName")}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <h2 className="profile-heading" style={{ margin: 0 }}>{t("profile.heading")}</h2>
        {hasProfile && !isEditMode && (
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "#fff", border: "none", borderRadius: "8px",
              padding: "8px 18px", fontWeight: 600, cursor: "pointer",
              fontSize: "13px", alignItems: "center",
              gap: "6px", boxShadow: "0 2px 8px rgba(102,126,234,0.35)",
            }}
          >
           {t ("Edit")}
          </button>
        )}
      </div>

      {hasProfile && !isEditMode && (
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
          {t("You are viewing your profile. Click Edit to make changes.")}
        </p>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="float-field">
          <div className="input-with-icon">
            <IoPersonSharp className="input-icon" size={16} />
            <input
              className={`float-input has-icon ${formData.name ? "has-value" : ""} ${errors.name ? "input-error" : ""}`}
              type="text" name="name" placeholder=" "
              value={formData.name} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.fullName")}</label>
          </div>
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="float-field">
          <div className="input-with-icon">
            <MdEmail className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.email ? "has-value" : ""} ${errors.email ? "input-error" : ""}`}
              type="email" name="email" placeholder=" "
              value={formData.email} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.email")}</label>
          </div>
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="float-field">
          <div className={`phone-input-box ${formData.contact ? "has-value" : ""}`}>
            <FaPhoneAlt size={13} style={{ marginLeft: "14px", color: "#667eea", flexShrink: 0 }} />
            <select
              className="phone-code-select" name="countryCode"
              value={formData.countryCode} onChange={handleCountryChange} disabled={!isEditMode}
            >
              {countries.map(({ code, name, alpha2 }) => (
                <option key={alpha2} value={code}>{code} {name}</option>
              ))}
            </select>
            <div className="phone-divider" />
            <input
              className="phone-number-input" type="tel" name="contact"
              placeholder={t("profile.contactNumber")}
              value={formData.contact} disabled={!isEditMode}
              onChange={(e) => {
                if (!isEditMode) return;
                const val = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, contact: val });
                setErrors({ ...errors, contact: "" });
              }}
            />
          </div>
          {errors.countryCode && <p className="field-error">{errors.countryCode}</p>}
          {errors.contact     && <p className="field-error">{errors.contact}</p>}
        </div>

        <div className="float-field">
          <div className="input-with-icon">
            <HiMiniBuildingOffice className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.company ? "has-value" : ""} ${errors.company ? "input-error" : ""}`}
              type="text" name="company" placeholder=" "
              value={formData.company} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.company")}</label>
          </div>
          {errors.company && <p className="field-error">{errors.company}</p>}
        </div>

        <div className="float-field">
          <div className="input-with-icon">
            <FaAddressBook className="input-icon" size={16} />
            <input
              className={`float-input has-icon ${formData.address ? "has-value" : ""} ${errors.address ? "input-error" : ""}`}
              type="text" name="address" placeholder=" "
              value={formData.address} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.address")}</label>
          </div>
          {errors.address && <p className="field-error">{errors.address}</p>}
        </div>

        <div className="float-field">
          <div className="input-with-icon">
            <FaAddressCard className="input-icon" size={16} />
            <input
              className={`float-input has-icon ${formData.pan ? "has-value" : ""}`}
              type="text" name="pan" placeholder=" "
              value={formData.pan} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.pan")}</label>
          </div>
        </div>

        <div className="float-field">
          <div className="input-with-icon">
            <MdReceiptLong className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.gst ? "has-value" : ""}`}
              type="text" name="gst" placeholder=" "
              value={formData.gst} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.gst")}</label>
          </div>
        </div>

        <div className="float-field">
          <div className="input-with-icon textarea-icon-wrapper">
            <MdOutlineGavel className="input-icon textarea-icon" size={17} />
            <textarea
              className={`float-textarea has-icon ${formData.terms ? "has-value" : ""}`}
              name="terms" placeholder=" "
              value={formData.terms} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.terms")}</label>
          </div>
        </div>

        <div className="float-field">
          <label className="float-label-static" style={{ color: "#667eea" }}>
            <MdCurrencyRupee size={16} style={{ verticalAlign: "middle", marginRight: "6px", color: "#667eea" }} />
            {t("profile.currency")}
          </label>
          {loading ? (
            <p className="currency-loading">{t("profile.loadingCurrencies")}</p>
          ) : error ? (
            <p className="currency-error">{error}</p>
          ) : (
            <select
              className="form-select" name="currency"
              value={formData.currency} onChange={handleChange} disabled={!isEditMode}
            >
              <option value="">{t("profile.selectCurrency")}</option>
              {currencies.map(({ code, name }) => (
                <option key={code} value={code}>{code} — {name}</option>
              ))}
            </select>
          )}
          {errors.currency && <p className="field-error">{errors.currency}</p>}
        </div>

        <div className="float-field">
          <div className="input-with-icon">
            <MdOutlineLanguage className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.website ? "has-value" : ""}`}
              type="url" name="website" placeholder=" "
              value={formData.website} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.website")}</label>
          </div>
        </div>

        <div className="form-section-title">
          <MdAccountBalance size={18} style={{ color: "#667eea" }} />
          {t("profile.bankDetails")}
        </div>

        <div className="float-field">
          <div className="input-with-icon">
            <MdOutlineCreditCard className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.accountNumber ? "has-value" : ""}`}
              type="text" name="accountNumber" placeholder=" "
              value={formData.accountNumber} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.accountNumber")}</label>
          </div>
        </div>

        <div className="float-field">
          <div className="input-with-icon">
            <BsBank2 className="input-icon" size={16} />
            <input
              className={`float-input has-icon ${formData.bankName ? "has-value" : ""}`}
              type="text" name="bankName" placeholder=" "
              value={formData.bankName} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.bankName")}</label>
          </div>
        </div>

        <div className="float-field">
          <div className="input-with-icon">
            <MdOutlineNumbers className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.ifscCode ? "has-value" : ""}`}
              type="text" name="ifscCode" placeholder=" "
              value={formData.ifscCode} onChange={handleChange} disabled={!isEditMode}
            />
            <label className="float-label icon-label">{t("profile.ifscCode")}</label>
          </div>
        </div>

        <div className="form-section-title">
          <MdOutlineQrCode2 size={18} style={{ color: "#677eea" }} />
          {t("profile.upiQr")}
        </div>

        <div className="float-field">
          <label className="float-label-static">{t("profile.uploadQr")}</label>
          {isEditMode && (
            <input
              type="file" accept="image/*" id="upi-input"
              className="profile-avatar-edit-input"
              onChange={handleUpiQR}
            />
          )}
          <label
            htmlFor={isEditMode ? "upi-input" : undefined}
            className="upi-qr-wrapper"
            style={{ cursor: isEditMode ? "pointer" : "default" }}
          >
            {upiQR ? (
              <img src={upiQR} alt="UPI QR" className="upi-qr-img" />
            ) : (
              <div className="upi-qr-placeholder">
                <MdOutlineQrCode2 size={40} color="#aaa" />
                <p>{isEditMode ? t("profile.tapToUpload") : t("profile.noQr") || "No QR uploaded"}</p>
                {isEditMode && <span className="upi-qr-hint">{t("profile.clickHere")}</span>}
              </div>
            )}
            {upiQR && isEditMode && (
              <span className="upi-qr-change">{t("profile.changeQr")}</span>
            )}
          </label>
        </div>

        {errors.general && (
          <p className="field-error" style={{ textAlign: "center" }}>{errors.general}</p>
        )}

        {success && (
          <div className="success-message">
            {hasProfile
              ? t("profile.updateSuccess") || "Profile updated successfully! ✅"
              : t("profile.success")}
          </div>
        )}

        {isEditMode && (
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {hasProfile && (
              <button
                type="button" onClick={handleCancelEdit}
                style={{
                  flex: 1, padding: "14px", borderRadius: "10px",
                  border: "1.5px solid #667eea", background: "transparent",
                  color: "#667eea", fontWeight: 600, fontSize: "15px", cursor: "pointer",
                }}
              >
                {t("profile.cancel")}
              </button>
            )}
            <button type="submit" className="profile-submit-btn" style={{ flex: 2 }}>
              {hasProfile
                ? t("profile.updateProfile")
                : t("profile.saveProfile")}
            </button>
          </div>
        )}

      </form>
    </div>
  );
};

export default Profile;