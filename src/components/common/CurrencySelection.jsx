import React, { useState, useEffect } from 'react';
import './CurrencySelect.css';
import { useTranslation } from 'react-i18next';

const CurrencySelect = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    fetch("https://api.frankfurter.dev/v1/currencies")
      .then(res => res.json())
      .then(data => {
        const list = Object.entries(data).map(([code, name]) => ({ code, name }));
        setCurrencies(list);
        setLoading(false);
      })
      .catch(() => {
        setError(t("currencySelect.error"));
        setLoading(false);
      });
  }, [t]);

  if (loading) return <p className="currency-loading">{t("currencySelect.loading")}</p>;
  if (error)   return <p className="currency-error">{error}</p>;

  return (
    <div className="currency-select-wrapper">
      <label className="currency-label">{t("currencySelect.label")}</label>
      <select
        className="currency-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t("currencySelect.placeholder")}</option>
        {currencies.map(({ code, name }) => (
          <option key={code} value={code}>
            {code} — {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelect;