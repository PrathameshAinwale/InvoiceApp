import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiSearch } from 'react-icons/fi';
import invoice from '../../data/invoice.json';
import './Invoice.css';
import TopNav from '../../components/common/TopNav';

const Invoice = () => {
  const navigate = useNavigate();
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  // filter based on status
  const filtered = invoice.filter((item) => {
    const matchesFilter =
      filter === 'all' ? true : item.status === filter;
    const matchesSearch =
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
    <TopNav/>
    <div className="invoice-page page">

      {/* Header */}
      <div className="invoice-page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="invoice-page-title">Invoices</h2>
        <button
          className="add-invoice-btn"
          onClick={() => navigate('/createinvoice')}
        >
          <FiPlus size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="invoice-summary">
        <div className="inv-summary-card paid-card">
          <p className="inv-summary-label">Paid</p>
          <p className="inv-summary-count">
            {invoice.filter(i => i.status === 'paid').length}
          </p>
        </div>
        <div className="inv-summary-card pending-card">
          <p className="inv-summary-label">Pending</p>
          <p className="inv-summary-count">
            {invoice.filter(i => i.status === 'pending').length}
          </p>
        </div>
        <div className="inv-summary-card overdue-card">
          <p className="inv-summary-label">Overdue</p>
          <p className="inv-summary-count">
            {invoice.filter(i => i.status === 'overdue').length}
          </p>
        </div>
        <div className="inv-summary-card draft-card">
          <p className="inv-summary-label">Draft</p>
          <p className="inv-summary-count">
            {invoice.filter(i => i.status === 'draft').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="invoice-search-wrapper">
        <FiSearch className="invoice-search-icon" size={16} />
        <input
          className="invoice-search"
          type="text"
          placeholder="Search by name or invoice ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="invoice-filters">
        {['all', 'paid', 'unpaid', 'overdue', 'draft'].map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div className="invoice-list">
        {filtered.map((item) => (
          <div key={item.id} className="invoice-card">

            {/* Avatar */}
            <div
              className="inv-avatar"
              style={{ background: item.avatarColor }}
            >
              {item.avatar}
            </div>

            {/* Info */}
            <div className="inv-info">
              <p className="inv-name">{item.customerName}</p>
              <p className="inv-id">{item.id}</p>
              <p className="inv-date">{item.date}</p>
            </div>

            {/* Right */}
            <div className="inv-right">
              <p className="inv-amount">
                ${item.amount.toLocaleString()}
              </p>
              <span className={`inv-badge ${item.status}`}>
                {item.status}
              </span>
            </div>

          </div>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No invoices found</p>
          </div>
        )}
      </div>

    </div>
  </>
  );
};

export default Invoice;