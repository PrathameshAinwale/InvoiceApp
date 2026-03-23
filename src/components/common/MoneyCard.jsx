import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './MoneyCard.css';

const MoneyCard = () => {
  const { t } = useTranslation();

  const cards = [
    { titleKey: 'moneyCard.received', amount: 125000, type: 'received', trend: 22.5  },
    { titleKey: 'moneyCard.pending',  amount: 45000,  type: 'pending',  trend: -3.2  },
    { titleKey: 'moneyCard.revenue',  amount: 320000, type: 'revenue',  trend: 12.8  },
    { titleKey: 'moneyCard.overdue',  amount: 18000,  type: 'overdue',  trend: -8.1  },
  ];

  const [current, setCurrent] = useState(0);
  const [next, setNext]       = useState(null);
  const [sliding, setSliding] = useState(false);

  const slideTo = (index) => {
    if (sliding || index === current) return;
    setNext(index);
    setSliding(true);
    setTimeout(() => {
      setCurrent(index);
      setNext(null);
      setSliding(false);
    }, 400);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      slideTo((current + 1) % cards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [current, sliding]);

  const card     = cards[current];
  const nextCard = next !== null ? cards[next] : null;

  return (
    <div className={`money-card-wrapper ${sliding && nextCard ? nextCard.type : card.type}`}>

      {/* Current card — slides out to left */}
      <div className={`money-card-inner ${sliding ? 'slide-out' : ''}`}>
        <div className="card-header">
          <h3>{t(card.titleKey)}</h3>
          <span className={`trend ${card.trend > 0 ? 'positive' : 'negative'}`}>
            {card.trend > 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
          </span>
        </div>
        <div className="card-amount">
          ₹{card.amount.toLocaleString()}
        </div>
      </div>

      {/* Next card — slides in from right */}
      {sliding && nextCard && (
        <div className="money-card-inner slide-in">
          <div className="card-header">
            <h3>{t(nextCard.titleKey)}</h3>
            <span className={`trend ${nextCard.trend > 0 ? 'positive' : 'negative'}`}>
              {nextCard.trend > 0 ? '↑' : '↓'} {Math.abs(nextCard.trend)}%
            </span>
          </div>
          <div className="card-amount">
            ₹{nextCard.amount.toLocaleString()}
          </div>
        </div>
      )}

    </div>
  );
};

export default MoneyCard;