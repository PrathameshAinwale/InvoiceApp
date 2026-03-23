import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPhone, FiEdit2, FiMail, FiMapPin } from 'react-icons/fi';
import { MdOutlineReceiptLong } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import API from '../../../api/api'; // ✅ added
import './CustomerDetails.css';
import TopNav from '../../../components/common/TopNav';

// ✅ Avatar colors
const AVATAR_COLORS = ["#667eea", "#e53e3e", "#38a169", "#d69e2e", "#805ad5", "#dd6b20", "#3182ce", "#e91e8c"];
const getAvatarColor = (seed) => {
  const str = String(seed || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const STATUS_BADGE = {
  paid:     { label: "Paid",      color: "#2e7d32" },
  unpaid:   { label: "Unpaid",    color: "#f57f17" },
  followup: { label: "Follow Up", color: "#6a1b9a" },
};

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹",
  JPY: "¥", AUD: "A$", CAD: "C$", SGD: "S$",
};

const CustomerDetail = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const { t }    = useTranslation();

  const [filter,    setFilter]    = useState('all');
  const [customer,  setCustomer]  = useState(null);
  const [invoices,  setInvoices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // ✅ Fetch customer + their invoices
useEffect(() => {
  const fetchData = async () => {
    try {
      // Line 46 — fetch customer
      const custRes = await API.get(`/customers/${id}`);
      const cust    = custRes.data.customer;
      setCustomer(cust);

      // Line 51 — ✅ fetch invoices using by-customer endpoint
      const invRes = await API.get(`/invoices/by-customer/${encodeURIComponent(cust.name)}`);
      setInvoices(invRes.data.invoices || []);
    } catch (err) {
      setError('Failed to load customer details.');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [id]);

  // ✅ Filter invoices by status tab
  const filtered = invoices.filter((inv) =>
    filter === 'all' ? true : inv.status === filter
  );

  const tabs = ['all', 'paid', 'unpaid', 'followup'];

  // ✅ Compute stats from real invoices
  const totalAmount = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.grand_total || 0), 0
  );
  const symbol = CURRENCY_SYMBOLS[customer?.currency] || (customer?.currency + ' ') || '₹';

  if (loading) return (
    <div className="cd-page page" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ color: '#667eea', fontWeight: 600 }}>Loading...</p>
    </div>
  );

  if (error || !customer) return (
    <div className="cd-page page">
      <div className="cd-header">
        <button className="back-btn" onClick={() => navigate('/customers')}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="cd-title">{t("customerDetail.notFound")}</h2>
      </div>
    </div>
  );

  return (
    <>
      <TopNav />
      <div className="cd-page page">

        {/* Header */}
        <div className="cd-header">
          <button className="back-btn" onClick={() => navigate('/customers')}>
            <FiArrowLeft size={20} />
          </button>
          <h2 className="cd-title">{t("customerDetail.title")}</h2>
          <button
            className="cd-edit-btn"
            onClick={() => navigate(`/editcustomer/${customer.id}`)}
          >
            <FiEdit2 size={18} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="cd-profile-card">
          {/* ✅ Auto color avatar */}
          <div
            className="cd-avatar"
            style={{ background: getAvatarColor(customer.name) }}
          >
            {String(customer.name || '?').charAt(0).toUpperCase()}
          </div>

          <h2 className="cd-name">{customer.name}</h2>

          {/* ✅ Category badge instead of status */}
          {customer.category && (
            <span className="cd-status">{customer.category}</span>
          )}

          {/* Contact Info */}
          <div className="cd-contact-list">
            {customer.email && (
              <div className="cd-contact-item">
                <FiMail size={15} color="#667eea" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="cd-contact-item">
                <FiPhone size={15} color="#667eea" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.country && (
              <div className="cd-contact-item">
                <FiMapPin size={15} color="#667eea" />
                <span>{customer.country}</span>
              </div>
            )}
            {/* ✅ Billing address */}
            {customer.billing_address && (
              <div className="cd-contact-item">
                <FiMapPin size={15} color="#667eea" />
                <span>Billing: {customer.billing_address}</span>
              </div>
            )}
            {/* ✅ Shipping address */}
            {customer.shipping_address && (
              <div className="cd-contact-item">
                <FiMapPin size={15} color="#38a169" />
                <span>Shipping: {customer.shipping_address}</span>
              </div>
            )}
          </div>

          {/* Call Button */}
          {customer.phone ? (
            <a href={`tel:${customer.phone}`} className="cd-call-btn">
              <FiPhone size={16} />
              {t("customerDetail.callNow")}
            </a>
          ) : (
            <p style={{ color: '#aaa', fontSize: '13px', marginTop: '12px' }}>
              No phone number available
            </p>
          )}
        </div>

        {/* ✅ Stats Row — computed from real invoices */}
        <div className="cd-stats">
          <div className="cd-stat-card">
            <p className="cd-stat-label">{t("customerDetail.totalInvoices")}</p>
            <p className="cd-stat-value">{invoices.length}</p>
          </div>
          <div className="cd-stat-card">
            <p className="cd-stat-label">{t("customerDetail.totalAmount")}</p>
            <p className="cd-stat-value">
              {symbol}{totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="cd-stat-card">
            <p className="cd-stat-label">{t("customerDetail.category")}</p>
            <p className="cd-stat-value">{customer.category || '—'}</p>
          </div>
        </div>

        {/* Invoice History */}
        <div className="cd-invoices-section">
          <div className="cd-invoices-header">
            <MdOutlineReceiptLong size={18} color="#667eea" />
            <h3 className="cd-invoices-title">{t("customerDetail.invoiceHistory")}</h3>
          </div>

          {/* ✅ Filter Tabs — updated to match DB statuses */}
          <div className="cd-filters">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`cd-filter-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab === 'all'      ? 'All'       :
                 tab === 'paid'     ? 'Paid'      :
                 tab === 'unpaid'   ? 'Unpaid'    :
                 tab === 'followup' ? 'Follow Up' : tab}
                {/* ✅ Count badge */}
                <span style={{
                  marginLeft: '4px', fontSize: '10px',
                  background: filter === tab ? 'rgba(255,255,255,0.3)' : '#f0f0f0',
                  color: filter === tab ? '#fff' : '#666',
                  padding: '1px 6px', borderRadius: '10px',
                }}>
                  {tab === 'all'
                    ? invoices.length
                    : invoices.filter((i) => i.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          {/* ✅ Invoice List */}
          <div className="cd-invoice-list">
            {filtered.length === 0 ? (
              <div className="cd-empty">
                <p>{t("customerDetail.noInvoices")}</p>
              </div>
            ) : (
              filtered.map((inv) => (
                <div
                  key={inv.id}
                  className="cd-invoice-item"
                  onClick={() => navigate(`/invoice/${inv.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="cd-invoice-info">
                    {/* ✅ Correct field names from backend */}
                    <p className="cd-invoice-id">{inv.invoice_number}</p>
                    <p className="cd-invoice-date">
                      {new Date(inv.invoice_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="cd-invoice-right">
                    <p className="cd-invoice-amount">
                      {inv.currency} {parseFloat(inv.grand_total).toLocaleString()}
                    </p>
                    {/* ✅ Dynamic status badge */}
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '20px',
                      color: '#fff',
                      background: STATUS_BADGE[inv.status]?.color || '#aaa',
                    }}>
                      {STATUS_BADGE[inv.status]?.label || inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default CustomerDetail;