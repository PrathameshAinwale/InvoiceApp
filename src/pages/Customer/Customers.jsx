import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiPhone } from 'react-icons/fi';
import customers from '../../data/customer.json';
import TopNav from '../../components/common/TopNav';
import './Customer.css';

const categories = ['all', 'Business', 'Individual'];

const Customers = () => {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customerList, setCustomerList] = useState(customers);
  const [selectedPhone, setSelectedPhone] = useState(null);

  const filtered = customerList.filter((c) => {
    const matchesStatus   = filter === 'all'         ? true : c.status === filter;
    const matchesCategory = categoryFilter === 'all' ? true : c.category === categoryFilter;
    const matchesSearch   =
      c.name.toLowerCase().includes(search.toLowerCase())    ||
      c.email.toLowerCase().includes(search.toLowerCase())   ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleDelete = (id) => {
    setCustomerList(customerList.filter(c => c.id !== id));
  };

  return (
    <div className="customers-page page">
      <TopNav search={search} setSearch={setSearch} />

      {/* Header */}
      <div className="customers-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="customers-title">Customers</h2>
        <button className="add-customer-btn">
          <FiPlus size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="customers-summary">
        <div className="cust-summary-card total-card">
          <p className="cust-summary-label">Total</p>
          <p className="cust-summary-count">{customerList.length}</p>
        </div>
        <div className="cust-summary-card paid-card">
          <p className="cust-summary-label">Paid</p>
          <p className="cust-summary-count">
            {customerList.filter(c => c.status === 'paid').length}
          </p>
        </div>
        <div className="cust-summary-card pending-card">
          <p className="cust-summary-label">Pending</p>
          <p className="cust-summary-count">
            {customerList.filter(c => c.status === 'pending').length}
          </p>
        </div>
        <div className="cust-summary-card overdue-card">
          <p className="cust-summary-label">Overdue</p>
          <p className="cust-summary-count">
            {customerList.filter(c => c.status === 'overdue').length}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="customers-status-filter">
        {['all', 'paid', 'pending', 'overdue'].map((s) => (
          <button
            key={s}
            className={`filter-tab ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="customers-category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Customer List */}
      <div className="customers-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No customers found</p>
          </div>
        ) : (
          filtered.map((customer) => (
            <div key={customer.id} className="customer-card">

              {/* Avatar */}
              <div
                className="customer-avatar"
                style={{ background: customer.avatarColor }}
              >
                {customer.avatar}
              </div>

              {/* Info */}
              <div className="customer-info">
                <p className="customer-name">{customer.name}</p>
                <p className="customer-email">{customer.email}</p>
                <p className="customer-country">{customer.country}</p>
                <div className="customer-meta">
                  <span className="customer-invoices">
                    {customer.totalInvoices} invoices
                  </span>
                  <span className={`customer-category ${customer.category.toLowerCase()}`}>
                    {customer.category}
                  </span>
                </div>
              </div>

              {/* Right */}
              <div className="customer-right">
                <p className="customer-amount">
                  ₹{customer.totalAmount.toLocaleString()}
                </p>
                <span className={`customer-status ${customer.status}`}>
                  {customer.status}
                </span>

                {/* Action Buttons */}
                <div className="customer-actions">
                  <button
                    className="call-action-btn"
                    onClick={() => setSelectedPhone(customer)}
                  >
                    <FiPhone size={13} />
                  </button>
                  <button className="edit-btn">
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(customer.id)}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Phone Popup */}
      {selectedPhone && (
        <div className="phone-overlay" onClick={() => setSelectedPhone(null)}>
          <div className="phone-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSelectedPhone(null)}>
              ✕
            </button>
            <div
              className="popup-avatar"
              style={{ background: selectedPhone.avatarColor }}
            >
              {selectedPhone.avatar}
            </div>
            <p className="popup-name">{selectedPhone.name}</p>
            <p className="popup-label">Contact Number</p>
            <p className="popup-phone">{selectedPhone.phone}</p>
            <a href={`tel:${selectedPhone.phone}`} className="popup-call-btn">
              <FiPhone size={16} />
              Call Now
            </a>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;