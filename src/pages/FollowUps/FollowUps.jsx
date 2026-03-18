import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiX, FiArrowLeft } from "react-icons/fi";
import followUps from "../../data/followUps.json";
import "./FollowUps.css";
import TopNav from "../../components/common/TopNav";

const FollowUps = () => {
  const navigate = useNavigate();
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [filter, setFilter] = useState("all");

  const overdueCount = followUps.filter((f) => f.status === "overdue").length;
  const pendingCount = followUps.filter((f) => f.status === "pending").length;

  const filtered = followUps.filter((item) => {
    if (filter === "all")     return true;
    if (filter === "overdue") return item.status === "overdue";
    if (filter === "pending") return item.status === "pending";
  });

  return (
    <>
      <TopNav />
      <div className="followups-page page">

        {/* Header */}
        <div className="followups-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            <FiArrowLeft size={20} />
          </button>
          <h2 className="followups-title">Follow-up</h2>
        </div>

        {/* Toggle Pills — summary + filter in one */}
        <div className="followups-filters">
          <div
            className={`followup-pill overdue-pill ${filter === "overdue" ? "selected" : ""}`}
            onClick={() => setFilter(filter === "overdue" ? "all" : "overdue")}
          >
            <span className="pill-label">Overdue</span>
            <span className="pill-count">{overdueCount}</span>
          </div>
          <div
            className={`followup-pill pending-pill ${filter === "pending" ? "selected" : ""}`}
            onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
          >
            <span className="pill-label">Pending</span>
            <span className="pill-count">{pendingCount}</span>
          </div>
        </div>

        {/* List */}
        <div className="followups-list">
          {filtered.map((item) => (
            <div key={item.id} className="followup-card">

              <div className="followup-avatar" style={{ background: item.avatarColor }}>
                {item.avatar}
              </div>

              <div className="followup-info">
                <p className="followup-name">{item.customerName}</p>
                <p className="followup-invoice">{item.invoiceId}</p>
                <span className={`followup-badge ${item.status}`}>
                  {item.status === "overdue"
                    ? `Overdue by ${item.overdueBy} days`
                    : "Pending"}
                </span>
              </div>

              <div className="followup-right">
                <p className="followup-amount">
                  ${item.amountPending.toLocaleString()}
                </p>
                <button className="call-btn" onClick={() => setSelectedPhone(item)}>
                  <FiPhone size={16} />
                </button>
              </div>

            </div>
          ))}

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
              <div className="popup-avatar" style={{ background: selectedPhone.avatarColor }}>
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