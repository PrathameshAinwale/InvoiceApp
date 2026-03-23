import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiPhone } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import TopNav from "../../components/common/TopNav";
import API from "../../api/api"; // ✅ added
import "./Customers.css";

// ✅ Avatar colors
  const AVATAR_COLORS = ["#667eea", "#e53e3e", "#38a169", "#d69e2e", "#805ad5", "#dd6b20", "#3182ce", "#e91e8c"];
  const getAvatarColor = (seed) => {
    const str = String(seed || "");
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 100000;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  };

// ── Swipeable Card ─────────────────────────────────────────
const SwipeableCard = ({ customer, onDelete, onCall, onEdit }) => {
  const navigate = useNavigate();
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

      {/* Edit — right swipe */}
      <div
        className="swipe-action swipe-edit"
        style={{ opacity: swipeX > 0 ? swipeX / 80 : 0 }}
      >
        <button onClick={() => { onEdit(customer); handleClose(); }}>
          <FiEdit2 size={18} />
          <span>{t("customers.swipe.edit")}</span>
        </button>
      </div>

      {/* Delete — left swipe */}
      <div
        className="swipe-action swipe-delete"
        style={{ opacity: swipeX < 0 ? -swipeX / 80 : 0 }}
      >
        <button onClick={() => { onDelete(customer.id); handleClose(); }}>
          <FiTrash2 size={18} />
          <span>{t("customers.swipe.delete")}</span>
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
          navigate(`/customer/${customer.id}`);
        }}
      >
        {/* ✅ Avatar with auto color */}
        <div
          className="customer-avatar"
          style={{ background: getAvatarColor(customer.name) }}
        >
          {String(customer.name || "?").charAt(0).toUpperCase()}
        </div>

        <div className="customer-info">
          {/* ✅ Correct field names from DB */}
          <p className="customer-name">{customer.name}</p>
          <p className="customer-email">{customer.email || "—"}</p>
          <div className="customer-meta">
            {customer.country && (
              <span className="customer-invoices">{customer.country}</span>
            )}
            {customer.category && (
              <span className={`customer-category ${customer.category?.toLowerCase()}`}>
                {customer.category}
              </span>
            )}
          </div>
        </div>

        <div className="customer-right">
          {/* ✅ Phone number shown */}
          <p style={{ fontSize: "12px", color: "#667eea", fontWeight: 600 }}>
            {customer.phone}
          </p>
          {/* ✅ Call button */}
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
  const { t }    = useTranslation();

  const [search,        setSearch]        = useState("");
  const [filter,        setFilter]        = useState("all");
  const [customerList,  setCustomerList]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [selectedPhone, setSelectedPhone] = useState(null);

  // ✅ Fetch customers from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await API.get("/customers");
        setCustomerList(res.data.customers || []);
      } catch (err) {
        setError("Failed to load customers.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleFilterClick = (value) => {
    setFilter((prev) => (prev === value ? "all" : value));
  };

  // ✅ Filter by category or search
  const filtered = customerList.filter((c) => {
    const matchesFilter = filter === "all" ? true : c.category?.toLowerCase() === filter;
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase())    ||
      c.email?.toLowerCase().includes(search.toLowerCase())   ||
      c.phone?.toLowerCase().includes(search.toLowerCase())   ||
      c.country?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ✅ Delete calls backend
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await API.delete(`/customers/${id}`);
      setCustomerList((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete customer.");
    }
  };

  const handleEdit = (customer) => navigate(`/editcustomer/${customer.id}`);

  if (loading) return (
    <div className="customers-page page" style={{ textAlign: "center", padding: "60px 20px" }}>
      <p style={{ color: "#667eea", fontWeight: 600 }}>Loading customers...</p>
    </div>
  );

  if (error) return (
    <div className="customers-page page" style={{ textAlign: "center", padding: "60px 20px" }}>
      <p style={{ color: "red" }}>{error}</p>
    </div>
  );

  return (
    <div className="customers-page page">
      <TopNav search={search} setSearch={setSearch} />

      {/* Header */}
      <div className="customers-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="customers-title">{t("customers.title")}</h2>
        <button className="add-customer-btn" onClick={() => navigate("/addcustomer")}>
          <FiPlus size={20} />
        </button>
      </div>

      {/* ✅ Summary Cards — Total, Business, Individual */}
      <div className="customers-summary">
        <div
          className={`cust-summary-card total-card ${filter === "all" ? "card-active" : ""}`}
          onClick={() => handleFilterClick("all")}
        >
          <p className="cust-summary-label">{t("customers.summary.total")}</p>
          <p className="cust-summary-count">{customerList.length}</p>
        </div>
        <div
          className={`cust-summary-card paid-card ${filter === "business" ? "card-active" : ""}`}
          onClick={() => handleFilterClick("business")}
        >
          <p className="cust-summary-label">Business</p>
          <p className="cust-summary-count">
            {customerList.filter((c) => c.category?.toLowerCase() === "business").length}
          </p>
        </div>
        <div
          className={`cust-summary-card pending-card ${filter === "individual" ? "card-active" : ""}`}
          onClick={() => handleFilterClick("individual")}
        >
          <p className="cust-summary-label">Individual</p>
          <p className="cust-summary-count">
            {customerList.filter((c) => c.category?.toLowerCase() === "individual").length}
          </p>
        </div>
      </div>

      {/* Customer List */}
      <div className="customers-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{t("customers.noCustomers")}</p>
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

      {/* ✅ Phone Popup */}
      {selectedPhone && (
        <div className="phone-overlay" onClick={() => setSelectedPhone(null)}>
          <div className="phone-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSelectedPhone(null)}>✕</button>

            {/* ✅ Avatar with auto color */}
            <div
              className="popup-avatar"
              style={{ background: getAvatarColor(selectedPhone.name) }}
            >
              {String(selectedPhone.name || "?").charAt(0).toUpperCase()}
            </div>

            <p className="popup-name">{selectedPhone.name}</p>
            <p className="popup-label">{t("customers.contactNumber")}</p>
            <p className="popup-phone">{selectedPhone.phone}</p>

            {selectedPhone.phone ? (
              <a href={`tel:${selectedPhone.phone}`} className="popup-call-btn">
                <FiPhone size={16} />
                {t("customers.callNow")}
              </a>
            ) : (
              <p style={{ color: "#aaa", fontSize: "13px" }}>No phone number available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;