import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import invoice from "../../data/invoice.json";
import "./Invoice.css";
import TopNav from "../../components/common/TopNav";

// ── Swipeable Card ─────────────────────────────────────────
const SwipeableCard = ({ item, onView, onEdit, onDelete }) => {  // ← added onView
  const [swipeX, setSwipeX]       = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(null);
  const cardRef     = useRef(null);
  const THRESHOLD   = 60;

  // ── Reset on outside click/touch ──────────────────────────
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
          <span>Edit</span>
        </button>
      </div>

      {/* Delete — revealed on left swipe */}
      <div
        className="swipe-action swipe-delete"
        style={{ opacity: swipeX < 0 ? -swipeX / 80 : 0 }}
      >
        <button onClick={() => { onDelete(item); handleClose(); }}>
          <FiTrash2 size={18} />
          <span>Delete</span>
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
          if (swipeX !== 0) { setSwipeX(0); return; }  // reset if swiped
          onView(item);                                 // navigate if not swiped
        }}
      >
        <div className="inv-avatar" style={{ background: item.avatarColor }}>
          {item.avatar}
        </div>

        <div className="inv-info">
          <p className="inv-name">{item.customerName}</p>
          <p className="inv-id">{item.id}</p>
          <p className="inv-date">{item.date}</p>
        </div>

        <div className="inv-right">
          <p className="inv-amount">${item.amount.toLocaleString()}</p>
          <span className={`inv-badge ${item.status}`}>{item.status}</span>
        </div>
      </div>

    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────
const Invoice = () => {
  const navigate = useNavigate();
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [invoices, setInvoices] = useState(invoice);

  const filtered = invoices.filter((item) => {
    const matchesFilter = filter === "all" ? true : item.status === filter;
    const matchesSearch =
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ── Handlers ───────────────────────────────────────────────
  const handleView   = (item) => navigate(`/invoice/${item.id}`);
  const handleEdit   = (item) => navigate(`/createinvoice?edit=${item.id}`);
  const handleDelete = (item) => setInvoices((prev) => prev.filter((i) => i.id !== item.id));

  return (
    <>
      <TopNav />
      <div className="invoice-page page">

        {/* Header */}
        <div className="invoice-page-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            <FiArrowLeft size={20} />
          </button>
          <h2 className="invoice-page-title">Invoices</h2>
          <button className="add-invoice-btn" onClick={() => navigate("/createinvoice")}>
            <FiPlus size={20} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="invoice-filters">
          {[
            { key: "all",     label: "All",     count: invoices.length,                                      color: "#667eea" },
            { key: "paid",    label: "Paid",    count: invoices.filter((i) => i.status === "paid").length,   color: "#2e7d32" },
            { key: "pending", label: "Pending", count: invoices.filter((i) => i.status === "pending").length,color: "#f57f17" },
            { key: "overdue", label: "Overdue", count: invoices.filter((i) => i.status === "overdue").length,color: "#c62828" },
            { key: "draft",   label: "Draft",   count: invoices.filter((i) => i.status === "draft").length,  color: "#1565c0" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`filter-tab ${filter === tab.key ? "active" : ""}`}
              style={filter === tab.key ? { background: tab.color, borderColor: tab.color } : {}}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span
                className="filter-count"
                style={{
                  background: filter === tab.key ? "rgba(255,255,255,0.25)" : tab.color + "20",
                  color: filter === tab.key ? "white" : tab.color,
                }}
              >
                {tab.count}
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
              <p>No invoices found</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default Invoice; 