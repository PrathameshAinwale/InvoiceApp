import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import TopNav from '../../components/common/TopNav';
import './Products.css';
import { FaBoxOpen } from "react-icons/fa6";

const BASE_URL = "http://localhost:5000/api";

const Products = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState('total');
  const [productList,  setProductList]  = useState([]);
  const [showFilter,   setShowFilter]   = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState('');

  // ── Fetch products from backend ───────────────────────────────────
  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProductList(data.data);
        else setApiError('Failed to load products.');
      })
      .catch(() => setApiError('Network error. Could not load products.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Filter ────────────────────────────────────────────────────────
  const filtered = productList.filter((p) => {
  const matchesCard =
    selectedCard === 'total' ? true : p.status === selectedCard;

  const matchesFilter =
    statusFilter === 'all' ? true : p.status === statusFilter;

  const matchesSearch =
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    String(p.id).includes(search);

  return matchesCard && matchesFilter && matchesSearch;
});
  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProductList(productList.filter(p => p.id !== id));
        else alert('Failed to delete product.');
      })
      .catch(() => alert('Network error. Could not delete product.'));
  };

  const isFiltered         = statusFilter !== 'all';
  const handleClearFilters = () => { setStatusFilter('all'); setShowFilter(false); };

  return (
    <div className="products-page page">
      <TopNav search={search} setSearch={setSearch} />

      {/* Header */}
      <div className="products-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="products-title">{t("products.title")}</h2>
        <div className="header-actions">
          <button
            className={`filter-icon-btn ${isFiltered ? 'filtered' : ''}`}
            onClick={() => setShowFilter(true)}
          >
            <FiFilter size={18} />
            {isFiltered && <span className="filter-dot" />}
          </button>
          <button className="add-product-btn" onClick={() => navigate('/productform')}>
            <FiPlus size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="products-summary">
        <div
          className={`prod-summary-card total-card ${selectedCard === 'total' ? 'card-active' : ''}`}
          onClick={() => setSelectedCard('total')}
        >
          <p className="prod-summary-label">{t("products.summary.total")}</p>
          <p className="prod-summary-count">{productList.length}</p>
        </div>
        <div
          className={`prod-summary-card active-card ${selectedCard === 'in_stock' ? 'card-active' : ''}`}
          onClick={() => setSelectedCard('in_stock')}
        >
          <p className="prod-summary-label">{t("products.summary.active")}</p>
          <p className="prod-summary-count">{productList.filter(p => p.status === 'in_stock').length}</p>
        </div>
        <div
          className={`prod-summary-card inactive-card ${selectedCard === 'out_of_stock' ? 'card-active' : ''}`}
          onClick={() => setSelectedCard('out_of_stock')}
        >
          <p className="prod-summary-label">{t("products.summary.inactive")}</p>
          <p className="prod-summary-count">{productList.filter(p => p.status === 'out_of_stock').length}</p>
        </div>
      </div>

      {/* Loading / Error */}
      {loading   && <p style={{ textAlign: 'center', padding: '20px' }}>Loading...</p>}
      {apiError  && <p style={{ textAlign: 'center', color: 'red', padding: '20px' }}>{apiError}</p>}

      {/* Product List */}
      <div className="products-list">
        {!loading && filtered.length === 0 ? (
          <div className="empty-state">
            <p>{t("products.noProducts")}</p>
          </div>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="product-card">

              {/* Status Badge */}
              <span
                className={`product-status-badge ${product.status}`}
                style={{ position: 'absolute', top: '12px', left: '12px' }}
              >
                {product.status === 'in_stock' ? t("products.status.in_stock") : t("products.status.out_of_stock")}
              </span>

              {/* Center Content */}
              <div className="product-center-content">
                <FaBoxOpen  size={30} color={product.status === 'in_stock' ? 'green' : 'gray'} />
                <p className="product-name">{product.name}</p>
                <p className="product-price">₹{Number(product.price).toLocaleString()}</p>
                <p className="product-category">{product.unit} · Qty: {product.quantity}</p>
              </div>

              {/* Bottom Actions */}
              <div
                className="product-actions-bottom"
                style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)' }}
              >
                <button
                  className="action-btn edit-btn"
                  onClick={() => navigate(`/product/edit/${product.id}`)}  // product.id is now integer from DB
                >
                  <FiEdit2 size={12} /> {t("products.actions.edit")}
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  <FiTrash2 size={12} /> {t("products.actions.delete")}
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Filter Overlay */}
      <div
        className={`filter-overlay ${showFilter ? 'open' : ''}`}
        onClick={() => setShowFilter(false)}
      />

      {/* Filter Sheet */}
      <div className={`filter-sheet ${showFilter ? 'open' : ''}`}>

        <div className="filter-sheet-header">
          <p className="filter-sheet-title">{t("products.filter.title")}</p>
          {isFiltered && (
            <button className="filter-clear-btn" onClick={handleClearFilters}>
              {t("products.filter.clearAll")}
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="filter-section">
          <p className="filter-section-label">{t("products.filter.status")}</p>
          <div className="filter-options">
            {['all', 'in_stock', 'out_of_stock'].map((s) => (
              <button
                key={s}
                className={`filter-option-btn ${statusFilter === s ? 'selected' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? t("products.filter.all")
                  : s === 'in_stock' ? t("products.status.in_stock")
                  : t("products.status.out_of_stock")}
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button className="filter-apply-btn" onClick={() => setShowFilter(false)}>
          {filtered.length !== 1
            ? t("products.filter.showProductsPlural", { count: filtered.length })
            : t("products.filter.showProducts",       { count: filtered.length })}
        </button>

      </div>
    </div>
  );
};

export default Products;
