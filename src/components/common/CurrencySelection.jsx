import React, { useState, useEffect } from 'react';
import './CurrencySelect.css';

const CurrencySelect = ({ value, onChange }) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    fetch("https://api.frankfurter.dev/v1/currencies")
      .then(res => res.json())
      .then(data => {
        // data is { USD: "US Dollar", EUR: "Euro", ... }
        const list = Object.entries(data).map(([code, name]) => ({ code, name }));
        setCurrencies(list);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load currencies");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="currency-loading">Loading currencies...</p>;
  if (error)   return <p className="currency-error">{error}</p>;

  return (
    <div className="currency-select-wrapper">
      <label className="currency-label">Currency</label>
      <select
        className="currency-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select currency</option>
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