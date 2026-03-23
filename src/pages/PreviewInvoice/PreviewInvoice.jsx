import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiShare2, FiDownload, FiEdit2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import './PreviewInvoice.css';
import { numberToWords } from '../../utils/numberToWords';
import API from '../../api/api';

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹",
  JPY: "¥", AUD: "A$", CAD: "C$", SGD: "S$",
};

// ✅ Avatar colors
const AVATAR_COLORS = [
  '#667eea', '#e53e3e', '#38a169', '#d69e2e',
  '#805ad5', '#dd6b20', '#3182ce', '#e91e8c',
];
const getAvatarColor = (id) => {
  const index = typeof id === 'number' ? id : parseInt(id, 10) || 0;
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
};

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
  const { t }    = useTranslation();

  const [invoice,     setInvoice]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [status,      setStatus]      = useState('unpaid');
  const [downloading, setDownloading] = useState(false);
  const [sharing,     setSharing]     = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await API.get(`/invoices/${id}`);
        const inv = res.data.invoice;
        setInvoice(inv);
        setStatus(inv.status || 'unpaid');
      } catch (err) {
        setError('Invoice not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  // ✅ Generic status updater
  const updateStatus = async (newStatus) => {
    try {
      await API.put(`/invoices/${id}`, {
        ...invoice,
        items:  invoice.items,
        status: newStatus,
      });
      setStatus(newStatus);
      setInvoice({ ...invoice, status: newStatus });
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (loading) return (
    <div className="ip-page page" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ color: '#667eea', fontWeight: 600 }}>Loading invoice...</p>
    </div>
  );

  if (error || !invoice) return (
    <div className="ip-page page">
      <div className="ip-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="ip-title">{t("previewInvoice.notFound")}</h2>
      </div>
    </div>
  );

  const symbol   = CURRENCY_SYMBOLS[invoice.currency] || invoice.currency + ' ';
  const items    = invoice.items    || [];
  const subtotal = parseFloat(invoice.subtotal)       || 0;
  const discount = parseFloat(invoice.total_discount)  || 0;
  const gst      = parseFloat(invoice.gst)            || 0;
  const grand    = parseFloat(invoice.grand_total)     || 0;

  // ─── PDF GENERATOR ────────────────────────────────────
  const generatePDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W           = doc.internal.pageSize.getWidth();
    const pageH       = doc.internal.pageSize.getHeight();
    const margin      = 15;
    const contentW    = W - margin * 2;
    const FOOTER_H    = 18;
    const SAFE_BOTTOM = pageH - FOOTER_H - 8;

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
      doc.text(`Invoice # ${invoice.invoice_number}  —  continued`, margin, 9);
      return 20;
    };

    const ensure = (y, needed) => y + needed > SAFE_BOTTOM ? addPage() : y;

    // Header
    doc.setFillColor('#1A1A2E');
    doc.rect(0, 0, W, 38, 'F');
    bold(); fsize(22); doc.setTextColor('#FFFFFF');
    doc.text('INVOICE', margin, 18);
    normal(); fsize(9); doc.setTextColor('#A0AEC0');
    doc.text('Professional Invoice Document', margin, 25);

    doc.setFillColor('#2D2D4E');
    doc.roundedRect(W - margin - 42, 8, 42, 10, 2, 2, 'F');
    fsize(8); bold(); doc.setTextColor('#818CF8');
    doc.text(`# ${invoice.invoice_number}`, W - margin - 21, 14.5, { align: 'center' });

    const badgeColor =
      status === 'paid'     ? '#10B981' :
      status === 'followup' ? '#6a1b9a' : '#F59E0B';
    doc.setFillColor(badgeColor);
    doc.roundedRect(W - margin - 42, 22, 42, 10, 2, 2, 'F');
    fsize(8); bold(); doc.setTextColor('#FFFFFF');
    doc.text(status.toUpperCase(), W - margin - 21, 27.5, { align: 'center' });

    let y = 50;

    // From / To
    doc.setFillColor('#F9FAFB');
    doc.roundedRect(margin, y, contentW / 2 - 4, 30, 3, 3, 'F');
    fsize(7); normal(); hex('#6B7280');
    doc.text('FROM', margin + 5, y + 7);
    fsize(10); bold(); hex('#111827');
    doc.text('Your Business', margin + 5, y + 14);
    fsize(8); normal(); hex('#6B7280');
    doc.text('your@email.com', margin + 5, y + 20);

    const toX = margin + contentW / 2 + 4;
    doc.setFillColor('#F9FAFB');
    doc.roundedRect(toX, y, contentW / 2 - 4, 30, 3, 3, 'F');
    fsize(7); normal(); hex('#6B7280');
    doc.text('BILL TO', toX + 5, y + 7);
    fsize(10); bold(); hex('#111827');
    doc.text(invoice.customer_name || 'Client Name', toX + 5, y + 14);

    y += 38;
    y = ensure(y, 22);
    drawLine(y); y += 6;

    fsize(8); normal(); hex('#6B7280');
    doc.text('ISSUE DATE', margin,                    y + 4);
    doc.text('CURRENCY',   margin + contentW / 3,     y + 4);
    fsize(9); bold(); hex('#111827');
    doc.text(new Date(invoice.invoice_date).toLocaleDateString(), margin, y + 11);
    doc.text(invoice.currency || 'INR', margin + contentW / 3, y + 11);

    y += 22;
    y = ensure(y, 70);
    drawLine(y); y += 6;

    const drawTableHeader = (startY) => {
      doc.setFillColor('#1A1A2E');
      doc.rect(margin, startY, contentW, 9, 'F');
      fsize(8); bold(); doc.setTextColor('#FFFFFF');
      doc.text('ITEM',  margin + 3,               startY + 6);
      doc.text('QTY',   margin + contentW * 0.5,  startY + 6, { align: 'center' });
      doc.text('PRICE', margin + contentW * 0.68, startY + 6, { align: 'center' });
      doc.text('GST%',  margin + contentW * 0.82, startY + 6, { align: 'center' });
      doc.text('TOTAL', margin + contentW - 3,    startY + 6, { align: 'right'  });
      return startY + 9;
    };

    y = drawTableHeader(y);
    items.forEach((p, idx) => {
      if (y + 10 > SAFE_BOTTOM) { y = addPage(); y = drawTableHeader(y); }
      doc.setFillColor(idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB');
      doc.rect(margin, y, contentW, 10, 'F');
      fsize(8); normal(); hex('#111827');
      doc.text(p.product_name,                               margin + 3,               y + 6.5);
      doc.text(String(p.quantity),                           margin + contentW * 0.5,  y + 6.5, { align: 'center' });
      doc.text(`${symbol}${parseFloat(p.price).toFixed(2)}`, margin + contentW * 0.68, y + 6.5, { align: 'center' });
      doc.text(`${p.gst || 18}%`,                            margin + contentW * 0.82, y + 6.5, { align: 'center' });
      doc.text(`${symbol}${parseFloat(p.total).toFixed(2)}`, margin + contentW - 3,    y + 6.5, { align: 'right'  });
      y += 10;
    });

    y += 4; drawLine(y); y += 6;
    y = ensure(y, 44);

    const totalsX = margin + contentW * 0.55;
    fsize(8); normal(); hex('#6B7280');
    doc.text('Subtotal',  totalsX, y);
    doc.text(`${symbol}${subtotal.toFixed(2)}`,    margin + contentW - 3, y, { align: 'right' }); y += 7;
    doc.text('Discount',  totalsX, y);
    doc.text(`- ${symbol}${discount.toFixed(2)}`,  margin + contentW - 3, y, { align: 'right' }); y += 7;
    doc.text('GST',       totalsX, y);
    doc.text(`+ ${symbol}${gst.toFixed(2)}`,       margin + contentW - 3, y, { align: 'right' });
    y += 4; drawLine(y); y += 5;

    doc.setFillColor('#1A1A2E');
    doc.roundedRect(totalsX - 2, y - 1, contentW * 0.45 + 2, 11, 2, 2, 'F');
    fsize(10); bold(); doc.setTextColor('#FFFFFF');
    doc.text('TOTAL DUE',                    totalsX + 2,           y + 6);
    doc.text(`${symbol}${grand.toFixed(2)}`, margin + contentW - 3, y + 6, { align: 'right' });
    y += 15;

    if (grand > 0) {
      y = ensure(y, 14);
      doc.setFillColor('#F0FDF4');
      doc.setDrawColor('#BBF7D0');
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentW, 14, 2, 2, 'FD');
      fsize(7.5); normal(); hex('#166534');
      doc.text('Amount in Words:', margin + 4, y + 6);
      fsize(9); bold(); hex('#14532D');
      doc.text(numberToWords(grand), W / 2, y + 10, { align: 'center' });
      y += 18;
    }

    if (invoice.additional_notes) {
      y = ensure(y, 28);
      drawLine(y); y += 6;
      doc.setFillColor('#FFFBEB');
      doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
      fsize(7); bold(); hex('#92400E');
      doc.text('NOTES', margin + 4, y + 6);
      fsize(8); normal(); hex('#78350F');
      doc.text(doc.splitTextToSize(invoice.additional_notes, contentW - 8), margin + 4, y + 12);
      y += 18;
    }

    const termsLines = TERMS_AND_CONDITIONS;
    const termsBoxH  = termsLines.length * 7 + 10;
    const qrSize     = 44;
    const termsW     = contentW - qrSize - 6;
    y = ensure(y, termsBoxH + 30);
    y += 10; drawLine(y, '#CBD5E1'); y += 6;

    doc.setFillColor('#1E293B');
    doc.roundedRect(margin, y, 52, 8, 2, 2, 'F');
    fsize(8); bold(); doc.setTextColor('#FFFFFF');
    doc.text('TERMS & CONDITIONS', margin + 26, y + 5.5, { align: 'center' });
    y += 12;

    doc.setFillColor('#F8FAFC');
    doc.setDrawColor('#E2E8F0');
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, termsW, termsBoxH, 3, 3, 'FD');
    fsize(7.5); normal(); hex('#374151');
    termsLines.forEach((term, idx) => {
      doc.text(doc.splitTextToSize(term, termsW - 8), margin + 5, y + 6 + idx * 7);
    });

    const qrX = margin + termsW + 6;
    doc.setFillColor('#F0F4FF');
    doc.setDrawColor('#C7D2FE');
    doc.setLineWidth(0.4);
    doc.roundedRect(qrX, y, qrSize, termsBoxH, 3, 3, 'FD');
    fsize(6); bold(); hex('#6B7280');
    doc.text('SCAN TO VERIFY', qrX + qrSize / 2, y + 6, { align: 'center' });

    try {
      const qrContent = `Invoice: ${invoice.invoice_number} | Customer: ${invoice.customer_name} | Total: ${symbol}${grand.toFixed(2)}`;
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        width: 200, margin: 1,
        color: { dark: '#1A1A2E', light: '#F0F4FF' },
      });
      doc.addImage(qrDataUrl, 'PNG', qrX + 7, y + 10, qrSize - 14, qrSize - 14);
    } catch (e) {
      fsize(7); normal(); hex('#9CA3AF');
      doc.text('QR', qrX + qrSize / 2, y + termsBoxH / 2, { align: 'center' });
    }

    fsize(5.5); normal(); hex('#818CF8');
    doc.text('Invoice verification', qrX + qrSize / 2, y + termsBoxH - 4, { align: 'center' });
    y += termsBoxH + 8;

    y = ensure(y, 14);
    drawLine(y, '#CBD5E1'); y += 6;
    fsize(7); normal(); hex('#9CA3AF');
    doc.text('Authorized Signature: _______________________________', margin, y + 4);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, W - margin - 40, y + 4);

    drawFooter();
    return doc;
  };

  const savePDFToDevice = async (doc, filename) => {
    const base64 = doc.output('datauristring').split(',')[1];
    const result = await Filesystem.writeFile({
      path: filename, data: base64,
      directory: Directory.Cache, recursive: true,
    });
    return result.uri;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const doc      = await generatePDF();
      const filename = `Invoice-${invoice.invoice_number}.pdf`;
      if (Capacitor.isNativePlatform()) {
        const base64 = doc.output('datauristring').split(',')[1];
        await Filesystem.writeFile({
          path: filename, data: base64,
          directory: Directory.Documents, recursive: true,
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

  const handleShare = async () => {
    setSharing(true);
    try {
      const doc      = await generatePDF();
      const filename = `Invoice-${invoice.invoice_number}.pdf`;
      if (Capacitor.isNativePlatform()) {
        const fileUri = await savePDFToDevice(doc, filename);
        await Share.share({
          title: `Invoice ${invoice.invoice_number}`,
          text:  `Invoice from ${invoice.customer_name}`,
          url: fileUri, dialogTitle: 'Share Invoice',
        });
      } else {
        const blob = doc.output('blob');
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Invoice ${invoice.invoice_number}`,
            text:  `Invoice from ${invoice.customer_name}`,
            files: [file],
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

  return (
    <div className="ip-page page">

      {/* Header */}
      <div className="ip-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </button>
        <h2 className="ip-title">{t("previewInvoice.title")}</h2>
        <button className="ip-edit-btn" onClick={() => navigate(`/editinvoice/${invoice.id}`)}>
          <FiEdit2 size={18} />
        </button>
      </div>

      <div className="ip-card">
        <div className="ip-top">
          <div>
            <p className="ip-invoice-id">{invoice.invoice_number}</p>
            <span className={`ip-badge ${status}`}>
              {t(`previewInvoice.status.${status}`)}
            </span>
          </div>
          {/* ✅ Avatar with auto color */}
          <div
            className="ip-avatar"
            style={{ background: getAvatarColor(invoice.id) }}
          >
            {invoice.customer_name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="ip-divider" />

        {/* Parties */}
        <div className="ip-parties">
          <div className="ip-party">
            <p className="ip-party-label">{t("previewInvoice.from")}</p>
            <p className="ip-party-name">{t("previewInvoice.yourBusiness")}</p>
            <p className="ip-party-sub">your@email.com</p>
          </div>
          <div className="ip-party ip-party-right">
            <p className="ip-party-label">{t("previewInvoice.to")}</p>
            <p className="ip-party-name">{invoice.customer_name}</p>
          </div>
        </div>

        <div className="ip-divider" />

        {/* Dates */}
        <div className="ip-dates">
          <div className="ip-date-item">
            <p className="ip-date-label">{t("previewInvoice.issueDate")}</p>
            <p className="ip-date-value">
              {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
          </div>
          <div className="ip-date-item">
            <p className="ip-date-label">{t("previewInvoice.currency")}</p>
            <p className="ip-date-value">{invoice.currency}</p>
          </div>
        </div>

        <div className="ip-divider" />

        {/* Items */}
        <div className="ip-items">
          <p className="ip-items-heading">{t("previewInvoice.items")}</p>
          <div className="ip-table-header">
            <span>{t("previewInvoice.tableItem")}</span>
            <span>{t("previewInvoice.tableQty")}</span>
            <span>{t("previewInvoice.tablePrice")}</span>
            <span>{t("previewInvoice.tableTotal")}</span>
          </div>
          {items.map((p, i) => (
            <div key={i} className="ip-table-row">
              <span className="ip-item-name">{p.product_name}</span>
              <span>{p.quantity} {p.unit}</span>
              <span>{symbol}{parseFloat(p.price).toLocaleString()}</span>
              <span>{symbol}{parseFloat(p.total).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="ip-divider" />

        {/* Totals */}
        <div className="ip-totals">
          <div className="ip-total-row">
            <span>{t("previewInvoice.subtotal")}</span>
            <span>{symbol}{subtotal.toFixed(2)}</span>
          </div>
          <div className="ip-total-row">
            <span>{t("previewInvoice.totalDiscount")}</span>
            <span>- {symbol}{discount.toFixed(2)}</span>
          </div>
          <div className="ip-total-row">
            <span>{t("previewInvoice.tax")}</span>
            <span>+ {symbol}{gst.toFixed(2)}</span>
          </div>
          <div className="ip-total-row ip-grand-total">
            <span>{t("previewInvoice.total")}</span>
            <span>{symbol}{grand.toFixed(2)}</span>
          </div>
        </div>

        {invoice.additional_notes && (
          <>
            <div className="ip-divider" />
            <div className="ip-notes">
              <p className="ip-notes-label">{t("previewInvoice.notes")}</p>
              <p className="ip-notes-text">{invoice.additional_notes}</p>
            </div>
          </>
        )}
      </div>

      {/* ✅ Action Buttons — all 3 statuses handled */}
      <div className="ip-actions">
        {status === 'paid' ? (
          // Paid — only share & download
          <div className="ip-bottom-btns">
            <button className="ip-share-btn" onClick={handleShare} disabled={sharing}>
              <FiShare2 size={18} />
              {sharing ? t("previewInvoice.sharing") : t("previewInvoice.shareInvoice")}
            </button>
            <button className="ip-download-btn" onClick={handleDownload} disabled={downloading}>
              <FiDownload size={18} />
              {downloading ? t("previewInvoice.saving") : t("previewInvoice.download")}
            </button>
          </div>
        ) : (
          // Unpaid or Followup — show all action buttons
          <div className="ip-three-btns">
            {/* ✅ Mark as Paid */}
            <button className="ip-paid-btn" onClick={() => updateStatus('paid')}>
              ✅ {t("previewInvoice.markPaid")}
            </button>
            {/* ✅ Mark as Follow Up — only if not already followup */}
            {status !== 'followup' && (
              <button
                onClick={() => updateStatus('followup')}
                style={{
                  flex: 1, padding: "12px", borderRadius: "10px",
                  border: "none", background: "#6a1b9a",
                  color: "#fff", fontWeight: 600,
                  fontSize: "14px", cursor: "pointer",
                }}
              >
                📌 {t("previewInvoice.markFollowup") || "Follow Up"}
              </button>
            )}
            {/* ✅ Mark as Unpaid — only if currently followup */}
            {status === 'followup' && (
              <button
                onClick={() => updateStatus('unpaid')}
                style={{
                  flex: 1, padding: "12px", borderRadius: "10px",
                  border: "none", background: "#f57f17",
                  color: "#fff", fontWeight: 600,
                  fontSize: "14px", cursor: "pointer",
                }}
              >
                🔄 {t("previewInvoice.markUnpaid") || "Mark Unpaid"}
              </button>
            )}
            <button className="ip-share-btn" onClick={handleShare} disabled={sharing}>
              <FiShare2 size={18} />
              {sharing ? t("previewInvoice.sharing") : t("previewInvoice.share")}
            </button>
            <button className="ip-download-btn" onClick={handleDownload} disabled={downloading}>
              <FiDownload size={18} />
              {downloading ? t("previewInvoice.saving") : t("previewInvoice.download")}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default InvoicePreview;