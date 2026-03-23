import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPhone, FiEdit2, FiMail, FiMapPin } from 'react-icons/fi';
import { MdOutlineReceiptLong } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import customers from '../../../data/customer.json';
import invoices  from '../../../data/invoice.json';
import './CustomerDetails.css';
import TopNav from '../../../components/common/TopNav';

const CustomerDetail = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const { t }    = useTranslation();
  const [filter, setFilter] = useState('all');

  const customer = customers.find(c => c.id === id);

  const customerInvoices = invoices.filter(inv =>
    inv.customerName.toLowerCase() === customer?.name.toLowerCase()
  );

  const filtered = customerInvoices.filter(inv =>
    filter === 'all' ? true : inv.status === filter
  );

  const tabs = ['all', 'paid', 'pending', 'overdue', 'draft'];

  if (!customer) {
    return (
      <div className="cd-page page">
        <div className="cd-header">
          <button className="back-btn" onClick={() => navigate('/customers')}>
            <FiArrowLeft size={20} />
          </button>
          <h2 className="cd-title">{t("customerDetail.notFound")}</h2>
        </div>
      </div>
    );
  }

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
          <div className="cd-avatar" style={{ background: customer.avatarColor }}>
            {customer.avatar}
          </div>
          <h2 className="cd-name">{customer.name}</h2>
          <span className={`cd-status ${customer.status}`}>{customer.status}</span>

          {/* Contact Info */}
          <div className="cd-contact-list">
            <div className="cd-contact-item">
              <FiMail size={15} color="#667eea" />
              <span>{customer.email}</span>
            </div>
            <div className="cd-contact-item">
              <FiPhone size={15} color="#667eea" />
              <span>{customer.phone}</span>
            </div>
            <div className="cd-contact-item">
              <FiMapPin size={15} color="#667eea" />
              <span>{customer.country}</span>
            </div>
          </div>

          {/* Call Button */}
          <a href={`tel:${customer.phone}`} className="cd-call-btn">
            <FiPhone size={16} />
            {t("customerDetail.callNow")}
          </a>
        </div>

        {/* Stats Row */}
        <div className="cd-stats">
          <div className="cd-stat-card">
            <p className="cd-stat-label">{t("customerDetail.totalInvoices")}</p>
            <p className="cd-stat-value">{customer.totalInvoices}</p>
          </div>
          <div className="cd-stat-card">
            <p className="cd-stat-label">{t("customerDetail.totalAmount")}</p>
            <p className="cd-stat-value">₹{customer.totalAmount.toLocaleString()}</p>
          </div>
          <div className="cd-stat-card">
            <p className="cd-stat-label">{t("customerDetail.category")}</p>
            <p className="cd-stat-value">{customer.category}</p>
          </div>
        </div>

        {/* Invoice History */}
        <div className="cd-invoices-section">
          <div className="cd-invoices-header">
            <MdOutlineReceiptLong size={18} color="#667eea" />
            <h3 className="cd-invoices-title">{t("customerDetail.invoiceHistory")}</h3>
          </div>

          {/* Filter Tabs */}
          <div className="cd-filters">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`cd-filter-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {t(`customerDetail.tabs.${tab}`)}
              </button>
            ))}
          </div>

          {/* Invoice List */}
          <div className="cd-invoice-list">
            {filtered.length === 0 ? (
              <div className="cd-empty">
                <p>
                  {filter === 'all'
                    ? t("customerDetail.noInvoices")
                    : t("customerDetail.noFilterInvoices", { filter: t(`customerDetail.tabs.${filter}`) })}
                </p>
              </div>
            ) : (
              filtered.map(inv => (
                <div key={inv.id} className="cd-invoice-item">
                  <div className="cd-invoice-info">
                    <p className="cd-invoice-id">{inv.id}</p>
                    <p className="cd-invoice-date">{inv.date}</p>
                  </div>
                  <div className="cd-invoice-right">
                    <p className="cd-invoice-amount">
                      ${inv.amount.toLocaleString()}
                    </p>
                    <span className={`cd-invoice-badge ${inv.status}`}>
                      {t(`customerDetail.tabs.${inv.status}`)}
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