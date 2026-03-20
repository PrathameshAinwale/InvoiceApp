import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiShare2, FiDownload, FiEdit2 } from 'react-icons/fi';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import invoices from '../../data/invoice.json';
import './PreviewInvoice.css';
import { numberToWords } from '../../utils/numberToWords';

// ─── DEFAULT TERMS & CONDITIONS ───────────────────────────────────────────────
const TERMS_AND_CONDITIONS = [
  '1. Payment is due within 30 days of the invoice date unless otherwise agreed in writing.',
  '2. Late payments will incur a penalty of 1.5% per month on the outstanding balance.',
  '3. All goods remain the property of the seller until full payment is received.',
  '4. Disputes must be raised within 7 days of receiving the invoice.',
  '5. This invoice is subject to the laws of the jurisdiction of the seller.',
  '6. Any modifications to the agreed services must be confirmed in writing.',
];

const InvoicePreview = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const invoice = invoices.find(i => i.id === id);

  const [status,      setStatus]      = useState(invoice?.status || 'pending');
  const [downloading, setDownloading] = useState(false);
  const [sharing,     setSharing]     = useState(false);

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

  // ─── PDF GENERATOR ────────────────────────────────────────────────────────
  const generatePDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W           = doc.internal.pageSize.getWidth();
    const pageH       = doc.internal.pageSize.getHeight();
    const margin      = 15;
    const contentW    = W - margin * 2;
    const FOOTER_H    = 18;
    const SAFE_BOTTOM = pageH - FOOTER_H - 8;

// ✅ FIXED — calculates from products if they exist
const subtotal = invoice.products && invoice.products.length > 0
  ? invoice.products.reduce((sum, p) => sum + (p.quantity * parseFloat(p.price)), 0)
  : (invoice.amount || 0);

const tax   = subtotal * 0.18;
const total = subtotal + tax;

    // ── helpers — MUST be defined before use ─────────────────────────────────
    const hex    = (color) => doc.setTextColor(color);
    const fsize  = (n)     => doc.setFontSize(n);
    const bold   = ()      => doc.setFont('helvetica', 'bold');
    const normal = ()      => doc.setFont('helvetica', 'normal');

    const drawLine = (y, color = '#E5E7EB') => {
      doc.setDrawColor(color);
      doc.setLineWidth(0.3);
      doc.line(margin, y, W - margin, y);
    };

    const drawFooter = () => {
      doc.setFillColor('#1A1A2E');
      doc.rect(0, pageH - FOOTER_H, W, FOOTER_H, 'F');
      fsize(7); normal(); doc.setTextColor('#A0AEC0');
      doc.text('Thank you for your business!',                    W / 2, pageH - 10, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, W / 2, pageH - 5,  { align: 'center' });
    };

    const addPage = () => {
      drawFooter();
      doc.addPage();
      doc.setFillColor('#1A1A2E');
      doc.rect(0, 0, W, 14, 'F');
      fsize(8); bold(); doc.setTextColor('#A0AEC0');
      doc.text(`Invoice # ${invoice.id}  —  continued`, margin, 9);
      return 20;
    };

    const ensure = (y, needed) => y + needed > SAFE_BOTTOM ? addPage() : y;

    // ── HEADER ────────────────────────────────────────────────────────────────
    doc.setFillColor('#1A1A2E');
    doc.rect(0, 0, W, 38, 'F');

    bold(); fsize(22); doc.setTextColor('#FFFFFF');
    doc.text('INVOICE', margin, 18);
    normal(); fsize(9); doc.setTextColor('#A0AEC0');
    doc.text('Professional Invoice Document', margin, 25);

 doc.setFillColor('#2D2D4E');
doc.roundedRect(W - margin - 42, 8, 42, 10, 2, 2, 'F');
fsize(8); bold(); doc.setTextColor('#818CF8');  // ← must set color HERE
doc.text(`# ${invoice.id}`, W - margin - 21, 14.5, { align: 'center' });

// ── Status badge ──
const badgeColor =
  status === 'paid'    ? '#10B981' :
  status === 'overdue' ? '#EF4444' : '#F59E0B';
doc.setFillColor(badgeColor);
doc.roundedRect(W - margin - 42, 22, 42, 10, 2, 2, 'F');
fsize(8); bold(); doc.setTextColor('#FFFFFF');  // ← status uses white
doc.text(status.toUpperCase(), W - margin - 21, 27.5, { align: 'center' });

    // ── FROM / TO ─────────────────────────────────────────────────────────────
    let y = 50;

    doc.setFillColor('#F9FAFB');
    doc.roundedRect(margin, y, contentW / 2 - 4, 30, 3, 3, 'F');
    fsize(7); normal(); hex('#6B7280');
    doc.text('FROM', margin + 5, y + 7);
    fsize(10); bold(); hex('#111827');
    doc.text('Your Business', margin + 5, y + 14);
    fsize(8); normal(); hex('#6B7280');
    doc.text('your@email.com', margin + 5, y + 20);
    doc.text('www.yourbusiness.com', margin + 5, y + 26);

    const toX = margin + contentW / 2 + 4;
    doc.setFillColor('#F9FAFB');
    doc.roundedRect(toX, y, contentW / 2 - 4, 30, 3, 3, 'F');
    fsize(7); normal(); hex('#6B7280');
    doc.text('BILL TO', toX + 5, y + 7);
    fsize(10); bold(); hex('#111827');
    doc.text(invoice.customerName || 'Client Name', toX + 5, y + 14);
    fsize(8); normal(); hex('#6B7280');
    doc.text(invoice.email || 'client@email.com', toX + 5, y + 20);

    // ── DATES ─────────────────────────────────────────────────────────────────
    y += 38;
    y = ensure(y, 22);
    drawLine(y); y += 6;

    fsize(8); normal(); hex('#6B7280');
    doc.text('ISSUE DATE',     margin,                       y + 4);
    doc.text('DUE DATE',       margin + contentW / 3,        y + 4);
    doc.text('PAYMENT METHOD', margin + (contentW / 3) * 2,  y + 4);
    fsize(9); bold(); hex('#111827');
    doc.text(invoice.date    || 'N/A', margin,                       y + 11);
    doc.text(invoice.dueDate || 'N/A', margin + contentW / 3,        y + 11);
    doc.text('Bank Transfer',          margin + (contentW / 3) * 2,  y + 11);

    // ── SHIPPING DETAILS ──────────────────────────────────────────────────────
    y += 22;
    y = ensure(y, 70);
    drawLine(y); y += 6;

    fsize(9); bold(); hex('#1A1A2E');
    doc.text('SHIPPING DETAILS', margin, y + 5);
    y += 12;

    doc.setFillColor('#F0F4FF');
    doc.setDrawColor('#C7D2FE');
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentW, 48, 3, 3, 'FD');

    const col1 = margin + 5;
    const col2 = margin + contentW / 2 + 5;

    fsize(7); normal(); hex('#6B7280');
    doc.text('RECIPIENT NAME',   col1, y + 7);
    doc.text('PHONE NUMBER',     col1, y + 19);
    doc.text('SHIPPING ADDRESS', col2, y + 7);
    doc.text('CITY / STATE',     col2, y + 19);
    doc.text('COUNTRY / ZIP',    col2, y + 31);

    fsize(9); bold(); hex('#111827');
    doc.text(invoice.shipping?.recipientName || invoice.customerName || 'N/A', col1, y + 13);
    doc.text(invoice.shipping?.phone         || invoice.phone        || 'N/A', col1, y + 25);
    doc.text(invoice.shipping?.address       || 'N/A',                         col2, y + 13);
    doc.text(invoice.shipping?.city          || 'N/A',                         col2, y + 25);
    doc.text(invoice.shipping?.country       || 'N/A',                         col2, y + 37);

    const shipStatus = invoice.shipping?.status || 'Pending';
    const shipColor  = shipStatus === 'Delivered' ? '#10B981'
                     : shipStatus === 'Shipped'   ? '#3B82F6' : '#F59E0B';
    doc.setFillColor(shipColor);
    doc.roundedRect(W - margin - 30, y + 4, 28, 8, 2, 2, 'F');
fsize(7); bold(); doc.setTextColor('#FFFFFF');
doc.text(shipStatus.toUpperCase(), W - margin - 16, y + 9, { align: 'center' });  

    fsize(7); normal(); hex('#6B7280');
    doc.text('DELIVERY METHOD', col1, y + 31);
    fsize(9); bold(); hex('#111827');
    doc.text(invoice.shipping?.method || 'Standard Delivery', col1, y + 37);

    // ── ITEMS TABLE ───────────────────────────────────────────────────────────
    y += 48;
    y = ensure(y, 24);
    drawLine(y); y += 6;

    const products = invoice.products || [
      { productName: 'Services', quantity: 1, price: invoice.amount }
    ];

    const drawTableHeader = (startY) => {
      doc.setFillColor('#1A1A2E');
      doc.rect(margin, startY, contentW, 9, 'F');
      fsize(8); bold(); doc.setTextColor('#FFFFFF');
      doc.text('ITEM DESCRIPTION',  margin + 3,               startY + 6);
      doc.text('QTY',               margin + contentW * 0.6,  startY + 6, { align: 'center' });
      doc.text('UNIT PRICE',        margin + contentW * 0.75, startY + 6, { align: 'center' });
      doc.text('TOTAL',             margin + contentW - 3,    startY + 6, { align: 'right'  });
      return startY + 9;
    };

    y = drawTableHeader(y);

    products.forEach((p, idx) => {
      if (y + 10 > SAFE_BOTTOM) {
        y = addPage();
        fsize(9); bold(); hex('#1A1A2E');
        doc.text('ITEMS (continued)', margin, y);
        y += 6;
        y = drawTableHeader(y);
      }

      doc.setFillColor(idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB');
      doc.rect(margin, y, contentW, 10, 'F');
      fsize(8); normal(); hex('#111827');
      doc.text(p.productName,                                 margin + 3,               y + 6.5);
      doc.text(String(p.quantity),                            margin + contentW * 0.6,  y + 6.5, { align: 'center' });
      doc.text(`$${parseFloat(p.price).toLocaleString()}`,    margin + contentW * 0.75, y + 6.5, { align: 'center' });
      doc.text(`$${(p.quantity * p.price).toLocaleString()}`, margin + contentW - 3,    y + 6.5, { align: 'right'  });
      y += 10;
    });

    y += 4;
    drawLine(y);

    // ── TOTALS ────────────────────────────────────────────────────────────────
    y += 6;
    y = ensure(y, 44); // enough for totals + amount in words

    const totalsX = margin + contentW * 0.6;
    fsize(8); normal(); hex('#6B7280');
    doc.text('Subtotal',  totalsX, y);
    doc.text(`$${subtotal.toLocaleString()}`, margin + contentW - 3, y, { align: 'right' });
    y += 7;
    doc.text('Tax (18%)', totalsX, y);
    doc.text(`$${tax.toFixed(2)}`, margin + contentW - 3, y, { align: 'right' });
    y += 4;
    drawLine(y);
    y += 5;

    // Grand total box
    doc.setFillColor('#1A1A2E');
doc.roundedRect(totalsX - 2, y - 1, contentW * 0.4 + 2, 11, 2, 2, 'F');
fsize(10); bold(); doc.setTextColor('#FFFFFF');
doc.text('TOTAL DUE',            totalsX + 2,           y + 6);
doc.text(`$${total.toFixed(2)}`, margin + contentW - 3, y + 6, { align: 'right' });
y += 15;

    // ── AMOUNT IN WORDS ← correct position: after grand total ────────────────
   // ✅ safe guard — only show if total is a valid number
if (total && !isNaN(total) && total > 0) {
  y = ensure(y, 14);
  doc.setFillColor('#F0FDF4');
  doc.setDrawColor('#BBF7D0');
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 14, 2, 2, 'FD');
fsize(7.5); normal(); hex('#166534');
doc.text('Amount in Words:', margin + 4, y + 6);
fsize(9); bold(); hex('#14532D');
doc.text(numberToWords(total), W / 2, y + 10, { align: 'center' });
y += 18;
}

    // ── NOTES ─────────────────────────────────────────────────────────────────
    if (invoice.notes) {
      y = ensure(y, 28);
      drawLine(y); y += 6;
      doc.setFillColor('#FFFBEB');
      doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
      fsize(7); bold(); hex('#92400E');
      doc.text('NOTES', margin + 4, y + 6);
      fsize(8); normal(); hex('#78350F');
      doc.text(doc.splitTextToSize(invoice.notes, contentW - 8), margin + 4, y + 12);
      y += 18;
    }

    // ── TERMS & CONDITIONS + QR CODE ──────────────────────────────────────────
    const termsLines    = invoice.termsAndConditions || TERMS_AND_CONDITIONS;
    const termsBoxH     = termsLines.length * 7 + 10;
    const qrSize        = 44;
    const termsW        = contentW - qrSize - 6;
    const totalSectionH = 16 + termsBoxH + 14;

    y = ensure(y, totalSectionH + 10);

    y += 10;
    drawLine(y, '#CBD5E1'); y += 6;

    doc.setFillColor('#1E293B');
doc.roundedRect(margin, y, 52, 8, 2, 2, 'F');
fsize(8); bold(); doc.setTextColor('#FFFFFF');
doc.text('TERMS & CONDITIONS', margin + 26, y + 5.5, { align: 'center' });
    y += 12;

    // Terms box
    doc.setFillColor('#F8FAFC');
    doc.setDrawColor('#E2E8F0');
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, termsW, termsBoxH, 3, 3, 'FD');
    fsize(7.5); normal(); hex('#374151');
    termsLines.forEach((term, idx) => {
      const wrapped = doc.splitTextToSize(term, termsW - 8);
      doc.text(wrapped, margin + 5, y + 6 + idx * 7);
    });

    // QR box
    const qrX = margin + termsW + 6;
    doc.setFillColor('#F0F4FF');
    doc.setDrawColor('#C7D2FE');
    doc.setLineWidth(0.4);
    doc.roundedRect(qrX, y, qrSize, termsBoxH, 3, 3, 'FD');
    fsize(6); bold(); hex('#6B7280');
    doc.text('SCAN TO VERIFY', qrX + qrSize / 2, y + 6, { align: 'center' });

    try {
      const qrContent = `Invoice ID: ${invoice.id} | Customer: ${invoice.customerName} | Total: $${total.toFixed(2)} | Date: ${invoice.date}`;
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        width: 200,
        margin: 1,
        color: { dark: '#1A1A2E', light: '#F0F4FF' },
      });
      const qrImgSize = qrSize - 14;
      doc.addImage(qrDataUrl, 'PNG', qrX + 7, y + 10, qrImgSize, qrImgSize);
    } catch (e) {
      fsize(7); normal(); hex('#9CA3AF');
      doc.text('QR', qrX + qrSize / 2, y + termsBoxH / 2, { align: 'center' });
    }

    fsize(5.5); normal(); hex('#818CF8');
    doc.text('Invoice verification', qrX + qrSize / 2, y + termsBoxH - 4, { align: 'center' });

    y += termsBoxH + 8;

    // ── Signature line ─────────────────────────────────────────────────────────
    y = ensure(y, 14);
    drawLine(y, '#CBD5E1'); y += 6;
    fsize(7); normal(); hex('#9CA3AF');
    doc.text('Authorized Signature: _______________________________', margin, y + 4);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, W - margin - 40, y + 4);

    // ── FOOTER ────────────────────────────────────────────────────────────────
    drawFooter();

    return doc;
  };

  // ─── SAVE PDF TO DEVICE (Capacitor) ───────────────────────────────────────
  const savePDFToDevice = async (doc, filename) => {
    const base64 = doc.output('datauristring').split(',')[1];
    const result = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    });
    return result.uri;
  };

  // ─── DOWNLOAD ─────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const doc      = await generatePDF();
      const filename = `Invoice-${invoice.id}.pdf`;
      if (Capacitor.isNativePlatform()) {
        const base64 = doc.output('datauristring').split(',')[1];
        await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Documents,
          recursive: true,
        });
        alert(`Invoice saved to Documents/${filename}`);
      } else {
        doc.save(filename);
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  // ─── SHARE ────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    setSharing(true);
    try {
      const doc      = await generatePDF();
      const filename = `Invoice-${invoice.id}.pdf`;
      if (Capacitor.isNativePlatform()) {
        const fileUri = await savePDFToDevice(doc, filename);
        await Share.share({
          title:       `Invoice ${invoice.id}`,
          text:        `Invoice from ${invoice.customerName}`,
          url:         fileUri,
          dialogTitle: 'Share Invoice',
        });
      } else {
        const blob = doc.output('blob');
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Invoice ${invoice.id}`,
            text:  `Invoice from ${invoice.customerName}`,
            files: [file],
          });
        } else if (navigator.share) {
          await navigator.share({
            title: `Invoice ${invoice.id}`,
            text:  `Invoice from ${invoice.customerName} — $${(invoice.amount * 1.18).toFixed(2)}`,
          });
        } else {
          doc.save(filename);
          alert('Sharing not supported. PDF downloaded instead.');
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        alert('Share failed: ' + err.message);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleMarkAsPaid = () => setStatus('paid');

  return (
    <div className="ip-page page">

      <div className="ip-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="ip-title">Preview Invoice</h2>
        <button className="ip-edit-btn" onClick={() => navigate(`/editinvoice/${invoice.id}`)}>
          <FiEdit2 size={18} />
        </button>
      </div>

      <div className="ip-card">
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

        <div className="ip-items">
          <p className="ip-items-heading">Items</p>
          <div className="ip-table-header">
            <span>Item</span><span>Qty</span><span>Price</span><span>Total</span>
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

      <div className="ip-actions">
        {status !== 'paid' ? (
          <div className="ip-three-btns">
            <button className="ip-paid-btn" onClick={handleMarkAsPaid}>✓ Paid</button>
            <button className="ip-share-btn" onClick={handleShare} disabled={sharing}>
              <FiShare2 size={18} />
              {sharing ? 'Sharing...' : 'Share'}
            </button>
            <button className="ip-download-btn" onClick={handleDownload} disabled={downloading}>
              <FiDownload size={18} />
              {downloading ? 'Saving...' : 'Download'}
            </button>
          </div>
        ) : (
          <div className="ip-bottom-btns">
            <button className="ip-share-btn" onClick={handleShare} disabled={sharing}>
              <FiShare2 size={18} />
              {sharing ? 'Sharing...' : 'Share Invoice'}
            </button>
            <button className="ip-download-btn" onClick={handleDownload} disabled={downloading}>
              <FiDownload size={18} />
              {downloading ? 'Saving...' : 'Download'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default InvoicePreview;
