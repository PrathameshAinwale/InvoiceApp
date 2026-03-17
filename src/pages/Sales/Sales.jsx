import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrendingUp } from 'react-icons/fi';
import sales from '../../data/sales.json';
import './Sales.css';
import TopNav from '../../components/common/TopNav';

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£',
  INR: '₹', JPY: '¥', AUD: 'A$',
};

const Sales = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = sales.filter((item) => {
    const matchesFilter = filter === 'all' ? true : item.status === filter;
    const matchesSearch =
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // summary calculations
  const totalRevenue  = sales
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.finalAmount, 0);
  const totalSales    = sales.filter(s => s.status === 'completed').length;
  const totalRefunded = sales.filter(s => s.status === 'refunded').length;
  const totalCancelled = sales.filter(s => s.status === 'cancelled').length;

  return (
    <>
    <TopNav/>
    <div className="sales-page page">

      {/* Header */}
      <div className="sales-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="sales-title">Sales</h2>
        <FiTrendingUp size={22} color="#667eea" />
      </div>

      {/* Summary Cards */}
      <div className="sales-summary">
        <div className="sales-summary-card revenue-card">
          <p className="sales-summary-label">Total Revenue</p>
          <p className="sales-summary-value">
            ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="sales-summary-card completed-card">
          <p className="sales-summary-label">Completed</p>
          <p className="sales-summary-value">{totalSales}</p>
        </div>
        <div className="sales-summary-card refunded-card">
          <p className="sales-summary-label">Refunded</p>
          <p className="sales-summary-value">{totalRefunded}</p>
        </div>
        <div className="sales-summary-card cancelled-card">
          <p className="sales-summary-label">Cancelled</p>
          <p className="sales-summary-value">{totalCancelled}</p>
        </div>
      </div>

      {/* Search */}
      <div className="sales-search-wrapper">
        <input
          className="sales-search"
          type="text"
          placeholder="Search by customer, product, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          />
      </div>

      {/* Filter Tabs */}
      <div className="sales-filters">
        {['all', 'completed', 'refunded', 'cancelled'].map((tab) => (
          <button
          key={tab}
          className={`filter-tab ${filter === tab ? 'active' : ''}`}
          onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Sales Count */}
      <p className="sales-count">{filtered.length} sale{filtered.length !== 1 ? 's' : ''}</p>

      {/* Sales List */}
      <div className="sales-list">
        {filtered.map((item) => (
          <div key={item.id} className="sale-card">

            {/* Top Row */}
            <div className="sale-top">
              <div className="sale-avatar-name">
                <div
                  className="sale-avatar"
                  style={{ background: item.avatarColor }}
                  >
                  {item.avatar}
                </div>
                <div>
                  <p className="sale-customer">{item.customerName}</p>
                  <p className="sale-id">{item.id}</p>
                </div>
              </div>
              <span className={`sale-badge ${item.status}`}>
                {item.status}
              </span>
            </div>

            {/* Divider */}
            <div className="sale-divider" />

            {/* Product Info */}
            <div className="sale-product-row">
              <div>
                <p className="sale-product-name">{item.product}</p>
                <p className="sale-product-meta">
                  {item.quantity} {item.unit} ·{' '}
                  {item.discount > 0 ? `${item.discount}% off ·` : ''}{' '}
                  GST {item.gst}%
                </p>
              </div>
              <div className="sale-amounts">
                <p className="sale-final-amount">
                  {CURRENCY_SYMBOLS[item.currency] || item.currency + ' '}
                  {item.finalAmount.toLocaleString()}
                </p>
                <p className="sale-base-amount">
                  {CURRENCY_SYMBOLS[item.currency] || item.currency + ' '}
                  {item.amount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="sale-bottom">
              <p className="sale-date">{item.date}</p>
              <p className="sale-payment">{item.paymentMethod}</p>
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No {filter} sales found</p>
          </div>
        )}
      </div>

    </div>
  </>
  );
};

export default Sales;