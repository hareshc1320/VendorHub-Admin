import { DashboardLayout } from "@/components/dashboard-layout";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useDashboardReports } from "@/lib/api-hooks";
import { exportCSV } from "@/lib/csv-export";

const PIE_COLORS = [
  "oklch(0.65 0.2 250)", "oklch(0.65 0.18 155)", "oklch(0.75 0.16 80)",
  "oklch(0.65 0.2 310)", "oklch(0.60 0.22 25)",  "oklch(0.65 0.15 200)",
];

export function ReportsPage() {
  const { data: reports, isLoading } = useDashboardReports(true);

  const kpiCards = reports ? [
    { label: "Total Revenue",  value: `$${reports.kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: +12.5, icon: DollarSign,  color: "text-primary"  },
    { label: "Total Orders",   value: String(reports.kpis.totalOrders),   change: +8.2,  icon: ShoppingCart, color: "text-info"    },
    { label: "New Customers",  value: String(reports.kpis.newCustomers),  change: +4.7,  icon: Users,        color: "text-success" },
    { label: "Products Sold",  value: String(reports.kpis.productsSold),  change: -2.1,  icon: Package,      color: "text-warning" },
  ] : [];

  const perfRows = reports ? [
    { label: "Avg. Order Value",   value: `$${reports.performance.avgOrderValue}`,  bar: Math.min(100, reports.performance.avgOrderValue / 2)   },
    { label: "Conversion Rate",    value: `${reports.performance.conversionRate}%`, bar: reports.performance.conversionRate                      },
    { label: "Customer Retention", value: `${reports.performance.retention}%`,      bar: reports.performance.retention                           },
    { label: "Return / Cancel",    value: `${reports.performance.returnRate}%`,     bar: Math.min(100, reports.performance.returnRate * 5)       },
  ] : [];

  function handleExport() {
    if (!reports) return;
    exportCSV("report", reports.monthlyRevenue.map(r => ({ Month: r.month, Revenue: r.revenue })));
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Full overview of your store performance</p>
        </div>
        <button
          onClick={handleExport}
          disabled={!reports}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading reports...</div>
      ) : reports ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted ${card.color}`}>
                    <card.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${card.change >= 0 ? "text-success" : "text-destructive"}`}>
                    {card.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(card.change)}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Monthly Revenue Bar Chart */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={reports.monthlyRevenue} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.02 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.55 0.02 260)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(0.25 0.015 260)", borderRadius: 8 }}
                    labelStyle={{ color: "oklch(0.95 0.01 260)", fontSize: 12 }}
                    formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="oklch(0.65 0.2 250)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">Sales by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={reports.categoryData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={75} innerRadius={40}>
                    {reports.categoryData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "oklch(0.55 0.02 260)" }} />
                  <Tooltip
                    contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(0.25 0.015 260)", borderRadius: 8 }}
                    formatter={(v) => [`${Number(v)} orders`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance table */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              {perfRows.map(row => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-semibold text-card-foreground">{row.value}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.bar}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
