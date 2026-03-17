import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPhone, FiX, FiArrowLeft } from 'react-icons/fi';
import followUps from '../../data/followUps.json';
import './FollowUps.css';
import TopNav from '../../components/common/TopNav';

const FollowUps = () => {
  const navigate = useNavigate();
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [filter, setFilter] = useState('all');  // all, overdue, pending

  // filter based on status
  const filtered = followUps.filter((item) => {
    if (filter === 'all')     return true;
    if (filter === 'overdue') return item.status === 'overdue';
    if (filter === 'pending') return item.status === 'pending';
  });

  return (
    <>
    <TopNav/>
    <div className="followups-page page">

      {/* Header */}
      <div className="followups-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="followups-title">Follow-ups</h2>
      </div>

      {/* Summary Cards */}
      <div className="followups-summary">
        <div className="summary-card overdue-card">
          <p className="summary-label">Overdue</p>
          <p className="summary-count">
            {followUps.filter(f => f.status === 'overdue').length}
          </p>
        </div>
        <div className="summary-card pending-card">
          <p className="summary-label">Pending</p>
          <p className="summary-count">
            {followUps.filter(f => f.status === 'pending').length}
          </p>
        </div>
        <div className="summary-card total-card">
          <p className="summary-label">Total Due</p>
          <p className="summary-count">
            ${followUps.reduce((sum, f) => sum + f.amountPending, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="followups-filters">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          >
          All ({followUps.length})
        </button>
        <button
          className={`filter-tab ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => setFilter('overdue')}
          >
          Overdue
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
          >
          Pending
        </button>
      </div>

      {/* Full List — all items */}
      <div className="followups-list">
        {filtered.map((item) => (
          <div key={item.id} className="followup-card">

            {/* Avatar */}
            <div
              className="followup-avatar"
              style={{ background: item.avatarColor }}
              >
              {item.avatar}
            </div>

            {/* Info */}
            <div className="followup-info">
              <p className="followup-name">{item.customerName}</p>
              <p className="followup-invoice">{item.invoiceId}</p>
              <span className={`followup-badge ${item.status}`}>
                {item.status === 'overdue'
                  ? `Overdue by ${item.overdueBy} days`
                  : 'Pending'}
              </span>
            </div>

            {/* Right */}
            <div className="followup-right">
              <p className="followup-amount">
                ${item.amountPending.toLocaleString()}
              </p>
              <button
                className="call-btn"
                onClick={() => setSelectedPhone(item)}
                >
                <FiPhone size={16} />
              </button>
            </div>

          </div>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No {filter} follow-ups found</p>
          </div>
        )}
      </div>

      {/* Phone Popup */}
      {selectedPhone && (
        <div className="phone-overlay" onClick={() => setSelectedPhone(null)}>
          <div className="phone-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSelectedPhone(null)}>
              <FiX size={18} />
            </button>
            <div
              className="popup-avatar"
              style={{ background: selectedPhone.avatarColor }}
              >
              {selectedPhone.avatar}
            </div>
            <p className="popup-name">{selectedPhone.customerName}</p>
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
    </>
  );
};

export default FollowUps;