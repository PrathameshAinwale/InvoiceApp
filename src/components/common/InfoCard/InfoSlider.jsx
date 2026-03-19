import React, { useState, useEffect } from 'react';
import './InfoSlider.css';

const slides = [
  { id: 1, type: 'upgrade' },
  { id: 2, type: 'refer' },
];

const InfoSlider = () => {
  const [current, setCurrent] = useState(0);
  const [copied, setCopied]   = useState(false);

  // auto slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("REFER2025");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="info-slider">

      {/* Slides */}
      <div
        className="info-slides"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >

        {/* Slide 1 — Upgrade */}
        <div className="info-slide upgrade-slide">
          <div className="info-left">
            <p className="info-main-text">Upgrade now<br />to get <span>50% off</span></p>
            <p className="info-sub-text">3 of 50 invoices generated</p>
          </div>
          <button className="upgrade-btn">Upgrade</button>
        </div>

        {/* Slide 2 — Refer & Earn */}
        <div className="info-slide refer-slide">
          <div className="info-left">
            <p className="info-main-text">Refer <span>&</span> Earn</p>
            <p className="info-sub-text">Share code to get 10 more invoices</p>
          </div>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default InfoSlider;