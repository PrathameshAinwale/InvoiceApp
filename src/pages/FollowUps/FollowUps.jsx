import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiX, FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import followUps from "../../data/followUps.json";
import "./FollowUps.css";
import TopNav from "../../components/common/TopNav";

const FollowUps = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [filter, setFilter]               = useState("all");

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
          <h2 className="followups-title">{t("followUps.title")}</h2>
        </div>

        {/* Toggle Pills */}
        <div className="followups-filters">
          <div
            className={`followup-pill overdue-pill ${filter === "overdue" ? "selected" : ""}`}
            onClick={() => setFilter(filter === "overdue" ? "all" : "overdue")}
          >
            <span className="pill-label">{t("followUps.overdue")}</span>
            <span className="pill-count">{overdueCount}</span>
          </div>
          <div
            className={`followup-pill pending-pill ${filter === "pending" ? "selected" : ""}`}
            onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
          >
            <span className="pill-label">{t("followUps.pending")}</span>
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
                    ? t("followUps.overdueBy", { days: item.overdueBy })
                    : t("followUps.pending")}
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
              <p>
                {t("followUps.noFollowUps", {
                  filter: t(`followUps.${filter === "all" ? "overdue" : filter}`)
                })}
              </p>
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
              <p className="popup-label">{t("followUps.contactNumber")}</p>
              <p className="popup-phone">{selectedPhone.phone}</p>
              <a href={`tel:${selectedPhone.phone}`} className="popup-call-btn">
                <FiPhone size={16} />
                {t("followUps.callNow")}
              </a>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default FollowUps;