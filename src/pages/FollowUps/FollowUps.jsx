import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPhone, FiX, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./FollowUps.css";
import TopNav from "../../components/common/TopNav";

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
  { value: "followup", label: "Mark as Follow Up", color: "#6a1b9a", emoji: "📌" },
];

const STATUS_BADGE = {
  paid:     { label: "Paid",      color: "#2e7d32" },
  unpaid:   { label: "Unpaid",    color: "#f57f17" },
  followup: { label: "Follow Up", color: "#6a1b9a" },
};

const FollowUps = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [invoices,        setInvoices]        = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [note,            setNote]            = useState("");
  const [saving,          setSaving]          = useState(false);
  const [noteSaved,       setNoteSaved]       = useState(false);
  const [savedId,         setSavedId]         = useState(null);
  const [phoneMap,        setPhoneMap]        = useState({});
  const [phoneLoading,    setPhoneLoading]    = useState({});
  const debounceRef = useRef(null);

  // ✅ Fetch unpaid + followup invoices
  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res      = await API.get("/invoices");
      const filtered = res.data.invoices.filter(
        (inv) => inv.status === "unpaid" || inv.status === "followup"
      );
      setInvoices(filtered);
    } catch (err) {
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // ✅ Fetch phone from customers table and dial
  const handleFetchPhone = async (e, inv) => {
    e.stopPropagation(); // don't open popup
    if (phoneMap[inv.id]) {
      window.location.href = `tel:${phoneMap[inv.id]}`;
      return;
    }
    setPhoneLoading((prev) => ({ ...prev, [inv.id]: true }));
    try {
      const res   = await API.get(`/customers/phone/${encodeURIComponent(inv.customer_name)}`);
      const phone = res.data.phone;
      if (phone) {
        setPhoneMap((prev) => ({ ...prev, [inv.id]: phone }));
        window.location.href = `tel:${phone}`;
      } else {
        alert(`No phone number found for ${inv.customer_name}`);
      }
    } catch (err) {
      alert("Failed to fetch phone number.");
    } finally {
      setPhoneLoading((prev) => ({ ...prev, [inv.id]: false }));
    }
  };

  // ✅ Open popup
  const openModal = (inv) => {
    setSelectedInvoice(inv);
    setNote(inv.followup_note || "");
    setNoteSaved(false);
    setError("");
  };

  const closeModal = () => {
    if (saving) return;
    setSelectedInvoice(null);
    setNote("");
    setNoteSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  // ✅ Auto-save note after 1 second of no typing
  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNote(val);
    setNoteSaved(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!selectedInvoice) return;
      try {
        const res  = await API.get(`/invoices/${selectedInvoice.id}`);
        const full = res.data.invoice;
        await API.put(`/invoices/${selectedInvoice.id}`, {
          customer_name:    full.customer_name,
          invoice_date:     full.invoice_date?.split("T")[0],
          currency:         full.currency,
          additional_notes: full.additional_notes,
          followup_note:    val,
          subtotal:         full.subtotal,
          total_discount:   full.total_discount,
          gst:              full.gst,
          grand_total:      full.grand_total,
          status:           full.status,
          items:            full.items,
        });
        setInvoices((prev) =>
          prev.map((i) =>
            i.id === selectedInvoice.id ? { ...i, followup_note: val } : i
          )
        );
        setNoteSaved(true);
      } catch (err) {
        console.error("Auto-save failed:", err.message);
      }
    }, 1000);
  };

  // ✅ Update status in DB
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedInvoice) return;
    setSaving(true);
    try {
      const res  = await API.get(`/invoices/${selectedInvoice.id}`);
      const full = res.data.invoice;

      await API.put(`/invoices/${selectedInvoice.id}`, {
        customer_name:    full.customer_name,
        invoice_date:     full.invoice_date?.split("T")[0],
        currency:         full.currency,
        additional_notes: full.additional_notes,
        followup_note:    note,
        subtotal:         full.subtotal,
        total_discount:   full.total_discount,
        gst:              full.gst,
        grand_total:      full.grand_total,
        status:           newStatus,
        items:            full.items,
      });

      if (newStatus === "paid") {
        setInvoices((prev) => prev.filter((i) => i.id !== selectedInvoice.id));
      } else {
        setInvoices((prev) =>
          prev.map((i) =>
            i.id === selectedInvoice.id
              ? { ...i, status: newStatus, followup_note: note }
              : i
          )
        );
      }

      setSavedId(selectedInvoice.id);
      setTimeout(() => setSavedId(null), 2000);
      closeModal();
    } catch (err) {
      setError("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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

        {error && (
          <p style={{ color: "red", textAlign: "center", padding: "12px" }}>{error}</p>
        )}

        {loading ? (
          <div className="empty-state" style={{ paddingTop: "1.25rem" }}>
            {t("common.loading")}
          </div>
        ) : (
          <div className="followups-list">

            {invoices.length === 0 && (
              <div className="empty-state">
                <p>{t("followUps.noUnpaid")}</p>
              </div>
            )}

            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="followup-card"
                onClick={() => openModal(inv)}
                style={{ cursor: "pointer" }}
              >
                {/* Avatar */}
                <div
                  className="followup-avatar"
                  style={{ background: getAvatarColor(inv.customer_name) }}
                >
                  {String(inv.customer_name || "?").charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="followup-info">
                  <p className="followup-name">{inv.customer_name}</p>
                  <p className="followup-invoice">{inv.invoice_number}</p>
                  {/* ✅ Dynamic status badge */}
                  <span
                    style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                      borderRadius: "20px", color: "#fff", display: "inline-block",
                      marginTop: "2px",
                      background: STATUS_BADGE[inv.status]?.color || "#aaa",
                    }}
                  >
                    {STATUS_BADGE[inv.status]?.label || inv.status}
                  </span>
                </div>

                {/* Amount + call */}
                <div className="followup-right">
                  <p className="followup-amount">
                    {inv.currency} {parseFloat(inv.grand_total || 0).toLocaleString()}
                  </p>

                  <div className="followup-actions" onClick={(e) => e.stopPropagation()}>
                    {/* ✅ Green check briefly after save */}
                    {savedId === inv.id ? (
                      <FiCheck size={18} color="#38a169" />
                    ) : (
                      // ✅ Call button — fetches phone from customers table
                      <button
                        className="call-btn"
                        type="button"
                        disabled={phoneLoading[inv.id]}
                        onClick={(e) => handleFetchPhone(e, inv)}
                        title="Call customer"
                      >
                        {phoneLoading[inv.id]
                          ? <span style={{ fontSize: "10px" }}>...</span>
                          : <FiPhone size={16} />
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* ✅ Status Update Popup */}
        {selectedInvoice && (
          <div className="phone-overlay" onClick={closeModal}>
            <div className="phone-popup" onClick={(e) => e.stopPropagation()}>

              <button className="popup-close" onClick={closeModal} disabled={saving}>
                <FiX size={18} />
              </button>

              <div
                className="popup-avatar"
                style={{ background: getAvatarColor(selectedInvoice.customer_name) }}
              >
                {String(selectedInvoice.customer_name || "?").charAt(0).toUpperCase()}
              </div>

              <p className="popup-name">{selectedInvoice.customer_name}</p>
              <p className="popup-label">{selectedInvoice.invoice_number}</p>
              <p style={{ fontSize: "13px", color: "#667eea", fontWeight: 600, margin: "4px 0 6px" }}>
                {selectedInvoice.currency} {parseFloat(selectedInvoice.grand_total || 0).toLocaleString()}
              </p>

              {/* Current status badge */}
              <span style={{
                fontSize: "11px", fontWeight: 700, padding: "3px 10px",
                borderRadius: "20px", color: "#fff",
                marginBottom: "12px", display: "inline-block",
                background: STATUS_BADGE[selectedInvoice.status]?.color || "#aaa",
              }}>
                Current: {STATUS_BADGE[selectedInvoice.status]?.label || selectedInvoice.status}
              </span>

              {/* ✅ Note with auto-save */}
              <div style={{ width: "100%", marginBottom: "12px" }}>
                <textarea
                  className="followup-note-textarea"
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="Add a follow-up note..."
                  disabled={saving}
                />
                {noteSaved && (
                  <p style={{ fontSize: "11px", color: "#38a169", margin: "3px 0 0", textAlign: "right" }}>
                    ✓ Note saved
                  </p>
                )}
              </div>

              {/* ✅ Status buttons — 2 per row, skip current status */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px", width: "100%",
              }}>
                {STATUS_OPTIONS
                  .filter((opt) => opt.value !== selectedInvoice.status)
                  .map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleUpdateStatus(opt.value)}
                      disabled={saving}
                      type="button"
                      style={{
                        padding: "11px 6px", borderRadius: "8px",
                        border: "none", background: opt.color,
                        color: "#fff", fontWeight: 600, fontSize: "13px",
                        cursor: saving ? "not-allowed" : "pointer",
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
    </>
  );
};

export default FollowUps;