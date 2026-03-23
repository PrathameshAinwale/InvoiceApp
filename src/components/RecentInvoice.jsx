import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentInvoice.css';
import { useTranslation } from 'react-i18next';

const invoices = [
  { id: "INV-2024-079", name: "Shopify Inc.",   amount: 2240, date: "11:45 AM", avatar: "SI" },
  { id: "INV-2024-078", name: "Sarah Johnson",  amount: 780,  date: "1:15 PM",  avatar: "SJ" },
  { id: "INV-2024-077", name: "David Miller",   amount: 698,  date: "Jan 16",   avatar: "DM" },
];

const RecentInvoice = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="recent-invoice">

      <div className="recent-invoice-header">
        <h5>{t('recentInvoice.title')}</h5>
        <span onClick={() => navigate("/invoice")}>{t('recentInvoice.seeAll')}</span>
      </div>

      {invoices.map((invoice) => (
        <div key={invoice.id} className="invoice-item">

          <div className="invoice-avatar">{invoice.avatar}</div>

          <div className="invoice-info">
            <p className="invoice-name">{invoice.name}</p>
            <p className="invoice-id">{invoice.id}</p>
          </div>

          <div className="invoice-right">
            <p className="invoice-amount">${invoice.amount.toLocaleString()}</p>
            <p className="invoice-date">{invoice.date}</p>
          </div>

        </div>
      ))}

    </div>
  );
};

export default RecentInvoice;