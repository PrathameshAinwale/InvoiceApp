import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPhone, FiX } from 'react-icons/fi';
import followUps from "../../data/followUps.json";
import './FollowUp.css';

const FollowUp = () => {
  const navigate = useNavigate();
  const [selectedPhone, setSelectedPhone] = useState(null);

  return (
    <div className="followup-container">

      {/* Header */}
      <div className="followup-header">
        <h5>Follow-up</h5>
        <span onClick={() => navigate("/follow-up")}>see all</span>
      </div>

      {/* List */}
      {followUps.slice(0, 3).map((item) => (
        <div key={item.id} className="followup-item">

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
            <p className="followup-id">{item.invoiceId}</p>
          </div>

          {/* Amount + Call */}
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

      {/* Phone Popup */}
      {selectedPhone && (
        <div className="phone-overlay" onClick={() => setSelectedPhone(null)}>
          <div
            className="phone-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="popup-close"
              onClick={() => setSelectedPhone(null)}
            >
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

              <FiPhone size={16} />
              Call Now
  
          </div>
        </div>
      )}

    </div>
  );
};

export default FollowUp;