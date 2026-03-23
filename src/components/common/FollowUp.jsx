import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./FollowUp.css";

const AVATAR_COLORS = ["#667eea", "#e53e3e", "#38a169", "#d69e2e", "#805ad5", "#dd6b20", "#3182ce", "#e91e8c"];

const getAvatarColor = (seed) => {
  const str = String(seed || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const STATUS_OPTIONS = [
  { value: "paid",     label: "Mark as Paid",     color: "#2e7d32", emoji: "✅" },
  { value: "unpaid",   label: "Mark as Unpaid",   color: "#f57f17", emoji: "🔄" },
  { value: "followup", label: "Follow Up",         color: "#6a1b9a", emoji: "📌" },
];

const STATUS_BADGE = {
  paid:     { label: "Paid",      color: "#2e7d32" },
  unpaid:   { label: "Unpaid",    color: "#f57f17" },
  followup: { label: "Follow Up", color: "#6a1b9a" },
};

const FollowUp = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [loading,      setLoading]      = useState(true);
  const [invoices,     setInvoices]     = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [note,         setNote]         = useState("");
  const [saving,       setSaving]       = useState(false);
  const [savedId,      setSavedId]      = useState(null);
  const [noteSaved,    setNoteSaved]    = useState(false); // ✅ shows "Saved" on auto-save
  const debounceRef = useRef(null);  // ✅ for debounced auto-save

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await API.get("/invoices");
        const filtered = res.data.invoices.filter(
          (inv) => inv.status === "unpaid" || inv.status === "followup"
        );
        setInvoices(filtered);
      } catch (err) {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleOpenPopup = (item) => {
    setSelectedItem(item);
    setNote(item.followup_note || ""); // ✅ prefill from followup_note field
    setNoteSaved(false);
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
    setNote("");
    setNoteSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  // ✅ Auto-save note to followup_note field after 1 second of no typing
  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNote(val);
    setNoteSaved(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!selectedItem) return;
      try {
        const res  = await API.get(`/invoices/${selectedItem.id}`);
        const full = res.data.invoice;
        await API.put(`/invoices/${selectedItem.id}`, {
          customer_name:    full.customer_name,
          invoice_date:     full.invoice_date?.split("T")[0],
          currency:         full.currency,
          additional_notes: full.additional_notes,
          followup_note:    val,   // ✅ save to followup_note
          subtotal:         full.subtotal,
          total_discount:   full.total_discount,
          gst:              full.gst,
          grand_total:      full.grand_total,
          status:           full.status,
          items:            full.items,
        });
        // Update local list too
        setInvoices((prev) =>
          prev.map((i) =>
            i.id === selectedItem.id ? { ...i, followup_note: val } : i
          )
        );
        setNoteSaved(true); // ✅ show "Saved ✓"
      } catch (err) {
        console.error("Auto-save failed:", err.message);
      }
    }, 1000); // 1 second debounce
  };

  // ✅ Update status in DB
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      const res  = await API.get(`/invoices/${selectedItem.id}`);
      const full = res.data.invoice;

      await API.put(`/invoices/${selectedItem.id}`, {
        customer_name:    full.customer_name,
        invoice_date:     full.invoice_date?.split("T")[0],
        currency:         full.currency,
        additional_notes: full.additional_notes,
        followup_note:    note,   // ✅ save note too
        subtotal:         full.subtotal,
        total_discount:   full.total_discount,
        gst:              full.gst,
        grand_total:      full.grand_total,
        status:           newStatus,
        items:            full.items,
      });

      if (newStatus === "paid") {
        setInvoices((prev) => prev.filter((i) => i.id !== selectedItem.id));
      } else {
        setInvoices((prev) =>
          prev.map((i) =>
            i.id === selectedItem.id
              ? { ...i, status: newStatus, followup_note: note }
              : i
          )
        );
      }

      setSavedId(selectedItem.id);
      setTimeout(() => setSavedId(null), 2000);
      handleClosePopup();
    } catch (err) {
      alert("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="followup-container">

      {/* Header */}
      <div className="followup-header">
        <h5>{t("followUp.title")}</h5>
        <span onClick={() => navigate("/follow-up")}>{t("followUp.seeAll")}</span>
      </div>

      {loading && (
        <div className="empty-state" style={{ padding: "0.5rem 0" }}>
          {t("common.loading")}
        </div>
      )}

      {!loading && invoices.length === 0 && (
        <p style={{ textAlign: "center", padding: "16px", color: "#aaa", fontSize: "13px" }}>
          No pending invoices 
        </p>
      )}

      {/* ✅ Invoice list — no edit icon, click name to open popup */}
      {!loading && invoices.slice(0, 3).map((item) => (
        <div
          key={item.id}
          className="followup-item"
          onClick={() => handleOpenPopup(item)}
          style={{ cursor: "pointer" }}
        >
          <div
            className="followup-avatar"
            style={{ background: getAvatarColor(item.customer_name) }}
          >
            {String(item.customer_name || "?").charAt(0).toUpperCase()}
          </div>

          <div className="followup-info">
            <p className="followup-name">{item.customer_name}</p>
            <p className="followup-id">{item.invoice_number}</p>
          </div>

          <div className="followup-right">
            <p className="followup-amount">
              {item.currency} {parseFloat(item.grand_total || 0).toLocaleString()}
            </p>
            {/* ✅ Status badge */}
            <span style={{
              fontSize: "10px", fontWeight: 700, padding: "2px 7px",
              borderRadius: "20px", color: "#fff",
              background: STATUS_BADGE[item.status]?.color || "#aaa",
            }}>
              {STATUS_BADGE[item.status]?.label || item.status}
            </span>
            {/* ✅ Brief green check after save — no edit icon */}
            {savedId === item.id && (
              <FiCheck size={18} color="#38a169" />
            )}
          </div>
        </div>
      ))}

      {/* ✅ Popup */}
      {selectedItem && (
        <div className="phone-overlay" onClick={handleClosePopup}>
          <div className="phone-popup" onClick={(e) => e.stopPropagation()}>

            <button className="popup-close" onClick={handleClosePopup}>
              <FiX size={18} />
            </button>

            <div
              className="popup-avatar"
              style={{ background: getAvatarColor(selectedItem.customer_name) }}
            >
              {String(selectedItem.customer_name || "?").charAt(0).toUpperCase()}
            </div>

            <p className="popup-name">{selectedItem.customer_name}</p>
            <p className="popup-label">{selectedItem.invoice_number}</p>
            <p style={{ fontSize: "13px", color: "#667eea", fontWeight: 600, margin: "4px 0 6px" }}>
              {selectedItem.currency} {parseFloat(selectedItem.grand_total || 0).toLocaleString()}
            </p>

            {/* Current status badge */}
            <span style={{
              fontSize: "11px", fontWeight: 700, padding: "3px 10px",
              borderRadius: "20px", color: "#fff", marginBottom: "12px",
              display: "inline-block",
              background: STATUS_BADGE[selectedItem.status]?.color || "#aaa",
            }}>
              Current: {STATUS_BADGE[selectedItem.status]?.label || selectedItem.status}
            </span>

            {/* ✅ Note textarea with auto-save */}
            <div style={{ width: "100%", marginBottom: "12px", position: "relative" }}>
              <textarea
                placeholder="Add a follow-up note..."
                value={note}
                onChange={handleNoteChange}
                style={{
                  width: "100%", padding: "10px", borderRadius: "8px",
                  border: "1.5px solid #e0e0e0", fontSize: "13px",
                  minHeight: "70px", resize: "none", outline: "none",
                  boxSizing: "border-box", fontFamily: "inherit",
                }}
              />
              {/* ✅ Auto-save indicator */}
              {noteSaved && (
                <p style={{
                  fontSize: "11px", color: "#38a169",
                  margin: "3px 0 0", textAlign: "right"
                }}>
                  ✓ Note saved
                </p>
              )}
            </div>

            {/* ✅ Status buttons — 2 per row using grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px", width: "100%"
            }}>
              {STATUS_OPTIONS
                .filter((opt) => opt.value !== selectedItem.status)
                .map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleUpdateStatus(opt.value)}
                    disabled={saving}
                    style={{
                      padding: "11px 6px", borderRadius: "8px", border: "none",
                      background: opt.color, color: "#fff", fontWeight: 600,
                      fontSize: "13px", cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {opt.emoji} {saving ? "Saving..." : opt.label}
                  </button>
                ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default FollowUp;