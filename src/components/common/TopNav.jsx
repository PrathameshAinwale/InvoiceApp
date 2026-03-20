import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TopNav.css";
import customers from "../../data/customer.json";
import products from "../../data/products.json";
import { IoIosSearch } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const TopNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const { theme, setTheme } = useTheme();
  const [isClosing, setIsClosing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const themes = [
    { id: 'dark',  name: 'Dark',  },
    { id: 'light', name: 'Light',  },
  ];

  const customerResults = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const productResults = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const hasResults = customerResults.length > 0 || productResults.length > 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
        setIsSearchOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchOpen = () => setIsSearchOpen(true);
  const handleSearchClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsSearchOpen(false);
      setIsClosing(false);
      setSearch("");
      setShowResults(false);
    }, 300);
  };
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  const handleCustomerClick = () => {
    setSearch("");
    setShowResults(false);
    setIsSearchOpen(false);
    navigate("/customers");
  };
  
  const handleProductClick = () => {
    setSearch("");
    setShowResults(false);
    setIsSearchOpen(false);
    navigate("/products");
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="mobile-nav">
        {/* Username */}
        {!isSearchOpen && (
          <div className="nav-username">
            <p className="nav-greeting">Hello,</p>
            <p className="nav-name">Prathamesh</p>
          </div>
        )}

        {/* Spacer */}
        <div
          style={{ flex: isSearchOpen ? 0 : 1, transition: "flex 0.35s ease" }}
        />

        {/* Search */}
        <div
          className={`nav-search ${isSearchOpen ? "expanded" : ""} ${isClosing ? "closing" : ""}`}
          ref={searchRef}
        >
          {isSearchOpen ? (
            <>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search customers, products..."
                value={search}
                onChange={handleSearchChange}
              />
              <span className="search-close-icon" onClick={handleSearchClose}>
                <IoClose />
              </span>

              {showResults && (
                <div className="search-dropdown">
                  {!hasResults ? (
                    <p className="search-no-results">No results found</p>
                  ) : (
                    <>
                      {customerResults.length > 0 && (
                        <div className="search-section">
                          <p className="search-section-title">Customers</p>
                          {customerResults.slice(0, 3).map((c) => (
                            <div
                              key={c.id}
                              className="search-item"
                              onClick={handleCustomerClick}
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
                      {productResults.length > 0 && (
                        <div className="search-section">
                          <p className="search-section-title">Products</p>
                          {productResults.slice(0, 3).map((p) => (
                            <div
                              key={p.id}
                              className="search-item"
                              onClick={handleProductClick}
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
            </>
          ) : (
            <span className="search-open-icon" onClick={handleSearchOpen}>
              <IoIosSearch />
            </span>
          )}
        </div>

        {/* Logo/Menu Button */}
        <div
          className={`nav-logo-btn ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <img
            src="https://placehold.co/40x40/667eea/ffffff?text=Logo"
            alt="logo"
          />
        </div>
      </nav>

      {/* Mobile Menu Overlay WITH THEME SELECTOR INSIDE */}
      <div
        className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="mobile-menu">
          <ul onClick={() => navigate("/products")}>Products</ul>
          <ul onClick={() => navigate("/customers")}>Customers</ul>
          <ul onClick={() => navigate("/follow-up")}>Follow Up</ul>
          
          {/* Theme Selector Section */}
          <div className="theme-section">
            <p className="theme-section-title">Theme</p>
            {themes.map((t) => (
              <ul
                key={t.id}
                className={`theme-option ${theme === t.id ? 'active' : ''}`}
                onClick={() => {
                  setTheme(t.id);
                  setIsMenuOpen(false); // Close menu after selection
                }}
              >
                {t.icon} {t.name}
              </ul>
            ))}
          </div>
          
          <ul onClick={handleLogout} style={{color:"red"}}>Logout</ul>
        </div>
      </div>
    </>
  );
};

export default TopNav;
