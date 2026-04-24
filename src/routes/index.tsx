import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RecentOrders } from "@/components/recent-orders";
import {
  DollarSign, ShoppingCart, Users, Package, Plus,
  TrendingUp, Zap, FileText, UserPlus, Star, Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStats, useProducts, useDashboardRevenue } from "@/lib/api-hooks";
import { ReportsModal } from "@/components/reports-modal";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ─── Welcome Overlay (once per session) ─── */
function WelcomeOverlay() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem("vh_welcomed"));

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("vh_welcomed", "1");
    }, 2000);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 220 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-[0_0_40px_rgba(99,102,241,0.4)]"
            >
              <Store className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <div className="text-center space-y-1">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground"
              >
                VendorHub
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-sm text-muted-foreground"
              >
                Loading your dashboard…
              </motion.p>
            </div>
            <motion.div className="w-40 h-1 rounded-full bg-primary/15 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.85, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Animated counter hook ─── */
function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

/* ─── Time greeting ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

type Period = "7D" | "1M" | "3M" | "1Y";

/* ─── Animated Stat Card ─── */
function AnimatedStatCard({
  title, rawValue, displayValue, change, icon: Icon, delay,
}: {
  title: string;
  rawValue: number;
  displayValue: (n: number) => string;
  change: number;
  icon: React.ElementType;
  delay: number;
}) {
  const animated = useCountUp(rawValue);
  const positive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-card-foreground">
            {displayValue(animated)}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <TrendingUp className="h-4 w-4 text-success" />
        <span className={`text-sm font-medium ${positive ? "text-success" : "text-destructive"}`}>
          {positive ? "+" : ""}{change}%
        </span>
        <span className="text-sm text-muted-foreground">vs last month</span>
      </div>
    </motion.div>
  );
}

/* ─── Revenue Chart with period tabs ─── */
function RevenueChart() {
  const [period, setPeriod] = useState<Period>("1Y");
  const { data = [], isLoading } = useDashboardRevenue(period);
  const periods: Period[] = ["7D", "1M", "3M", "1Y"];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly revenue and order trends</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-accent/20 p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                period === p
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        {isLoading ? (
          <div className="flex h-full items-end gap-2 px-2">
            {[40, 60, 45, 75, 55, 80, 65, 90, 70, 85, 60, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-accent/40 animate-pulse" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="oklch(0.65 0.2 250)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "oklch(0.55 0.02 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "oklch(0.55 0.02 260)", fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
            <Tooltip
              contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(0.25 0.015 260)", borderRadius: "8px", color: "oklch(0.95 0.01 260)", fontSize: "13px" }}
              formatter={(val) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="oklch(0.65 0.2 250)" strokeWidth={2.5}
              fill="url(#revGrad)" dot={false}
              activeDot={{ r: 5, fill: "oklch(0.65 0.2 250)", stroke: "oklch(0.13 0.02 260)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ─── Quick Actions ─── */
const actions = [
  { label: "Add Product",  icon: Plus,     path: "/products",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20",     reports: false },
  { label: "New Order",    icon: FileText, path: "/orders",    color: "bg-purple-500/10 text-purple-400 border-purple-500/20", reports: false },
  { label: "Add Customer", icon: UserPlus, path: "/customers", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", reports: false },
  { label: "View Reports", icon: Zap,      path: "/",          color: "bg-amber-500/10 text-amber-400 border-amber-500/20",   reports: true  },
];

function QuickActions({ onReports }: { onReports: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Common tasks at a glance</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a, i) => (
          <motion.button
            key={a.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.06 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => a.reports ? onReports() : navigate({ to: a.path as "/" })}
            className={`flex flex-col items-center gap-2.5 rounded-xl border p-4 text-xs font-medium transition-all hover:shadow-md ${a.color}`}
          >
            <a.icon className="h-5 w-5" />
            <span>{a.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─── Top Sellers ─── */
function TopSellers() {
  const { data: products = [] } = useProducts();
  const top = [...products].sort((a, b) => b.price - a.price).slice(0, 5);
  const maxPrice = top[0]?.price ?? 1;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 mb-5">
        <Star className="h-4 w-4 text-amber-400" />
        <div>
          <h3 className="text-base font-semibold text-card-foreground">Top Products</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Sorted by price</p>
        </div>
      </div>
      <div className="space-y-3">
        {top.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 group"
          >
            <span className="w-5 text-xs font-bold text-muted-foreground/60 shrink-0">{i + 1}</span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/40 text-sm">📦</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">{p.name}</p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-accent/40 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${(p.price / maxPrice) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + 0.05 * i, ease: "easeOut" }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-card-foreground shrink-0">${p.price.toFixed(2)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard Page ─── */
export function IndexPage() {
  const { data: stats } = useDashboardStats();
  const [reportsOpen, setReportsOpen] = useState(false);
  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const cards = [
    {
      title:        "Total Revenue",
      rawValue:     stats?.totalRevenue ?? 0,
      displayValue: (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change:       12.5,
      icon:         DollarSign,
    },
    {
      title:        "Total Orders",
      rawValue:     stats?.orderCount ?? 0,
      displayValue: (n: number) => Math.floor(n).toString(),
      change:       8.2,
      icon:         ShoppingCart,
    },
    {
      title:        "Customers",
      rawValue:     stats?.customerCount ?? 0,
      displayValue: (n: number) => Math.floor(n).toString(),
      change:       4.7,
      icon:         Users,
    },
    {
      title:        "Products",
      rawValue:     stats?.productCount ?? 0,
      displayValue: (n: number) => Math.floor(n).toString(),
      change:       3.1,
      icon:         Package,
    },
  ];

  return (
    <DashboardLayout>
      <WelcomeOverlay />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}, Admin 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 rounded-xl border border-border bg-success/10 px-4 py-2"
        >
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-success">All systems operational</span>
        </motion.div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {cards.map((card, i) => (
          <AnimatedStatCard key={card.title} {...card} delay={i * 0.08} />
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <QuickActions onReports={() => setReportsOpen(true)} />
      </motion.div>

      {/* Chart + Recent Orders */}
      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RevenueChart />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <RecentOrders />
        </motion.div>
      </div>

      {/* Top Sellers */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <TopSellers />
      </motion.div>

      <ReportsModal open={reportsOpen} onClose={() => setReportsOpen(false)} />
    </DashboardLayout>
  );
}
