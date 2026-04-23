import { useState, useMemo, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AddOrderModal } from "@/components/add-order-modal";
import { OrderDetailModal } from "@/components/order-detail-modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, ChevronDown, Eye, MoreHorizontal, Package,
  Truck, CheckCircle2, XCircle, Clock, Plus, Download,
} from "lucide-react";
import { useOrders, useUpdateOrder } from "@/lib/api-hooks";
import { exportCSV } from "@/lib/csv-export";
import { toast } from "sonner";
import type { Order } from "@/lib/mock-data";

const statusConfig: Record<string, { style: string; icon: typeof Clock }> = {
  processing: { style: "bg-info/15 text-info",              icon: Clock        },
  shipped:    { style: "bg-warning/15 text-warning",         icon: Truck        },
  delivered:  { style: "bg-success/15 text-success",         icon: CheckCircle2 },
  cancelled:  { style: "bg-destructive/15 text-destructive", icon: XCircle      },
};

const statusOptions = [
  { value: "processing", label: "Processing", icon: Clock,        color: "text-info"        },
  { value: "shipped",    label: "Shipped",    icon: Truck,        color: "text-warning"      },
  { value: "delivered",  label: "Delivered",  icon: CheckCircle2, color: "text-success"      },
  { value: "cancelled",  label: "Cancelled",  icon: XCircle,      color: "text-destructive"  },
];

const allStatuses = ["All", "processing", "shipped", "delivered", "cancelled"];

/* ─── Per-row status dropdown ─── */
function StatusMenu({
  order,
  onSelect,
}: {
  order: Order;
  onSelect: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        title="Change status"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 6 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 z-50 mt-1 w-44 rounded-xl border border-border bg-card shadow-2xl shadow-black/30 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-border/60">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Set Status</p>
            </div>
            {statusOptions.map((opt) => {
              const Icon = opt.icon;
              const isCurrent = order.status === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onSelect(order.id, opt.value); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-accent/60 ${
                    isCurrent ? "bg-accent/40 font-semibold" : ""
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${opt.color}`} />
                  <span className="text-card-foreground">{opt.label}</span>
                  {isCurrent && (
                    <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      current
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OrdersPage() {
  const { data: orders = [] } = useOrders();
  const updateMutation = useUpdateOrder();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => ({
    total:      orders.length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped:    orders.filter((o) => o.status === "shipped").length,
    delivered:  orders.filter((o) => o.status === "delivered").length,
  }), [orders]);

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateMutation.mutateAsync({ id, status: status as Order["status"] });
      toast.success(`Order marked as ${status}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Track and manage all vendor orders</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV("orders", filtered.map(o => ({ "Order #": o.order_number, Customer: o.customer_name, Total: o.total, Status: o.status, Items: o.items_count, Date: o.created_at })))}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> New Order
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Orders", value: stats.total,      icon: Package,      color: "text-primary"  },
            { label: "Processing",   value: stats.processing, icon: Clock,        color: "text-info"     },
            { label: "Shipped",      value: stats.shipped,    icon: Truck,        color: "text-warning"  },
            { label: "Delivered",    value: stats.delivered,  icon: CheckCircle2, color: "text-success"  },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-card-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="h-10 w-full rounded-lg border border-input bg-input pl-9 pr-4 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-input bg-input pl-9 pr-8 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring appearance-none cursor-pointer capitalize"
            >
              {allStatuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Order</th>
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Items</th>
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3.5 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((o) => {
                    const cfg = statusConfig[o.status];
                    const StatusIcon = cfg?.icon ?? Clock;
                    return (
                      <motion.tr
                        key={o.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="border-b border-border/50 last:border-0 hover:bg-accent/20"
                      >
                        <td className="px-4 py-3.5 font-medium text-card-foreground">{o.order_number}</td>
                        <td className="px-4 py-3.5 text-card-foreground">{o.customer_name}</td>
                        <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">{o.items_count}</td>
                        <td className="px-4 py-3.5 font-semibold text-card-foreground">${Number(o.total).toFixed(2)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cfg?.style ?? ""}`}>
                            <StatusIcon className="h-3 w-3" />
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground hidden lg:table-cell">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            {/* Eye → Open detail modal */}
                            <button
                              onClick={() => setDetailOrder(o)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {/* Three-dots → Status dropdown */}
                            <StatusMenu order={o} onSelect={handleStatusChange} />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No orders found</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AddOrderModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
    </DashboardLayout>
  );
}
