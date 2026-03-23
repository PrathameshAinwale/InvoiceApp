import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import './InfoSlider.css';

const slides = [
  { id: 1, type: 'upgrade' },
  { id: 2, type: 'refer' },
];

const InfoSlider = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [copied, setCopied]   = useState(false);

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
      <div
        className="info-slides"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >

        {/* Slide 1 — Upgrade */}
        <div className="info-slide upgrade-slide">
          <div className="info-left">
            <p className="info-main-text">
              {t("infoSlider.upgrade.title")}<br />
              {t("infoSlider.upgrade.discount")} <span>{t("infoSlider.upgrade.highlight")}</span>
            </p>
            <p className="info-sub-text">{t("infoSlider.upgrade.invoiceCount")}</p>
          </div>
          <button className="upgrade-btn">{t("infoSlider.upgrade.btn")}</button>
        </div>

        {/* Slide 2 — Refer & Earn */}
        <div className="info-slide refer-slide">
          <div className="info-left">
            <p className="info-main-text">
              {t("infoSlider.refer.title")} <span>{t("infoSlider.refer.and")}</span> {t("infoSlider.refer.earn")}
            </p>
            <p className="info-sub-text">{t("infoSlider.refer.sub")}</p>
          </div>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? t("infoSlider.refer.copied") : t("infoSlider.refer.copy")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default InfoSlider;