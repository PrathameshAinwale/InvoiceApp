import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentInvoice.css';
import { useTranslation } from 'react-i18next';
import API from '../api/api';

// ✅ Avatar colors
const AVATAR_COLORS = ["#667eea", "#e53e3e", "#38a169", "#d69e2e", "#805ad5", "#dd6b20", "#3182ce", "#e91e8c"];
const getAvatarColor = (seed) => {
  const str = String(seed || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const RecentInvoice = () => {
  const { t }    = useTranslation();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await API.get('/invoices/recent');
        setInvoices(res.data.invoices || []);
      } catch (err) {
        setError('Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="recent-invoice">

      {/* Header always visible */}
      <div className="recent-invoice-header">
        <h5>{t('recentInvoice.title')}</h5>
        <span onClick={() => navigate("/invoice")}>{t('recentInvoice.seeAll')}</span>
      </div>

      {/* ✅ Loading state */}
      {loading && (
        <p style={{ textAlign: 'center', padding: '16px', color: '#667eea', fontSize: '13px' }}>
          Loading...
        </p>
      )}

      {/* ✅ Error state */}
      {!loading && error && (
        <p style={{ textAlign: 'center', padding: '16px', color: 'red', fontSize: '13px' }}>
          {error}
        </p>
      )}

      {/* ✅ Empty state — inside the card with header */}
      {!loading && !error && invoices.length === 0 && (
        <p style={{ textAlign: 'center', padding: '16px', color: '#aaa', fontSize: '13px' }}>
          No recent invoices found.
        </p>
      )}

      {/* ✅ Invoice list */}
      {!loading && !error && invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="invoice-item"
          onClick={() => navigate(`/invoice/${invoice.id}`)}
          style={{ cursor: 'pointer' }}
        >
          {/* ✅ Avatar with auto color */}
          <div
            className="invoice-avatar"
            style={{ background: getAvatarColor(invoice.customer_name) }}
          >
            {invoice.customer_name?.charAt(0).toUpperCase()}
          </div>

          <div className="invoice-info">
            <p className="invoice-name">{invoice.customer_name}</p>
            <p className="invoice-id">{invoice.invoice_number}</p>
          </div>

          <div className="invoice-right">
            <p className="invoice-amount">
              {invoice.currency} {parseFloat(invoice.grand_total).toLocaleString()}
            </p>
            <p className="invoice-date">
              {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
          </div>

        </div>
      ))}

    </div>
  );
};

export default RecentInvoice;