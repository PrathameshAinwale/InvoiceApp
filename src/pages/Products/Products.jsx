import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import products from '../../data/products.json';
import TopNav from '../../components/common/TopNav';
import './Products.css';

const categories = ['all', 'Design', 'Development', 'Marketing', 'Content'];

const Products = () => {
  const navigate  = useNavigate();
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productList, setProductList]   = useState(products);

  const filtered = productList.filter((p) => {
    const matchesCategory = filter === 'all'       ? true : p.category === filter;
    const matchesStatus   = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesSearch   =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleDelete = (id) => {
    setProductList(productList.filter(p => p.id !== id));
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
        <button className="add-product-btn">
          <FiPlus size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="products-summary">
        <div className="prod-summary-card total-card">
          <p className="prod-summary-label">Total</p>
          <p className="prod-summary-count">{productList.length}</p>
        </div>
        <div className="prod-summary-card active-card">
          <p className="prod-summary-label">Active</p>
          <p className="prod-summary-count">
            {productList.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="prod-summary-card inactive-card">
          <p className="prod-summary-label">Inactive</p>
          <p className="prod-summary-count">
            {productList.filter(p => p.status === 'inactive').length}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="products-status-filter">
        {['all', 'active', 'inactive'].map((s) => (
          <button
            key={s}
            className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="products-category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="products-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No products found</p>
          </div>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="product-card">

              {/* Icon */}
              <div
                className="product-icon"
                style={{ background: product.iconColor }}
              >
                {product.icon}
              </div>

              {/* Info */}
              <div className="product-info">
                <p className="product-name">{product.name}</p>
                <p className="product-category">{product.category}</p>
                <div className="product-meta">
                  <span className="product-unit">{product.unit}</span>
                  <span className="product-gst">GST {product.gst}%</span>
                </div>
              </div>

              {/* Right */}
              <div className="product-right">
                <p className="product-price">
                  ₹{product.price.toLocaleString()}
                </p>
                <span className={`product-status ${product.status}`}>
                  {product.status}
                </span>

                {/* Action Buttons */}
                <div className="product-actions">
                  <button className="edit-btn">
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(product.id)}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;