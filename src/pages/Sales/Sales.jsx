import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiTrendingUp } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList,
} from "recharts";
import API from "../../api/api";
import "./Sales.css";
import TopNav from "../../components/common/TopNav";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "Rs.", JPY: "¥", AUD: "A$",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#667eea","#f093fb","#f5576c","#4facfe","#43e97b","#fa709a","#f7971e","#17ead9"];

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle"
      dominantBaseline="central" fontSize={13} fontWeight={700}>
      {value}
    </text>
  );
};

const BarTopLabel = (props) => {
  const { x, y, width, value } = props;
  if (!value && value !== 0) return null;
  const label = value >= 1000 ? (value / 1000).toFixed(1) + "k" : value;
  return (
    <text x={x + width / 2} y={y - 5} fill="#667eea"
      textAnchor="middle" fontSize={10} fontWeight={600}>
      Rs.{label}
    </text>
  );
};

const Sales = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [activeChart, setActiveChart] = useState("monthly");

  const [sales, setSales]     = useState([]); // flattened invoice items
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchInvoices = async () => {
      try {
        const res = await API.get('/invoices');
        const invoices = res.data?.invoices || [];

        const initials = (name) => {
          if (!name) return "--";
          const parts = String(name).split(/\s+/).filter(Boolean);
          return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
        };
        const colorFor = (str) => {
          const colors = COLORS;
          let h = 0; for (let i = 0; i < (str || "").length; i++) h = (h << 5) - h + str.charCodeAt(i);
          return colors[Math.abs(h) % colors.length];
        };

        const mapped = [];
        for (const inv of invoices) {
          const items = inv.items || [];
          if (items.length === 0) {
            mapped.push({
              id: inv.invoice_number || `INV-${inv.id}`,
              customerName: inv.customer_name || 'Unknown',
              avatar: initials(inv.customer_name || ''),
              avatarColor: colorFor(inv.customer_name || ''),
              product: 'Invoice',
              quantity: 1,
              unit: '',
              amount: inv.grand_total || 0,
              discount: 0,
              gst: inv.gst || 0,
              finalAmount: inv.grand_total || 0,
              currency: inv.currency || 'USD',
              date: inv.invoice_date || inv.created_at,
              paymentMethod: inv.payment_method || '-',
              status: inv.status || 'unpaid',
            });
          } else {
            for (const it of items) {
              mapped.push({
                id: `${inv.invoice_number || `INV-${inv.id}`}#${it.id || Math.random().toString(36).slice(2,7)}`,
                customerName: inv.customer_name || 'Unknown',
                avatar: initials(inv.customer_name || ''),
                avatarColor: colorFor(inv.customer_name || ''),
                product: it.product_name || it.name || 'Item',
                quantity: it.quantity || 1,
                unit: it.unit || it.uom || '',
                amount: (it.price || 0) * (it.quantity || 1),
                discount: it.discount || 0,
                gst: it.gst || inv.gst || 0,
                finalAmount: it.total || (it.price || 0) * (it.quantity || 1),
                currency: inv.currency || 'USD',
                date: inv.invoice_date || inv.created_at,
                paymentMethod: inv.payment_method || '-',
                status: inv.status || 'unpaid',
              });
            }
          }
        }

        if (mounted) {
          setSales(mapped);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch invoices:', err?.response || err.message || err);
        if (mounted) {
          setError(err);
          setSales([]);
          setLoading(false);
        }
      }
    };
    fetchInvoices();
    return () => { mounted = false; };
  }, []);

  const normalizeStatus = (s) => {
    if (!s) return 'unpaid';
    const st = String(s).toLowerCase();
    if (st === 'completed' || st === 'paid') return 'paid';
    if (st === 'refunded' || st === 'pending' || st === 'unpaid' || st === 'returned') return 'unpaid';
    if (st === 'cancelled' || st === 'canceled') return 'cancelled';
    return st;
  };

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <>
        <TopNav />
        <div className="sales-page page">
          <div className="empty-state">{t('common.loading') || 'Loading...'}</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopNav />
        <div className="sales-page page">
          <div className="empty-state">{t('common.networkError') || 'Failed to load sales.'}</div>
        </div>
      </>
    );
  }

  const dataSource = sales; // use fetched data only

  const filtered = dataSource.filter((item) => {
    const itemStatus = normalizeStatus(item.status);
    const matchesFilter = filter === "all" ? true : itemStatus === filter;
    const matchesSearch =
      String(item.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(item.product || '').toLowerCase().includes(search.toLowerCase())      ||
      String(item.id || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const monthlyData = MONTHS.map((month, i) => {
    const monthSales = dataSource.filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === i && normalizeStatus(s.status) === 'paid';
    });
    return {
      month,
      revenue: parseFloat(monthSales.reduce((sum, s) => sum + (Number(s.finalAmount) || 0), 0).toFixed(2)),
      count: monthSales.length,
    };
  }).filter((d) => d.revenue > 0);

  const yearlyMap = {};
  dataSource.forEach((s) => {
    const year = String(new Date(s.date).getFullYear());
    if (!yearlyMap[year]) yearlyMap[year] = { revenue: 0, count: 0 };
    if (normalizeStatus(s.status) === 'paid') {
      yearlyMap[year].revenue = parseFloat((yearlyMap[year].revenue + (Number(s.finalAmount) || 0)).toFixed(2));
      yearlyMap[year].count += 1;
    }
  });
  const yearlyData = Object.entries(yearlyMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, d]) => ({ year, revenue: d.revenue, count: d.count }));

  const statusCounts = dataSource.reduce((acc, s) => {
    const st = normalizeStatus(s.status);
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: t("sales.status.paid") || 'Paid',    value: statusCounts.paid || 0 },
    { name: t("sales.status.unpaid") || 'Unpaid',  value: statusCounts.unpaid || 0 },
    { name: t("sales.status.cancelled") || 'Cancelled', value: statusCounts.cancelled || 0 },
  ].filter((d) => d.value > 0);

  const productMap = {};
  dataSource.forEach((s) => {
    const pname = s.product || 'Unknown Product';
    if (!productMap[pname]) {
      productMap[pname] = { name: pname, revenue: 0, count: 0, months: new Set() };
    }
    if (normalizeStatus(s.status) === 'paid') {
      productMap[pname].revenue = parseFloat((productMap[pname].revenue + (Number(s.finalAmount) || 0)).toFixed(2));
      productMap[pname].count += 1;
      const m = new Date(s.date).getMonth();
      if (!isNaN(m)) productMap[pname].months.add(m);
    }
  });
  // show only top 5 performing products in the chart
  const productsArr = Object.values(productMap)
    .filter((p) => p.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);
  const TOP_N = 5;
  const productData = productsArr
    .slice(0, Math.min(TOP_N, productsArr.length))
    .map((p) => ({
      ...p,
      monthCount: p.months.size,
      shortName: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    }));

  const totalRevenue = dataSource
    .filter((s) => normalizeStatus(s.status) === 'paid')
    .reduce((sum, s) => sum + (Number(s.finalAmount) || 0), 0);

  const chartTabs = [
    { key: "monthly",  label: t("sales.charts.monthly")  },
    { key: "yearly",   label: t("sales.charts.yearly")   },
    { key: "status",   label: t("sales.charts.status")   },
    { key: "products", label: t("sales.charts.products") },
  ];

  const filterTabs = ["all", "paid", "unpaid", "cancelled"];

  return (
    <>
      <TopNav />
      <div className="sales-page page">

        {/* Header */}
        <div className="sales-header">
          <button className="back-btn" onClick={() => navigate("/")}> 
            <FiArrowLeft size={20} />
          </button>
          <h2 className="sales-title">{t("sales.title")}</h2>
          <FiTrendingUp size={22} color="#667eea" />
        </div>

        {/* Chart Card */}
        <div className="chart-card">

          {/* Tabs */}
          <div className="chart-tabs">
            {chartTabs.map((tab) => (
              <button
                key={tab.key}
                className={`chart-tab ${activeChart === tab.key ? "active" : ""}`}
                onClick={() => setActiveChart(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Meta */}
          <div className="chart-meta">
            <div className="chart-meta-row">
              {activeChart === "monthly"  && <p className="chart-title">{t("sales.charts.revenueByMonth")}</p>}
              {activeChart === "yearly"   && <p className="chart-title">{t("sales.charts.yearlyGrowth")}</p>}
              {activeChart === "status"   && <p className="chart-title">{t("sales.charts.byStatus")}</p>}
              {activeChart === "products" && <p className="chart-title">{t("sales.charts.byProduct")}</p>}
              <p className="chart-total">
                Rs.{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            {activeChart === "monthly"  && <p className="chart-sub">{t("sales.charts.completedSales")}</p>}
            {activeChart === "yearly"   && (
              <p className="chart-sub">
                {yearlyData.length === 1
                  ? t("sales.charts.yearsOfData_one",   { count: yearlyData.length })
                  : t("sales.charts.yearsOfData_other", { count: yearlyData.length })}
              </p>
            )}
            {activeChart === "status"   && <p className="chart-sub">{t("sales.charts.totalSales",   { count: dataSource.length })}</p>}
            {activeChart === "products" && <p className="chart-sub">{t("sales.charts.productsSold", { count: productData.length })}</p>}
          </div>

          {/* Monthly Bar Chart */}
          {activeChart === "monthly" && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} margin={{ top: 24, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => val >= 1000 ? (val / 1000).toFixed(0) + "k" : val} />
                <Tooltip formatter={(val) => [`Rs.${val.toLocaleString()}`, t("sales.charts.revenue")]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#667eea" radius={[6, 6, 0, 0]}>
                  <LabelList content={<BarTopLabel />} position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Yearly Bar Chart */}
          {activeChart === "yearly" && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={yearlyData} margin={{ top: 24, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => val >= 1000 ? (val / 1000).toFixed(0) + "k" : val} />
                <Tooltip formatter={(val) => [`$${val.toLocaleString()}`, t("sales.charts.revenue")]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#667eea" radius={[6, 6, 0, 0]}>
                  <LabelList content={<BarTopLabel />} position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Status Donut */}
          {activeChart === "status" && (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55}
                  outerRadius={85} paddingAngle={4} dataKey="value"
                  labelLine={false} label={renderCustomLabel}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Products Bar Chart */}
          {activeChart === "products" && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={productData} margin={{ top: 24, right: 10, left: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="shortName" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 12]} ticks={[0, 3, 6, 9, 12]}
                  tickFormatter={(val) => (val === 0 ? "0" : `${val}m`)} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const p = productData.find((p) => p.shortName === label);
                      return (
                        <div style={{ background: "white", borderRadius: 10, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}>
                          <p style={{ fontWeight: 700, color: "#333", margin: "0 0 4px" }}>{p ? p.name : label}</p>
                          <p style={{ color: "#667eea", margin: "2px 0" }}>{t("sales.charts.monthsActive")}: {p?.monthCount}m</p>
                          <p style={{ color: "#aaa", margin: "2px 0" }}>{t("sales.charts.revenue")}: ${p?.revenue?.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="monthCount" fill="#667eea" radius={[6, 6, 0, 0]}>
                  <LabelList
                    content={(props) => {
                      const { x, y, width, index } = props;
                      const p = productData[index];
                      if (!p) return null;
                      const label = p.revenue >= 1000 ? (p.revenue / 1000).toFixed(1) + "k" : p.revenue;
                      return (
                        <text x={x + width / 2} y={y - 5} fill="#667eea" textAnchor="middle" fontSize={10} fontWeight={600}>
                          Rs.{label}
                        </text>
                      );
                    }}
                    position="top"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="sales-filters">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {t(`sales.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* Sales List */}
        <div className="sales-list">
          {filtered.map((item) => (
            <div key={item.id} className="sale-card">
              <div className="sale-top">
                <div className="sale-avatar-name">
                  <div className="sale-avatar" style={{ background: item.avatarColor }}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="sale-customer">{item.customerName}</p>
                    <p className="sale-id">{String(item.id).split('#')[0]}</p>
                  </div>
                </div>
                <span className={`sale-badge ${normalizeStatus(item.status)}`}>
                  {t(`sales.status.${normalizeStatus(item.status)}`) || normalizeStatus(item.status)}
                </span>
              </div>
              <div className="sale-divider" />
              <div className="sale-product-row">
                <p className="sale-product-name">{item.product}</p>
                <p className="sale-final-amount">
                  {CURRENCY_SYMBOLS[item.currency] || item.currency + " "}
                  {Number(item.finalAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="sale-bottom">
                <p className="sale-date">{formatDate(item.date)}</p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <p>{t("sales.noSales", { filter: t(`sales.tabs.${filter}`) })}</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default Sales;
