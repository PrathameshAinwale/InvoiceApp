import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiShare2, FiDownload, FiEdit2 } from 'react-icons/fi';
import invoices from '../../data/invoice.json';
import './PreviewInvoice.css';

const InvoicePreview = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  // ← find invoice FIRST before any useState
  const invoice = invoices.find(i => i.id === id);

  // ← then useState using optional chaining to avoid crash
  const [status, setStatus] = useState(invoice?.status || 'pending');

  // ← early return AFTER hooks — hooks must always be called in same order
  if (!invoice) {
    return (
      <div className="ip-page page">
        <div className="ip-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>
          <h2 className="ip-title">Invoice Not Found</h2>
        </div>
      </div>
    );
  }

  const handleMarkAsPaid = () => {
    setStatus('paid');
    console.log('Marked as paid:', invoice.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Invoice ${invoice.id}`,
        text:  `Invoice from ${invoice.customerName} — $${invoice.amount.toLocaleString()}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="ip-page page">

      {/* Header */}
      <div className="ip-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="ip-title">Preview Invoice</h2>
        <button
          className="ip-edit-btn"
          onClick={() => navigate(`/editinvoice/${invoice.id}`)}
        >
          <FiEdit2 size={18} />
        </button>
      </div>

      {/* Invoice Card */}
      <div className="ip-card">

        {/* Invoice Top */}
        <div className="ip-top">
          <div>
            <p className="ip-invoice-id">{invoice.id}</p>
            <span className={`ip-badge ${status}`}>{status}</span>
          </div>
          <div className="ip-avatar" style={{ background: invoice.avatarColor }}>
            {invoice.avatar}
          </div>
        </div>

        <div className="ip-divider" />

        {/* From / To */}
        <div className="ip-parties">
          <div className="ip-party">
            <p className="ip-party-label">From</p>
            <p className="ip-party-name">Your Business</p>
            <p className="ip-party-sub">your@email.com</p>
          </div>
          <div className="ip-party ip-party-right">
            <p className="ip-party-label">To</p>
            <p className="ip-party-name">{invoice.customerName}</p>
            <p className="ip-party-sub">{invoice.email}</p>
          </div>
        </div>

        <div className="ip-divider" />

        {/* Dates */}
        <div className="ip-dates">
          <div className="ip-date-item">
            <p className="ip-date-label">Issue Date</p>
            <p className="ip-date-value">{invoice.date}</p>
          </div>
          <div className="ip-date-item">
            <p className="ip-date-label">Due Date</p>
            <p className="ip-date-value">{invoice.dueDate || 'N/A'}</p>
          </div>
        </div>

        <div className="ip-divider" />

        {/* Items Table */}
        <div className="ip-items">
          <p className="ip-items-heading">Items</p>

          <div className="ip-table-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
          </div>

          {invoice.products ? (
            invoice.products.map((p, i) => (
              <div key={i} className="ip-table-row">
                <span className="ip-item-name">{p.productName}</span>
                <span>{p.quantity}</span>
                <span>${parseFloat(p.price).toLocaleString()}</span>
                <span>${(p.quantity * p.price).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <div className="ip-table-row">
              <span className="ip-item-name">Services</span>
              <span>1</span>
              <span>${invoice.amount.toLocaleString()}</span>
              <span>${invoice.amount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="ip-divider" />

        {/* Totals */}
        <div className="ip-totals">
          <div className="ip-total-row">
            <span>Subtotal</span>
            <span>${invoice.amount.toLocaleString()}</span>
          </div>
          <div className="ip-total-row">
            <span>Tax (18%)</span>
            <span>${(invoice.amount * 0.18).toFixed(2)}</span>
          </div>
          <div className="ip-total-row ip-grand-total">
            <span>Total</span>
            <span>${(invoice.amount * 1.18).toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <>
            <div className="ip-divider" />
            <div className="ip-notes">
              <p className="ip-notes-label">Notes</p>
              <p className="ip-notes-text">{invoice.notes}</p>
            </div>
          </>
        )}

      </div>

      {/* Action Buttons */}
      <div className="ip-actions">
  {status !== 'paid' ? (
    /* 3 buttons side by side */
    <div className="ip-three-btns">
      <button className="ip-paid-btn" onClick={handleMarkAsPaid}>
        ✓ Paid
      </button>
      <button className="ip-share-btn" onClick={handleShare}>
        <FiShare2 size={18} />
        Share
      </button>
      <button className="ip-download-btn" onClick={handleDownload}>
        <FiDownload size={18} />
        Download
      </button>
    </div>
  ) : (
    /* 2 buttons side by side */
    <div className="ip-bottom-btns">
      <button className="ip-share-btn" onClick={handleShare}>
        <FiShare2 size={18} />
        Share Invoice
      </button>
      <button className="ip-download-btn" onClick={handleDownload}>
        <FiDownload size={18} />
        Download
      </button>
    </div>
  )}
</div>

    </div>
  );
};

export default InvoicePreview;