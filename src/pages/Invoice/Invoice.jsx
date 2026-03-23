import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./Invoice.css";
import TopNav from "../../components/common/TopNav";
import API from "../../api/api";
import { FaUserLarge } from "react-icons/fa6";


// ── Swipeable Card ─────────────────────────────────────────
const SwipeableCard = ({ item, onView, onEdit, onDelete }) => {
  const { t }    = useTranslation();
  const [swipeX, setSwipeX]       = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(null);
  const cardRef     = useRef(null);
  const THRESHOLD   = 60;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setSwipeX(0);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setSwipeX(Math.max(-80, Math.min(80, diff)));
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    touchStartX.current = null;
    if (swipeX > THRESHOLD)       setSwipeX(80);
    else if (swipeX < -THRESHOLD) setSwipeX(-80);
    else                          setSwipeX(0);
  };

  const handleClose = () => setSwipeX(0);

  return (
    <div className="swipe-wrapper" ref={cardRef}>

      {/* Edit — revealed on right swipe */}
      <div
        className="swipe-action swipe-edit"
        style={{ opacity: swipeX > 0 ? swipeX / 80 : 0 }}
      >
        <button onClick={() => { onEdit(item); handleClose(); }}>
          <FiEdit2 size={18} />
          <span>{t("invoice.swipe.edit")}</span>
        </button>
      </div>

      {/* Delete — revealed on left swipe */}
      <div
        className="swipe-action swipe-delete"
        style={{ opacity: swipeX < 0 ? -swipeX / 80 : 0 }}
      >
        <button onClick={() => { onDelete(item); handleClose(); }}>
          <FiTrash2 size={18} />
          <span>{t("invoice.swipe.delete")}</span>
        </button>
      </div>

      {/* Card */}
      <div
        className={`invoice-card ${isSwiping ? "swiping" : ""}`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (swipeX !== 0) { setSwipeX(0); return; }
          onView(item);
        }}
      >
        {/* ✅ Avatar with auto color */}
        <div
          className="inv-avatar"
        >
          <FaUserLarge size={20} />
        </div>

        <div className="inv-info">
          <p className="inv-name">{item.customer_name}</p>
          <p className="inv-id">{item.invoice_number}</p>
          <p className="inv-date">{new Date(item.invoice_date).toLocaleDateString()}</p>
        </div>

        <div className="inv-right">
          <p className="inv-amount">
            {item.currency} {parseFloat(item.grand_total).toLocaleString()}
          </p>
          <span className={`inv-badge ${item.status}`}>
            {t(`invoice.status.${item.status}`)}
          </span>
        </div>
      </div>

    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────
const Invoice = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await API.get('/invoices');
        setInvoices(res.data.invoices);
      } catch (err) {
        setError('Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filtered = invoices.filter((item) => {
    const matchesFilter = filter === "all" ? true : item.status === filter;
    const matchesSearch =
      item.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.invoice_number?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleView   = (item) => navigate(`/invoice/${item.id}`);
  const handleEdit   = (item) => navigate(`/editinvoice/${item.id}`);
  const handleDelete = async (item) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await API.delete(`/invoices/${item.id}`);
      setInvoices((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      alert('Failed to delete invoice.');
    }
  };

  // ✅ Updated tabs — replaced "overdue" & "draft" with "followup"
  const tabs = [
    { key: "all",      color: "#667eea" },
    { key: "paid",     color: "#2e7d32" },
    { key: "unpaid",   color: "#f57f17" },
    { key: "followup", color: "#6a1b9a" }, // ✅ new
  ];

  if (loading) return <p style={{ textAlign: "center", padding: "40px" }}>Loading invoices...</p>;
  if (error)   return <p style={{ textAlign: "center", padding: "40px", color: "red" }}>{error}</p>;

  return (
    <>
      <TopNav />
      <div className="invoice-page page">

        {/* Header */}
        <div className="invoice-page-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            <FiArrowLeft size={20} />
          </button>
          <h2 className="invoice-page-title">{t("invoice.title")}</h2>
          <button className="add-invoice-btn" onClick={() => navigate("/createinvoice")}>
            <FiPlus size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "0 16px 12px" }}>
          <input
            type="text"
            placeholder="Search by customer or invoice no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: "10px",
              border: "1.5px solid #e0e0e0", fontSize: "14px", "margin-top":"16px",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="invoice-filters">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`filter-tab ${filter === tab.key ? "active" : ""}`}
              style={filter === tab.key ? { background: tab.color, borderColor: tab.color } : {}}
              onClick={() => setFilter(tab.key)}
            >
              {t(`invoice.filters.${tab.key}`)}
              <span
                className="filter-count"
                style={{
                  background: filter === tab.key ? "rgba(255,255,255,0.25)" : tab.color + "20",
                  color: filter === tab.key ? "white" : tab.color,
                }}
              >
                {tab.key === "all"
                  ? invoices.length
                  : invoices.filter((i) => i.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Invoice List */}
        <div className="invoice-list">
          {filtered.map((item) => (
            <SwipeableCard
              key={item.id}
              item={item}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <p>{t("invoice.noInvoices")}</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default Invoice;