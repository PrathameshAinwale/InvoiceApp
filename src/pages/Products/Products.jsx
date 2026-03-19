import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
import products from '../../data/products.json';
import TopNav from '../../components/common/TopNav';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productList, setProductList]   = useState(products);
  const [showFilter, setShowFilter]     = useState(false);

  // ── Dynamic categories from data ──────────────────────────
  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filtered = productList.filter((p) => {
    const matchesCategory = filter === 'all'       ? true : p.category === filter;
    const matchesStatus   = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesSearch   =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleDelete = (id) => setProductList(productList.filter(p => p.id !== id));

  // ── Check if any filter is active ─────────────────────────
  const isFiltered = filter !== 'all' || statusFilter !== 'all';

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
        <h2 className="products-title">Products</h2>
        <div className="header-actions">
          {/* Filter Icon */}
          <button
            className={`filter-icon-btn ${isFiltered ? 'filtered' : ''}`}
            onClick={() => setShowFilter(true)}
          >
            <FiFilter size={18} />
            {isFiltered && <span className="filter-dot" />}
          </button>
          <button className="add-product-btn" onClick={()=>navigate('/productform')}>
            <FiPlus size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="products-summary">
        <div className="prod-summary-card total-card">
          <p className="prod-summary-label">Total</p>
          <p className="prod-summary-count">{productList.length}</p>
        </div>
        <div className="prod-summary-card active-card">
          <p className="prod-summary-label">Active</p>
          <p className="prod-summary-count">{productList.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="prod-summary-card inactive-card">
          <p className="prod-summary-label">Inactive</p>
          <p className="prod-summary-count">{productList.filter(p => p.status === 'inactive').length}</p>
        </div>
      </div>

      {/* Product List */}
      <div className="products-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No products found</p></div>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-icon" style={{ background: product.iconColor }}>
                {product.icon}
              </div>
              <div className="product-info">
                <p className="product-name">{product.name}</p>
                <p className="product-category">{product.category}</p>
                <div className="product-meta">
                  <span className="product-unit">{product.unit}</span>
                  <span className="product-gst">GST {product.gst}%</span>
                </div>
              </div>
              <div className="product-right">
                <p className="product-price">₹{product.price.toLocaleString()}</p>
                <span className={`product-status ${product.status}`}>{product.status}</span>
                <div className="product-actions">
                  <button className="edit-btn" onClick={()=>navigate(`/product/edit/${product.id}`)}><FiEdit2 size={13} /></button>
                  <button className="delete-btn" onClick={() => handleDelete(product.id)}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Filter Bottom Sheet ────────────────────────────── */}
      {/* Overlay */}
      <div
        className={`filter-overlay ${showFilter ? 'open' : ''}`}
        onClick={() => setShowFilter(false)}
      />

      {/* Sheet */}
      <div className={`filter-sheet ${showFilter ? 'open' : ''}`}>

        {/* Sheet Header */}
        <div className="filter-sheet-header">
          <p className="filter-sheet-title">Filter Products</p>
          {isFiltered && (
            <button className="filter-clear-btn" onClick={handleClearFilters}>
              Clear All
            </button>
          )}
        </div>

        {/* Status Section */}
        <div className="filter-section">
          <p className="filter-section-label">Status</p>
          <div className="filter-options">
            {['all', 'active', 'inactive'].map((s) => (
              <button
                key={s}
                className={`filter-option-btn ${statusFilter === s ? 'selected' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Type Section */}
        <div className="filter-section">
          <p className="filter-section-label">Product Type</p>
          <div className="filter-options">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-option-btn ${filter === cat ? 'selected' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'All Types' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          className="filter-apply-btn"
          onClick={() => setShowFilter(false)}
        >
          Show {filtered.length} Product{filtered.length !== 1 ? 's' : ''}
        </button>

      </div>
    </div>
  );
};

export default Products;