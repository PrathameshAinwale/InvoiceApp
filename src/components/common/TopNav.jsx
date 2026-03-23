import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TopNav.css";
import { IoIosSearch } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import API from "../../api/api";

const AVATAR_COLORS = ["#667eea", "#e53e3e", "#38a169", "#d69e2e", "#805ad5", "#dd6b20", "#3182ce", "#e91e8c"];
const getAvatarColor = (seed) => {
  const str = String(seed || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const TopNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const [isClosing,     setIsClosing]     = useState(false);
  const [isMenuOpen,    setIsMenuOpen]    = useState(false);
  const [isSearchOpen,  setIsSearchOpen]  = useState(false);
  const [search,        setSearch]        = useState("");
  const [showResults,   setShowResults]   = useState(false);
  const [profile,       setProfile]       = useState(null);
  const [customers,     setCustomers]     = useState([]);
  const searchRef = useRef(null);
  const inputRef  = useRef(null);

  const languages = [
    { code: "en", label: "EN" },
    { code: "hi", label: "हिं" },
    { code: "mr", label: "मर" },
  ];

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/profile');
        if (res.data?.profile) setProfile(res.data.profile);
      } catch (err) {
        console.error('Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  // ✅ Fetch customers for search
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await API.get('/customers');
        setCustomers(res.data.customers || []);
      } catch (err) {
        console.error('Failed to fetch customers');
      }
    };
    fetchCustomers();
  }, []);

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
  };

  const customerResults = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const hasResults = customerResults.length > 0;

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
    if (isSearchOpen && inputRef.current) inputRef.current.focus();
  }, [isSearchOpen]);

  const handleSearchOpen  = () => setIsSearchOpen(true);
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

  const handleCustomerClick = (customer) => {
    setSearch("");
    setShowResults(false);
    setIsSearchOpen(false);
    navigate(`/customer/${customer.id}`);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const displayName = profile?.name || user?.name || "User";

  return (
    <>
      <nav className="mobile-nav">

        {/* Greeting */}
        {!isSearchOpen && (
          <div className="nav-username">
            <p className="nav-greeting">{t("nav.greeting")},</p>
            <p className="nav-name">{displayName}</p>
          </div>
        )}

        <div style={{ flex: isSearchOpen ? 0 : 1, transition: "flex 0.35s ease" }} />

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
                placeholder={t("common.search")}
                value={search}
                onChange={handleSearchChange}
              />
              <span className="search-close-icon" onClick={handleSearchClose}>
                <IoClose />
              </span>

              {showResults && (
                <div className="search-dropdown">
                  {!hasResults ? (
                    <p className="search-no-results">{t("common.noData")}</p>
                  ) : (
                    <div className="search-section">
                      <p className="search-section-title">{t("nav.customers")}</p>
                      {customerResults.slice(0, 3).map((c) => (
                        <div
                          key={c.id}
                          className="search-item"
                          onClick={() => handleCustomerClick(c)}
                        >
                          <div
                            className="search-avatar"
                            style={{ background: getAvatarColor(c.name) }}
                          >
                            {String(c.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="search-item-info">
                            <p className="search-item-name">{c.name}</p>
                            <p className="search-item-sub">{c.email || c.phone}</p>
                          </div>
                          {c.category && (
                            <span className="search-badge">{c.category}</span>
                          )}
                        </div>
                      ))}
                    </div>
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

        {/* ✅ Profile Avatar Button */}
        <div
          className={`nav-logo-btn ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt="profile"
              style={{
                width: '100%', height: '100%',
                borderRadius: '50%', objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              borderRadius: '50%',
              background: getAvatarColor(displayName),
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              color: '#fff', fontWeight: 700,
              fontSize: '16px',
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>

          {/* Theme + Language */}
          <div className="menu-top-row">
            <button
              className={`theme-toggle-btn ${theme === "dark" ? "dark" : "light"}`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <span className="theme-toggle-thumb">
                {theme === "dark" ? (
                  <MdDarkMode size={12} color="#667eea" />
                ) : (
                  <MdLightMode size={12} color="#f59e0b" />
                )}
              </span>
            </button>

            <div className="language-toggle-row">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`lang-btn ${i18n.language === lang.code ? "active" : ""}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <ul onClick={() => { navigate("/products"); setIsMenuOpen(false); }}>
            {t("nav.products")}
          </ul>
          <ul onClick={() => { navigate("/customers"); setIsMenuOpen(false); }}>
            {t("nav.customers")}
          </ul>
          <ul onClick={() => { navigate("/follow-up"); setIsMenuOpen(false); }}>
            {t("nav.followUp")}
          </ul>
          <ul onClick={handleLogout} style={{ color: "red" }}>
            {t("nav.logout")}
          </ul>

        </div>
      </div>
    </>
  );
};

export default TopNav;