import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import './CreateInvoice.css';

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹',
  JPY: '¥', AUD: 'A$', CAD: 'C$', SGD: 'S$',
};

const emptyProduct = {
  productName: '',
  quantity: '',
  unit: 'pcs',
  price: '',
  discount: '',
  gst: '18',
};

const CreateInvoice = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    invoiceDate: '',
    dueDate: '',
    currency: 'INR',
    notes: '',
  });

  const [products, setProducts] = useState([{ ...emptyProduct }]);
  const [errors, setErrors]     = useState({});
  const [currencies, setCurrencies] = useState([]);

  // fetch currencies
  useEffect(() => {
    fetch('https://api.frankfurter.dev/v1/currencies')
      .then(res => res.json())
      .then(data => {
        const list = Object.entries(data).map(([code, name]) => ({ code, name }));
        setCurrencies(list);
      })
      .catch(() => console.error('Failed to load currencies'));
  }, []);

  // ── handlers ──────────────────────────────────────────
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleProductChange = (index, e) => {
    const updated = [...products];
    updated[index][e.target.name] = e.target.value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { ...emptyProduct }]);
  };

  const removeProduct = (index) => {
    if (products.length === 1) return; // keep at least one
    setProducts(products.filter((_, i) => i !== index));
  };

  // ── calculations ──────────────────────────────────────
  const calcProductTotal = (p) => {
    const qty      = parseFloat(p.quantity)  || 0;
    const price    = parseFloat(p.price)     || 0;
    const discount = parseFloat(p.discount)  || 0;
    const gst      = parseFloat(p.gst)       || 0;
    const base     = qty * price;
    const afterDiscount = base - (base * discount / 100);
    const withGST  = afterDiscount + (afterDiscount * gst / 100);
    return withGST;
  };

  const subtotal     = products.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0) * (parseFloat(p.price) || 0), 0);
  const totalDiscount = products.reduce((sum, p) => {
    const base = (parseFloat(p.quantity) || 0) * (parseFloat(p.price) || 0);
    return sum + (base * (parseFloat(p.discount) || 0) / 100);
  }, 0);
  const totalGST     = products.reduce((sum, p) => {
    const base = (parseFloat(p.quantity) || 0) * (parseFloat(p.price) || 0);
    const afterDiscount = base - (base * (parseFloat(p.discount) || 0) / 100);
    return sum + (afterDiscount * (parseFloat(p.gst) || 0) / 100);
  }, 0);
  const grandTotal   = products.reduce((sum, p) => sum + calcProductTotal(p), 0);

  const symbol = CURRENCY_SYMBOLS[formData.currency] || formData.currency + ' ';

  // ── validation ────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) errs.customerName = 'Customer name is required';
    if (!formData.invoiceDate)         errs.invoiceDate  = 'Invoice date is required';
    if (!formData.dueDate)             errs.dueDate      = 'Due date is required';
    if (!formData.currency)            errs.currency     = 'Currency is required';
    products.forEach((p, i) => {
      if (!p.productName.trim()) errs[`productName_${i}`] = 'Product name is required';
      if (!p.quantity)           errs[`quantity_${i}`]    = 'Quantity is required';
      if (!p.price)              errs[`price_${i}`]       = 'Price is required';
    });
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log({ ...formData, products, grandTotal });
    navigate('/invoice');
  };

  return (
    <>
    <div className="ci-page ">

      {/* Header */}
      <div className="ci-header">
        <button className="back-btn" onClick={() => navigate('/invoice')}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="ci-title">Create Invoice</h2>
      </div>

      <form className="ci-form" onSubmit={handleSubmit}>

        {/* ── Invoice Details ── */}
        <div className="ci-section">
          <p className="ci-section-title">Invoice Details</p>

          <div className="form-field">
            <label className="form-label">Customer Name</label>
            <input
              className={`form-input ${errors.customerName ? 'input-error' : ''}`}
              type="text"
              name="customerName"
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={handleFormChange}
              />
            {errors.customerName && <p className="field-error">{errors.customerName}</p>}
          </div>

          <div className="ci-row">
            <div className="form-field">
              <label className="form-label">Invoice Date</label>
              <input
                className={`form-input ${errors.invoiceDate ? 'input-error' : ''}`}
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleFormChange}
                />
              {errors.invoiceDate && <p className="field-error">{errors.invoiceDate}</p>}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Currency</label>
            <select
              className="form-select"
              name="currency"
              value={formData.currency}
              onChange={handleFormChange}
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
          <p className="ci-section-title">Products / Services</p>

          {products.map((product, index) => (
            <div key={index} className="product-card">

              {/* Product Header */}
              <div className="product-card-header">
                <p className="product-number">Item {index + 1}</p>
                {products.length > 1 && (
                  <button
                  type="button"
                    className="remove-btn"
                    onClick={() => removeProduct(index)}
                    >
                    <FiTrash2 size={15} />
                  </button>
                )}
              </div>

              {/* Product Name */}
              <div className="form-field">
                <label className="form-label">Product Name</label>
                <input
                  className={`form-input ${errors[`productName_${index}`] ? 'input-error' : ''}`}
                  type="text"
                  name="productName"
                  placeholder="Enter product name"
                  value={product.productName}
                  onChange={(e) => handleProductChange(index, e)}
                  />
                {errors[`productName_${index}`] && (
                  <p className="field-error">{errors[`productName_${index}`]}</p>
                )}
              </div>

              {/* Quantity + Unit */}
              <div className="ci-row">
                <div className="form-field">
                  <label className="form-label">Quantity</label>
                  <input
                    className={`form-input ${errors[`quantity_${index}`] ? 'input-error' : ''}`}
                    type="number"
                    name="quantity"
                    placeholder="0"
                    min="0"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, e)}
                    />
                  {errors[`quantity_${index}`] && (
                    <p className="field-error">{errors[`quantity_${index}`]}</p>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Unit</label>
                  <select
                    className="form-select"
                    name="unit"
                    value={product.unit}
                    onChange={(e) => handleProductChange(index, e)}
                    >
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

              {/* Price + Discount */}
              <div className="ci-row">
                <div className="form-field">
                  <label className="form-label">Price ({symbol})</label>
                  <input
                    className={`form-input ${errors[`price_${index}`] ? 'input-error' : ''}`}
                    type="number"
                    name="price"
                    placeholder="0.00"
                    min="0"
                    value={product.price}
                    onChange={(e) => handleProductChange(index, e)}
                    />
                  {errors[`price_${index}`] && (
                    <p className="field-error">{errors[`price_${index}`]}</p>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Discount (%)</label>
                  <input
                    className="form-input"
                    type="number"
                    name="discount"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={product.discount}
                    onChange={(e) => handleProductChange(index, e)}
                    />
                </div>
              </div>

              {/* GST */}
              <div className="form-field">
                <label className="form-label">GST (%)</label>
                <div className="gst-row">
                  {['0', '5', '12', '18', '28'].map((rate) => (
                    <button
                    key={rate}
                    type="button"
                    className={`gst-btn ${product.gst === rate ? 'active' : ''}`}
                    onClick={() => handleProductChange(index, {
                      target: { name: 'gst', value: rate }
                    })}
                    >
                      {rate}%
                    </button>
                  ))}
                  {/* custom GST input */}
                  <input
                    className="form-input gst-custom"
                    type="number"
                    name="gst"
                    placeholder="Custom"
                    min="0"
                    max="100"
                    value={['0','5','12','18','28'].includes(product.gst) ? '' : product.gst}
                    onChange={(e) => handleProductChange(index, e)}
                    />
                </div>
              </div>

              {/* Product Total */}
              <div className="product-total">
                <span>Item Total</span>
                <span className="product-total-amount">
                  {symbol}{calcProductTotal(product).toFixed(2)}
                </span>
              </div>

            </div>
          ))}

          {/* Add Item Button */}
          <button type="button" className="add-item-btn" onClick={addProduct}>
            <FiPlus size={16} />
            Add Another Item
          </button>
        </div>

        {/* ── Notes ── */}
        <div className="ci-section">
          <p className="ci-section-title">Additional Notes</p>
          <div className="form-field">
            <textarea
              className="form-textarea"
              name="notes"
              placeholder="Add any notes or terms..."
              value={formData.notes}
              onChange={handleFormChange}
              />
          </div>
        </div>

        {/* ── Summary ── */}
        <div className="ci-summary">
          <p className="ci-section-title">Summary</p>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{symbol}{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row discount">
            <span>Total Discount</span>
            <span>- {symbol}{totalDiscount.toFixed(2)}</span>
          </div>
          <div className="summary-row gst">
            <span>Total GST</span>
            <span>+ {symbol}{totalGST.toFixed(2)}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row grand-total">
            <span>Grand Total</span>
            <span>{symbol}{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="ci-submit-btn">
          Create Invoice
        </button>

      </form>
    </div>
  </>
  );
};

export default CreateInvoice;