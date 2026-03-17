import React, { useState } from 'react';
import './Dashboard.css';
import MoneyCard from './common/MoneyCard';
import NavBottom from './NavBottom';


const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="dashboard">
      {/* Mobile Navbar */}
      <nav className="mobile-nav">
        {/* Logo - Left */}
        <div className="nav-logo">
          <img src="https://via.placeholder.com/40x40/667eea/ffffff?text=Logo" alt="logo" />
        </div>

        {/* Search - Center */}
        <div className="nav-search">
          <input 
            type="text" 
            placeholder="Search for customers, products..."
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* SVG Hamburger - Right */}
        <button 
          className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="hamburger-svg" viewBox="0 0 24 24" width="24" height="24">
            {/* Hamburger Lines (closed state) */}
            <path 
              className="line line1" 
              d="M3 6h18v2H3V6zM3 11h18v2H3v-2zM3 16h18v2H3v-2z" 
              fill="currentColor"
            />
            {/* Cross Lines (open state) */}
            <path 
              className="line line2" 
              d="M4.98 4.62L12 11.61l6.02-6.99L19 7l-7 8.1-7-8.1zM12 21.39l6.02-7L19 17l-7 8.1-7-8.1 1.02-1.18L12 21.4z" 
              fill="currentColor"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-menu">
            <ul>Products</ul>
            <ul>Customers</ul>
            <ul>Profile</ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="stats-grid">
          <MoneyCard 
            title="Incoming Money" 
            amount={125000} 
            type="incoming"
            trend={12.5}
          />
          <MoneyCard 
            title="Pending Money" 
            amount={45000} 
            type="pending"
            trend={-3.2}
          />
        </div>
      </main>

      <NavBottom />
    </div>
  );
};

export default Dashboard;
