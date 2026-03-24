import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { MdOutlineInventory2, MdOutlineNumbers } from "react-icons/md";
import { BsTag } from "react-icons/bs";
import { MdCurrencyRupee } from "react-icons/md";
import { useTranslation } from "react-i18next";
import "./ProductForm.css";
import TopNav from "../../../components/common/TopNav";

const units    = ["pcs", "kg", "gm", "ltr", "ml", "hr", "box", "set"];
const statuses = ["in_stock", "out_of_stock"];

const emptyForm = {
  name:        "",
  price:       "",
  quantity:    "",
  unit:        "pcs",
  status:      "in_stock",
  description: "",
};

const BASE_URL = "http://localhost:5000/api"; // change to your backend URL

const ProductForm = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEdit    = Boolean(id);
  const { t }     = useTranslation();

  const [formData, setFormData] = useState(emptyForm);
  const [errors,   setErrors]   = useState({});
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Fetch existing product when editing ──────────────────────────
  useEffect(() => {
    if (isEdit) {
      fetch(`${BASE_URL}/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const p = data.data;
            setFormData({
              name:        p.name,
              price:       p.price,
              quantity:    p.quantity,
              unit:        p.unit        || "pcs",
              status:      p.status      || "in_stock",
              description: p.description || "",
            });
          } else {
            setApiError("Product not found.");
          }
        })
        .catch(() => setApiError("Failed to load product."));
    }
  }, [id, isEdit]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({  ...errors,   [e.target.name]: "" });
  };

  // ── Validation ───────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.name.trim())                        errs.name     = t("productForm.nameError");
    if (!formData.price && formData.price !== 0)      errs.price    = t("productForm.priceError");
    else if (Number(formData.price) < 0)              errs.price    = t("productForm.priceNegativeError");
    if (!formData.quantity && formData.quantity !== 0) errs.quantity = t("productForm.stockError");
    else if (Number(formData.quantity) < 0)           errs.quantity = t("productForm.stockNegativeError");
    if (!formData.unit)                               errs.unit     = t("productForm.unitError");
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      name:        formData.name.trim(),
      price:       Number(formData.price),
      quantity:    Number(formData.quantity),
      unit:        formData.unit,
      status:      formData.status,
      description: formData.description.trim() || null,
    };

    setLoading(true);
    try {
      const url    = isEdit ? `${BASE_URL}/products/${id}` : `${BASE_URL}/products`;
      const method = isEdit ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/products"), 1000);
      } else {
        setApiError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      <TopNav />
      <div className="product-form-page page">

        {/* Header */}
        <div className="product-form-header">
          <button className="back-btn" onClick={() => navigate("/products")}>
            <FiArrowLeft size={20} />
          </button>
          <h2 className="product-form-title">
            {isEdit ? t("productForm.editTitle") : t("productForm.addTitle")}
          </h2>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>

          {/* Product Name */}
          <div className="float-field">
            <div className="input-with-icon">
              <MdOutlineInventory2 className="input-icon" size={17} />
              <input
                className={`float-input has-icon ${formData.name ? "has-value" : ""} ${errors.name ? "input-error" : ""}`}
                type="text" name="name" placeholder=" "
                value={formData.name} onChange={handleChange}
              />
              <label className="float-label icon-label">{t("productForm.productName")}</label>
            </div>
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          {/* Price + Unit */}
          <div className="form-row">
            <div className="float-field">
              <div className="input-with-icon">
                <MdCurrencyRupee className="input-icon" size={17} />
                <input
                  className={`float-input has-icon ${formData.price ? "has-value" : ""} ${errors.price ? "input-error" : ""}`}
                  type="number" name="price" placeholder=" " min="0"
                  value={formData.price} onChange={handleChange}
                />
                <label className="float-label icon-label">{t("productForm.price")}</label>
              </div>
              {errors.price && <p className="field-error">{errors.price}</p>}
            </div>

            <div className="float-field">
              <select
                className="form-select unit-select"
                name="unit" value={formData.unit} onChange={handleChange}
              >
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <label className="unit-float-label">{t("productForm.unit")}</label>
            </div>
          </div>

          {/* Quantity */}
          <div className="float-field">
            <div className="input-with-icon">
              <MdOutlineNumbers className="input-icon" size={17} />
              <input
                className={`float-input has-icon ${formData.quantity ? "has-value" : ""} ${errors.quantity ? "input-error" : ""}`}
                type="number" name="quantity" placeholder=" " min="0"
                value={formData.quantity} onChange={handleChange}
              />
              <label className="float-label icon-label">{t("productForm.stock")}</label>
            </div>
            {errors.quantity && <p className="field-error">{errors.quantity}</p>}
          </div>

          {/* Status */}
          <div className="float-field">
            <label className="float-label-static">{t("productForm.status")}</label>
            <div className="status-options">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`status-option-btn ${formData.status === s ? `active ${s}` : ""}`}
                  onClick={() => setFormData({ ...formData, status: s })}
                >
                  {s === "in_stock" ? t("productForm.statuses.in_stock") : t("productForm.statuses.out_of_stock")}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="float-field">
            <div className="input-with-icon textarea-icon-wrapper">
              <BsTag className="input-icon textarea-icon" size={16} />
              <textarea
                className={`float-textarea has-icon ${formData.description ? "has-value" : ""}`}
                name="description" placeholder=" "
                value={formData.description} onChange={handleChange}
              />
              <label className="float-label icon-label">{t("productForm.description")}</label>
            </div>
          </div>

          {/* API Error */}
          {apiError && <div className="error-message">{apiError}</div>}

          {/* Success */}
          {success && (
            <div className="success-message">
              {isEdit ? t("productForm.successEdit") : t("productForm.successAdd")}
            </div>
          )}

          <button type="submit" className="product-submit-btn" disabled={loading}>
            {loading
              ? t("productForm.submitting")
              : isEdit
              ? t("productForm.submitEdit")
              : t("productForm.submitAdd")}
          </button>

        </form>
      </div>
    </>
  );
};

export default ProductForm;
