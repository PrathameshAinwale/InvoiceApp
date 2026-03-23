import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import "./CreateInvoice.css";
import { MdPercent } from "react-icons/md";
import { useTranslation } from "react-i18next";
import API from "../../api/api";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹",
  JPY: "¥", AUD: "A$", CAD: "C$", SGD: "S$",
};

const emptyProduct = {
  productName: "", quantity: "", unit: "pcs",
  price: "", discount: "", gst: "18",
};

const resolveGst = (val) => {
  if (val === null || val === undefined || val === "") return 18;
  const parsed = parseFloat(val);
  if (isNaN(parsed)) return 18;
  return parsed; // returns 0 only if user explicitly chose 0%
};

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const { t }    = useTranslation();

  const [formData, setFormData] = useState({
    customerName: "", invoiceDate: "",
    currency: "INR", notes: "",
  });
  const [products, setProducts]     = useState([{ ...emptyProduct }]);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    fetch("https://api.frankfurter.dev/v1/currencies")
      .then((res) => res.json())
      .then((data) => {
        const list = Object.entries(data).map(([code, name]) => ({ code, name }));
        setCurrencies(list);
      })
      .catch(() => console.error("Failed to load currencies"));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetchInvoice = async () => {
      try {
        const res = await API.get(`/invoices/${id}`);
        const inv = res.data.invoice;
        setFormData({
          customerName: inv.customer_name            || "",
          invoiceDate:  inv.invoice_date?.split("T")[0] || "",
          currency:     inv.currency                 || "INR",
          notes:        inv.additional_notes         || "",
        });
        setProducts(inv.items.map((item) => ({
          productName: item.product_name || "",
          quantity:    item.quantity     || "",
          unit:        item.unit         || "pcs",
          price:       item.price        || "",
          discount:    item.discount     || "",
          gst:         item.gst != null ? String(item.gst) : "18",
        })));
      } catch (err) {
        console.error("Failed to fetch invoice:", err.message);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleProductChange = (index, e) => {
    const updated = [...products];
    updated[index][e.target.name] = e.target.value;
    setProducts(updated);
  };

  const addProduct    = () => setProducts([...products, { ...emptyProduct }]);
  const removeProduct = (index) => {
    if (products.length === 1) return;
    setProducts(products.filter((_, i) => i !== index));
  };

  const calcProductTotal = (p) => {
    const qty           = parseFloat(p.quantity) || 0;
    const price         = parseFloat(p.price)    || 0;
    const discount      = parseFloat(p.discount) || 0;
    const gst           = resolveGst(p.gst);
    const base          = qty * price;
    const afterDiscount = base - (base * discount) / 100;
    return afterDiscount + (afterDiscount * gst) / 100;
  };

  const subtotal = products.reduce(
    (sum, p) => sum + (parseFloat(p.quantity) || 0) * (parseFloat(p.price) || 0), 0
  );

  const totalDiscount = products.reduce((sum, p) => {
    const base = (parseFloat(p.quantity) || 0) * (parseFloat(p.price) || 0);
    return sum + (base * (parseFloat(p.discount) || 0)) / 100;
  }, 0);

  const totalGST = products.reduce((sum, p) => {
    const base          = (parseFloat(p.quantity) || 0) * (parseFloat(p.price) || 0);
    const afterDiscount = base - (base * (parseFloat(p.discount) || 0)) / 100;
    return sum + (afterDiscount * resolveGst(p.gst)) / 100;
  }, 0);

  const grandTotal = products.reduce((sum, p) => sum + calcProductTotal(p), 0);
  const symbol     = CURRENCY_SYMBOLS[formData.currency] || formData.currency + " ";

  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) errs.customerName = t("createInvoice.customerNameError");
    if (!formData.invoiceDate)         errs.invoiceDate  = t("createInvoice.invoiceDateError");
    if (!formData.currency)            errs.currency     = t("createInvoice.currencyError");
    products.forEach((p, i) => {
      if (!p.productName.trim())          errs[`productName_${i}`] = t("createInvoice.productNameError");
      if (!p.quantity || p.quantity <= 0) errs[`quantity_${i}`]    = t("createInvoice.quantityError");
      if (!p.price || p.price <= 0)       errs[`price_${i}`]       = t("createInvoice.priceError");
      const gstVal = parseFloat(p.gst);
      if (p.gst !== "" && !isNaN(gstVal) && (gstVal < 0 || gstVal > 100)) {
        errs[`gst_${i}`] = t("createInvoice.gstRangeError");
      }
    });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      customer_name:    formData.customerName,
      invoice_date:     formData.invoiceDate,
      currency:         formData.currency,
      additional_notes: formData.notes || null,
      subtotal:         parseFloat(subtotal.toFixed(2)),
      total_discount:   parseFloat(totalDiscount.toFixed(2)),
      gst:              resolveGst(products[0]?.gst), // ✅ invoice-level gst not used — stored as % per item
      grand_total:      parseFloat(grandTotal.toFixed(2)), // ✅ final calculated total
      items: products.map((p) => ({
        product_name: p.productName,
        quantity:     parseFloat(p.quantity),
        unit:         p.unit,
        price:        parseFloat(p.price),
        discount:     parseFloat(p.discount) || 0,
        gst:          resolveGst(p.gst),   // ✅ stores % e.g. 18
        total:        parseFloat(calcProductTotal(p).toFixed(2)),
      })),
    };

    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/invoices/${id}`, payload);
      } else {
        await API.post('/invoices', payload);
      }
      setLoading(false);
      navigate('/invoice');
    } catch (err) {
      setLoading(false);
      setErrors({ general: err.response?.data?.message || 'Something went wrong. Please try again.' });
    }
  };

  return (
    <>
      <div className="ci-page">
        <div className="ci-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>
          <h2 className="ci-title">
            {isEdit ? t("createInvoice.editTitle") : t("createInvoice.title")}
          </h2>
        </div>

        <form className="ci-form" onSubmit={handleSubmit}>

          {/* ── Invoice Details ── */}
          <div className="ci-section">
            <p className="ci-section-title">{t("createInvoice.invoiceDetails")}</p>

            <div className="form-field">
              <label className="form-label">{t("createInvoice.customerName")}</label>
              <input
                className={`form-input ${errors.customerName ? "input-error" : ""}`}
                type="text" name="customerName"
                placeholder={t("createInvoice.customerNamePlaceholder")}
                value={formData.customerName} onChange={handleFormChange}
              />
              {errors.customerName && <p className="field-error">{errors.customerName}</p>}
            </div>

            <div className="ci-row">
              <div className="form-field">
                <label className="form-label">{t("createInvoice.invoiceDate")}</label>
                <input
                  className={`form-input ${errors.invoiceDate ? "input-error" : ""}`}
                  type="date" name="invoiceDate"
                  value={formData.invoiceDate} onChange={handleFormChange}
                />
                {errors.invoiceDate && <p className="field-error">{errors.invoiceDate}</p>}
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">{t("createInvoice.currency")}</label>
              <select
                className="form-select" name="currency"
                value={formData.currency} onChange={handleFormChange}
              >
                {currencies.map(({ code, name }) => (
                  <option key={code} value={code}>{code} — {name}</option>
                ))}
              </select>
              {errors.currency && <p className="field-error">{errors.currency}</p>}
            </div>
          </div>

          {/* ── Products ── */}
          <div className="ci-section">
            <p className="ci-section-title">{t("createInvoice.productsSection")}</p>

            {products.map((product, index) => (
              <div key={index} className="product-card">
                <div className="product-card-header">
                  <p className="product-number">{t("createInvoice.item")} {index + 1}</p>
                  {products.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeProduct(index)}>
                      <FiTrash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label product-label">{t("createInvoice.productName")}</label>
                  <input
                    className={`form-input ${errors[`productName_${index}`] ? "input-error" : ""}`}
                    type="text" name="productName"
                    placeholder={t("createInvoice.productNamePlaceholder")}
                    value={product.productName}
                    onChange={(e) => handleProductChange(index, e)}
                  />
                  {errors[`productName_${index}`] && <p className="field-error">{errors[`productName_${index}`]}</p>}
                </div>

                <div className="ci-row">
                  <div className="form-field">
                    <label className="form-label">{t("createInvoice.quantity")}</label>
                    <input
                      className={`form-input ${errors[`quantity_${index}`] ? "input-error" : ""}`}
                      type="number" name="quantity" placeholder="0" min="0"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, e)}
                    />
                    {errors[`quantity_${index}`] && <p className="field-error">{errors[`quantity_${index}`]}</p>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">{t("createInvoice.unit")}</label>
                    <select className="form-select" name="unit" value={product.unit}
                      onChange={(e) => handleProductChange(index, e)}>
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="ltr">ltr</option>
                      <option value="hr">hr</option>
                      <option value="day">day</option>
                      <option value="month">month</option>
                      <option value="box">box</option>
                      <option value="set">set</option>
                    </select>
                  </div>
                </div>

                <div className="ci-row">
                  <div className="form-field">
                    <label className="form-label">{t("createInvoice.price")} ({symbol})</label>
                    <input
                      className={`form-input ${errors[`price_${index}`] ? "input-error" : ""}`}
                      type="number" name="price" placeholder="0.00" min="0"
                      value={product.price}
                      onChange={(e) => handleProductChange(index, e)}
                    />
                    {errors[`price_${index}`] && <p className="field-error">{errors[`price_${index}`]}</p>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">{t("createInvoice.discount")}</label>
                    <input
                      className="form-input" type="number" name="discount"
                      placeholder="0" min="0" max="100"
                      value={product.discount}
                      onChange={(e) => handleProductChange(index, e)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">GST (%)</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <div className="input-with-icon" style={{ flex: 1 }}>
                      <MdPercent className="input-icon" size={17} />
                      <select
                        className={`float-input has-icon has-value ${errors[`gst_${index}`] ? "input-error" : ""}`}
                        name="gst"
                        value={["0", "5", "12", "18", "28"].includes(String(product.gst)) ? String(product.gst) : "custom"}
                        onChange={(e) => {
                          const updated = [...products];
                          updated[index].gst = e.target.value === "custom" ? "" : e.target.value;
                          setProducts(updated);
                        }}
                        style={{ paddingTop: "20px", paddingBottom: "6px", cursor: "pointer" }}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18% (default)</option>
                        <option value="28">28%</option>
                        <option value="custom">{t("createInvoice.custom")}</option>
                      </select>
                      <label className="float-label icon-label"
                        style={{ top: "6px", fontSize: "11px", color: "#667eea", fontWeight: 600 }}>
                        {t("createInvoice.gstRate")}
                      </label>
                    </div>

                    {!["0", "5", "12", "18", "28"].includes(String(product.gst)) && (
                      <div className="input-with-icon" style={{ flex: 1 }}>
                        <MdPercent className="input-icon" size={17} />
                        <input
                          className={`float-input has-icon ${product.gst ? "has-value" : ""} ${errors[`gst_${index}`] ? "input-error" : ""}`}
                          type="number" name="gst" placeholder="18" min="0" max="100"
                          value={product.gst}
                          onChange={(e) => handleProductChange(index, e)} autoFocus
                        />
                        <label className="float-label icon-label">{t("createInvoice.customGst")}</label>
                      </div>
                    )}
                  </div>
                  {errors[`gst_${index}`] && <p className="field-error">{errors[`gst_${index}`]}</p>}
                </div>

                <div className="product-total">
                  <span>{t("createInvoice.itemTotal")}</span>
                  <span className="product-total-amount">
                    {symbol}{calcProductTotal(product).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            <button type="button" className="add-item-btn" onClick={addProduct}>
              <FiPlus size={16} /> {t("createInvoice.addItem")}
            </button>
          </div>

          {/* ── Notes ── */}
          <div className="ci-section">
            <p className="ci-section-title">{t("createInvoice.notes")}</p>
            <div className="form-field">
              <textarea
                className="form-textarea" name="notes"
                placeholder={t("createInvoice.notesPlaceholder")}
                value={formData.notes} onChange={handleFormChange}
              />
            </div>
          </div>

          {/* ── Summary ── */}
          <div className="ci-summary">
            <p className="ci-section-title">{t("createInvoice.summary")}</p>
            <div className="summary-row">
              <span>{t("createInvoice.subtotal")}</span>
              <span>{symbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row discount">
              <span>{t("createInvoice.totalDiscount")}</span>
              <span>- {symbol}{totalDiscount.toFixed(2)}</span>
            </div>
            <div className="summary-row gst">
              <span>{t("createInvoice.totalGst")}</span>
              <span>+ {symbol}{totalGST.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row grand-total">
              <span>{t("createInvoice.grandTotal")}</span>
              <span>{symbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {errors.general && (
            <p className="field-error" style={{ textAlign: "center" }}>{errors.general}</p>
          )}

          <button type="submit" className="ci-submit-btn" disabled={loading}>
            {loading
              ? (isEdit ? "Updating..." : "Saving...")
              : (isEdit ? t("createInvoice.update") || "Update Invoice" : t("createInvoice.submit"))}
          </button>

        </form>
      </div>
    </>
  );
};

export default CreateInvoice;