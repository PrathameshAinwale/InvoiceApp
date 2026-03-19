import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiPhone } from "react-icons/fi";
import customers from "../../data/customer.json";
import TopNav from "../../components/common/TopNav";
import "./Customer.css";

// ── Swipeable Card ─────────────────────────────────────────
const SwipeableCard = ({ customer, onDelete, onCall, onEdit }) => {
  const navigate    = useNavigate();
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
        <button onClick={() => { onEdit(customer); handleClose(); }}>
          <FiEdit2 size={18} />
          <span>Edit</span>
        </button>
      </div>

      {/* Delete — revealed on left swipe */}
      <div
        className="swipe-action swipe-delete"
        style={{ opacity: swipeX < 0 ? -swipeX / 80 : 0 }}
      >
        <button onClick={() => { onDelete(customer.id); handleClose(); }}>
          <FiTrash2 size={18} />
          <span>Delete</span>
        </button>
      </div>

      {/* Card */}
      <div
        className={`customer-card ${isSwiping ? "swiping" : ""}`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (swipeX !== 0) { setSwipeX(0); return; }
          navigate(`/customer/${customer.id}`);   // ← navigates to detail page
        }}
      >
        <div
          className="customer-avatar"
          style={{ background: customer.avatarColor }}
        >
          {customer.avatar}
        </div>

        <div className="customer-info">
          <p className="customer-name">{customer.name}</p>
          <p className="customer-email">{customer.email}</p>
          <div className="customer-meta">
            <span className="customer-invoices">
              {customer.totalInvoices} invoices
            </span>
            <span className={`customer-category ${customer.category.toLowerCase()}`}>
              {customer.category}
            </span>
          </div>
        </div>

        <div className="customer-right">
          <p className="customer-amount">
            ₹{customer.totalAmount.toLocaleString()}
          </p>
          <span className={`customer-status ${customer.status}`}>
            {customer.status}
          </span>
          <button
            className="call-action-btn"
            onClick={(e) => { e.stopPropagation(); onCall(customer); }}
          >
            <FiPhone size={13} />
          </button>
        </div>
      </div>

    </div>
  );
};

// ── Main Customers Page ────────────────────────────────────
const Customers = () => {
  const navigate = useNavigate();
  const [search, setSearch]               = useState("");
  const [filter, setFilter]               = useState("all");
  const [customerList, setCustomerList]   = useState(customers);
  const [selectedPhone, setSelectedPhone] = useState(null);

  const handleFilterClick = (value) => {
    setFilter((prev) => (prev === value ? "all" : value));
  };

  const filtered = customerList.filter((c) => {
    const matchesFilter = filter === "all" ? true : c.status === filter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase())    ||
      c.email.toLowerCase().includes(search.toLowerCase())   ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = (id) => {
    setCustomerList(customerList.filter((c) => c.id !== id));
  };

  const handleEdit = (customer) => navigate(`/editcustomer/${customer.id}`);

  return (
    <div className="customers-page page">
      <TopNav search={search} setSearch={setSearch} />

      {/* Header */}
      <div className="customers-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="customers-title">Customers</h2>
        <button className="add-customer-btn" onClick={() => navigate("/addcustomer")}>
          <FiPlus size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="customers-summary">
        <div
          className={`cust-summary-card total-card ${filter === "all" ? "card-active" : ""}`}
          onClick={() => handleFilterClick("all")}
        >
          <p className="cust-summary-label">Total</p>
          <p className="cust-summary-count">{customerList.length}</p>
        </div>
        <div
          className={`cust-summary-card paid-card ${filter === "paid" ? "card-active" : ""}`}
          onClick={() => handleFilterClick("paid")}
        >
          <p className="cust-summary-label">Paid</p>
          <p className="cust-summary-count">
            {customerList.filter((c) => c.status === "paid").length}
          </p>
        </div>
        <div
          className={`cust-summary-card pending-card ${filter === "pending" ? "card-active" : ""}`}
          onClick={() => handleFilterClick("pending")}
        >
          <p className="cust-summary-label">Pending</p>
          <p className="cust-summary-count">
            {customerList.filter((c) => c.status === "pending").length}
          </p>
        </div>
        <div
          className={`cust-summary-card overdue-card ${filter === "overdue" ? "card-active" : ""}`}
          onClick={() => handleFilterClick("overdue")}
        >
          <p className="cust-summary-label">Overdue</p>
          <p className="cust-summary-count">
            {customerList.filter((c) => c.status === "overdue").length}
          </p>
        </div>
      </div>

      {/* Customer List */}
      <div className="customers-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No customers found</p>
          </div>
        ) : (
          filtered.map((customer) => (
            <SwipeableCard
              key={customer.id}
              customer={customer}
              onDelete={handleDelete}
              onCall={setSelectedPhone}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Phone Popup */}
      {selectedPhone && (
        <div className="phone-overlay" onClick={() => setSelectedPhone(null)}>
          <div className="phone-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSelectedPhone(null)}>✕</button>
            <div className="popup-avatar" style={{ background: selectedPhone.avatarColor }}>
              {selectedPhone.avatar}
            </div>
            <p className="popup-name">{selectedPhone.name}</p>
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
  );
};

export default Customers;