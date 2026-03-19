import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import { BsTag } from "react-icons/bs";
import { MdOutlineNumbers } from "react-icons/md";
import { MdOutlineCategory } from "react-icons/md";
import { MdCurrencyRupee } from "react-icons/md";
import { MdOutlinePercent } from "react-icons/md";
import products from "../../../data/products.json";
import "./ProductForm.css";
import TopNav from "../../../components/common/TopNav";

const units = ["pcs", "kg", "gm", "ltr", "ml", "hr", "box", "set"];
const categories = ["Design", "Development", "Marketing", "Content"];
const gstRates = ["0", "5", "12", "18", "28"];
const statuses = ["active", "inactive"];

const emptyForm = {
  name: "",
  category: "",
  price: "",
  unit: "pcs",
  gst: "18",
  stock: "",
  status: "active",
  description: "",
};

const validate = () => {
  const errs = {};
  // ... existing validations ...

  if (!formData.gst && formData.gst !== '0') {
    errs.gst = 'GST rate is required';
  } else if (formData.gst < 0 || formData.gst > 100) {
    errs.gst = 'GST must be between 0 and 100';
  }

  return errs;
};

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ← if id exists = edit mode
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // if edit mode, prefill form with existing product data
  useEffect(() => {
    if (isEdit) {
      const existing = products.find((p) => p.id === id);
      if (existing) {
        setFormData({
          name: existing.name,
          category: existing.category,
          price: existing.price,
          unit: existing.unit,
          gst: String(existing.gst),
          stock: existing.stock,
          status: existing.status,
          description: existing.description || "",
        });
      }
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Product name is required";
    if (!formData.category) errs.category = "Category is required";
    if (!formData.price) errs.price = "Price is required";
    if (formData.price < 0) errs.price = "Price cannot be negative";
    if (!formData.unit) errs.unit = "Unit is required";
    if (!formData.stock && formData.stock !== 0)
      errs.stock = "Stock is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log(isEdit ? "Updating product:" : "Adding product:", formData);
    setSuccess(true);
    setTimeout(() => navigate("/products"), 2000);
  };

  return (
    <>
    <TopNav/>
    <div className="product-form-page page">
      {/* Header */}
      <div className="product-form-header">
        <button className="back-btn" onClick={() => navigate("/products")}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="product-form-title">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        {/* Product Name */}
        <div className="float-field">
          <div className="input-with-icon">
            <MdOutlineInventory2 className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.name ? "has-value" : ""} ${errors.name ? "input-error" : ""}`}
              type="text"
              name="name"
              placeholder=" "
              value={formData.name}
              onChange={handleChange}
              />
            <label className="float-label icon-label">Product Name</label>
          </div>
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        {/* Category */}
        <div className="float-field">
          <label className="float-label-static">
            <MdOutlineCategory
              size={15}
              style={{
                  verticalAlign: "middle",
                  marginRight: 6,
                  color: "#667eea",
                }}
                />
            Category
          </label>
          <select
            className={`form-select ${errors.category ? "input-error" : ""}`}
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
                <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        {/* Price + Unit — side by side */}
        <div className="form-row">
          <div className="float-field">
            <div className="input-with-icon">
              <MdCurrencyRupee className="input-icon" size={17} />
              <input
                className={`float-input has-icon ${formData.price ? "has-value" : ""} ${errors.price ? "input-error" : ""}`}
                type="number"
                name="price"
                placeholder=" "
                min="0"
                value={formData.price}
                onChange={handleChange}
                />
              <label className="float-label icon-label">Price</label>
            </div>
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>

          <div className="float-field">
            <select
              className="form-select unit-select"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <label className="unit-float-label">Unit</label>
          </div>
        </div>
        {/* GST */}
        <div className="float-field">
          <div className="input-with-icon">
            <MdOutlinePercent className="input-icon" size={17} />
            <select
              className={`float-input has-icon has-value`}
              name="gst"
              value={
                  ["0", "5", "12", "18", "28"].includes(formData.gst)
                  ? formData.gst
                  : "custom"
                }
                onChange={(e) => {
                    if (e.target.value === "custom") {
                        setFormData({ ...formData, gst: "" });
                    } else {
                        setFormData({ ...formData, gst: e.target.value });
                    }
                }}
                style={{
                    paddingTop: "20px",
                    paddingBottom: "6px",
                    cursor: "pointer",
                }}
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
              <option value="custom">Custom %</option>
            </select>
            <label
              className="float-label icon-label"
              style={{
                  top: "6px",
                  fontSize: "11px",
                  color: "#667eea",
                fontWeight: 600,
            }}
            >
              GST Rate
            </label>
          </div>

          {/* Custom GST input — shows only when custom is selected */}
          {!["0", "5", "12", "18", "28"].includes(formData.gst) && (
              <div className="input-with-icon" style={{ marginTop: "8px" }}>
              <MdOutlinePercent className="input-icon" size={17} />
              <input
                className={`float-input has-icon ${formData.gst ? "has-value" : ""} ${errors.gst ? "input-error" : ""}`}
                type="number"
                name="gst"
                placeholder=" "
                min="0"
                max="100"
                value={formData.gst}
                onChange={(e) => {
                    setFormData({ ...formData, gst: e.target.value });
                    setErrors({ ...errors, gst: "" });
                }}
                />
              <label className="float-label icon-label">
                Enter Custom GST %
              </label>
            </div>
          )}
          {errors.gst && <p className="field-error">{errors.gst}</p>}
        </div>
        {/* Stock */}
        <div className="float-field">
          <div className="input-with-icon">
            <MdOutlineNumbers className="input-icon" size={17} />
            <input
              className={`float-input has-icon ${formData.stock ? "has-value" : ""} ${errors.stock ? "input-error" : ""}`}
              type="number"
              name="stock"
              placeholder=" "
              min="0"
              value={formData.stock}
              onChange={handleChange}
              />
            <label className="float-label icon-label">Stock Quantity</label>
          </div>
          {errors.stock && <p className="field-error">{errors.stock}</p>}
        </div>

        {/* Status */}
        <div className="float-field">
          <label className="float-label-static">Status</label>
          <div className="status-options">
            {statuses.map((s) => (
                <button
                key={s}
                type="button"
                className={`status-option-btn ${formData.status === s ? `active ${s}` : ""}`}
                onClick={() => setFormData({ ...formData, status: s })}
                >
                {s.charAt(0).toUpperCase() + s.slice(1)}
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
              name="description"
              placeholder=" "
              value={formData.description}
              onChange={handleChange}
              />
            <label className="float-label icon-label">
              Description (optional)
            </label>
          </div>
        </div>

        {success && (
          <div className="success-message">
            Product {isEdit ? "updated" : "added"} successfully!
          </div>
        )}

        <button type="submit" className="product-submit-btn">
          {isEdit ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  </>
  );
};

export default ProductForm;
