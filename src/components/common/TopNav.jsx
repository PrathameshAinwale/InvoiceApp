import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TopNav.css";
import customers from "../../data/customer.json";
import products  from "../../data/products.json";

const TopNav = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch]         = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // search both customers and products
  const customerResults = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const productResults = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const hasResults = customerResults.length > 0 || productResults.length > 0;

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  const handleCustomerClick = (customer) => {
    setSearch("");
    setShowResults(false);
    navigate("/customers");
  };

  const handleProductClick = (product) => {
    setSearch("");
    setShowResults(false);
    navigate("/products");
  };

  return (
    <>
      <nav className="mobile-nav">

        {/* Logo */}
        <div className="nav-logo">
          <img
            src="https://placehold.co/40x40/667eea/ffffff?text=Logo"
            alt="logo"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Search */}
        <div className="nav-search" ref={searchRef}>
          <input
            type="text"
            placeholder="Search customers, products..."
            value={search}
            onChange={handleSearchChange}
            onFocus={() => search.length > 0 && setShowResults(true)}
          />
          <span className="search-icon">🔍</span>

          {/* Dropdown Results */}
          {showResults && (
            <div className="search-dropdown">
              {!hasResults ? (
                <p className="search-no-results">No results found</p>
              ) : (
                <>
                  {/* Customer Results */}
                  {customerResults.length > 0 && (
                    <div className="search-section">
                      <p className="search-section-title">Customers</p>
                      {customerResults.slice(0, 3).map((c) => (
                        <div
                          key={c.id}
                          className="search-item"
                          onClick={() => handleCustomerClick(c)}
                        >
                          <div
                            className="search-avatar"
                            style={{ background: c.avatarColor }}
                          >
                            {c.avatar}
                          </div>
                          <div className="search-item-info">
                            <p className="search-item-name">{c.name}</p>
                            <p className="search-item-sub">{c.email}</p>
                          </div>
                          <span className={`search-badge ${c.status}`}>
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Product Results */}
                  {productResults.length > 0 && (
                    <div className="search-section">
                      <p className="search-section-title">Products</p>
                      {productResults.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="search-item"
                          onClick={() => handleProductClick(p)}
                        >
                          <div
                            className="search-avatar search-avatar-square"
                            style={{ background: p.iconColor }}
                          >
                            {p.icon}
                          </div>
                          <div className="search-item-info">
                            <p className="search-item-name">{p.name}</p>
                            <p className="search-item-sub">{p.category}</p>
                          </div>
                          <p className="search-item-price">
                            ₹{p.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger-btn ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="hamburger-svg" viewBox="0 0 24 24" width="24" height="24">
            <path className="line line1"
              d="M3 6h18v2H3V6zM3 11h18v2H3v-2zM3 16h18v2H3v-2z"
              fill="currentColor" />
            <path className="line line2"
              d="M4.98 4.62L12 11.61l6.02-6.99L19 7l-7 8.1-7-8.1zM12 21.39l6.02-7L19 17l-7 8.1-7-8.1 1.02-1.18L12 21.4z"
              fill="currentColor" />
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-menu">
            <ul onClick={() => navigate("/products")}>Products</ul>
            <ul onClick={() => navigate("/customers")}>Customers</ul>
            <ul onClick={() => navigate("/follow-up")}>Follow Ups</ul>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNav;