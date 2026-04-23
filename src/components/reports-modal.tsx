import { AnimatePresence, motion } from "framer-motion";
import { X, BarChart3, TrendingUp, ShoppingCart, Users, DollarSign, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useDashboardReports } from "@/lib/api-hooks";

interface ReportsModalProps {
  open: boolean;
  onClose: () => void;
}

const PIE_COLORS = [
  "oklch(0.65 0.2 250)",
  "oklch(0.65 0.18 155)",
  "oklch(0.75 0.16 80)",
  "oklch(0.65 0.2 310)",
  "oklch(0.60 0.22 25)",
  "oklch(0.65 0.15 200)",
];

export function ReportsModal({ open, onClose }: ReportsModalProps) {
  const { data: reports, isLoading } = useDashboardReports(open);

  const kpiCards = reports ? [
    { label: "Total Revenue",  value: `$${reports.kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: +12.5, icon: DollarSign,  color: "text-primary"  },
    { label: "Total Orders",   value: reports.kpis.totalOrders.toString(),   change: +8.2,  icon: ShoppingCart, color: "text-info"    },
    { label: "New Customers",  value: reports.kpis.newCustomers.toString(),  change: +4.7,  icon: Users,        color: "text-success" },
    { label: "Products Sold",  value: reports.kpis.productsSold.toString(),  change: -2.1,  icon: Package,      color: "text-warning" },
  ] : [];

  const perfRows = reports ? [
    { label: "Avg. Order Value",   value: `$${reports.performance.avgOrderValue}`,  bar: Math.min(100, reports.performance.avgOrderValue / 2)     },
    { label: "Conversion Rate",    value: `${reports.performance.conversionRate}%`, bar: reports.performance.conversionRate                        },
    { label: "Customer Retention", value: `${reports.performance.retention}%`,      bar: reports.performance.retention                             },
    { label: "Return / Cancel",    value: `${reports.performance.returnRate}%`,     bar: Math.min(100, reports.performance.returnRate * 5)         },
  ] : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4 bg-card/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                  <BarChart3 className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-card-foreground">Reports & Analytics</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Last 6 months overview</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="rounded-xl border border-border bg-accent/20 p-4 h-24 animate-pulse" />
                    ))}
                  </div>
                  <div className="rounded-xl border border-border bg-accent/10 p-5 h-64 animate-pulse" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-accent/10 p-5 h-52 animate-pulse" />
                    <div className="rounded-xl border border-border bg-accent/10 p-5 h-52 animate-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {kpiCards.map((k, i) => (
                      <motion.div
                        key={k.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-xl border border-border bg-accent/20 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <k.icon className={`h-4 w-4 ${k.color}`} />
                          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${k.change >= 0 ? "text-success" : "text-destructive"}`}>
                            {k.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(k.change)}%
                          </span>
                        </div>
                        <p className="text-lg font-bold text-card-foreground">{k.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Revenue Bar Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-xl border border-border bg-accent/10 p-5"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-card-foreground">Monthly Revenue</h3>
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reports?.monthlyRevenue ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={32}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.02 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "oklch(0.55 0.02 260)", fontSize: 12 }} axisLine={false} tickLine={false}
                            tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                          <Tooltip
                            contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(0.25 0.015 260)", borderRadius: "8px", color: "oklch(0.95 0.01 260)", fontSize: "13px" }}
                            formatter={(val) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                          />
                          <Bar dataKey="revenue" fill="oklch(0.65 0.2 250)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Pie + Performance */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="rounded-xl border border-border bg-accent/10 p-5"
                    >
                      <h3 className="text-sm font-semibold text-card-foreground mb-4">Sales by Category</h3>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={reports?.categoryData ?? []} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                              {(reports?.categoryData ?? []).map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(0.25 0.015 260)", borderRadius: "8px", color: "oklch(0.95 0.01 260)", fontSize: "12px" }}
                              formatter={(val) => [`${val}%`, "Share"]}
                            />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "oklch(0.55 0.02 260)" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.42 }}
                      className="rounded-xl border border-border bg-accent/10 p-5 flex flex-col justify-between"
                    >
                      <h3 className="text-sm font-semibold text-card-foreground mb-4">Performance Summary</h3>
                      <div className="space-y-3">
                        {perfRows.map((row) => (
                          <div key={row.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">{row.label}</span>
                              <span className="text-xs font-semibold text-card-foreground">{row.value}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-accent/50 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-primary/70"
                                initial={{ width: 0 }}
                                animate={{ width: `${row.bar}%` }}
                                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
