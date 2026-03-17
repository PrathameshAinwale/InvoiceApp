
import React from 'react';
import './MoneyCard.css';

const MoneyCard = ({ title, amount, type, trend }) => {
  return (
    <div className={`money-card ${type}`}>
      <div className="card-header">
        <h3>{title}</h3>
        <span className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      </div>
      <div className="card-amount">
        11,000
      </div>
    </div>
  );
};

export default MoneyCard;
