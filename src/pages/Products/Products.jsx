import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import products from '../../data/products.json';
import TopNav from '../../components/common/TopNav';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState('total');
  const [productList, setProductList]   = useState(products);
  const [showFilter, setShowFilter]     = useState(false);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filtered = productList.filter((p) => {
    const matchesCategory = filter === 'all'       ? true : p.category === filter;
    const matchesStatus   = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesSearch   =
      p.name.toLowerCase().includes(search.toLowerCase())     ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleDelete       = (id) => setProductList(productList.filter(p => p.id !== id));
  const handleCardSelect   = (cardType) => setSelectedCard(cardType);
  const isFiltered         = filter !== 'all' || statusFilter !== 'all';
  const handleClearFilters = () => {
    setFilter('all');
    setStatusFilter('all');
    setShowFilter(false);
  };

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
          onClick={() => handleCardSelect('total')}
        >
          <p className="prod-summary-label">{t("products.summary.total")}</p>
          <p className="prod-summary-count">{productList.length}</p>
        </div>
        <div
          className={`prod-summary-card active-card ${selectedCard === 'active' ? 'card-active' : ''}`}
          onClick={() => handleCardSelect('active')}
        >
          <p className="prod-summary-label">{t("products.summary.active")}</p>
          <p className="prod-summary-count">{productList.filter(p => p.status === 'active').length}</p>
        </div>
        <div
          className={`prod-summary-card inactive-card ${selectedCard === 'inactive' ? 'card-active' : ''}`}
          onClick={() => handleCardSelect('inactive')}
        >
          <p className="prod-summary-label">{t("products.summary.inactive")}</p>
          <p className="prod-summary-count">{productList.filter(p => p.status === 'inactive').length}</p>
        </div>
      </div>

      {/* Product List */}
      <div className="products-list">
        {filtered.length === 0 ? (
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
                {t(`products.status.${product.status}`)}
              </span>

              {/* Icon */}
              <div className="product-icon" style={{ background: product.iconColor }}>
                {product.icon}
              </div>

              {/* Center Content */}
              <div className="product-center-content">
                <p className="product-name">{product.name}</p>
                <p className="product-price">₹{product.price.toLocaleString()}</p>
                <p className="product-category">{product.category}</p>
              </div>

              {/* GST Badge */}
              <div
                className="product-gst-top"
                style={{ position: 'absolute', top: '12px', right: '12px' }}
              >
                <span className="product-gst">{t("products.gst")} {product.gst}%</span>
              </div>

              {/* Bottom Actions */}
              <div
                className="product-actions-bottom"
                style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)' }}
              >
                <button
                  className="action-btn edit-btn"
                  onClick={() => navigate(`/product/edit/${product.id}`)}
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
            {['all', 'active', 'inactive'].map((s) => (
              <button
                key={s}
                className={`filter-option-btn ${statusFilter === s ? 'selected' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? t("products.filter.all") : t(`products.filter.${s}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-section">
          <p className="filter-section-label">{t("products.filter.productType")}</p>
          <div className="filter-options">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-option-btn ${filter === cat ? 'selected' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? t("products.filter.allTypes") : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          className="filter-apply-btn"
          onClick={() => setShowFilter(false)}
        >
          {filtered.length !== 1
            ? t("products.filter.showProductsPlural", { count: filtered.length })
            : t("products.filter.showProducts",       { count: filtered.length })}
        </button>

      </div>
    </div>
  );
};

export default Products;