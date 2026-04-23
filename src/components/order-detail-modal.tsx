import { AnimatePresence, motion } from "framer-motion";
import { X, Package, User, Calendar, Hash, ShoppingBag, DollarSign, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Order } from "@/lib/mock-data";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

const statusConfig: Record<string, { style: string; label: string; icon: typeof Clock }> = {
  processing: { style: "bg-info/15 text-info border-info/30",             label: "Processing", icon: Clock        },
  shipped:    { style: "bg-warning/15 text-warning border-warning/30",     label: "Shipped",    icon: Truck        },
  delivered:  { style: "bg-success/15 text-success border-success/30",     label: "Delivered",  icon: CheckCircle2 },
  cancelled:  { style: "bg-destructive/15 text-destructive border-destructive/30", label: "Cancelled", icon: XCircle },
};

const timeline = ["processing", "shipped", "delivered"];

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const cfg = statusConfig[order.status];
  const StatusIcon = cfg?.icon ?? Clock;
  const currentStep = timeline.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-accent/10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-card-foreground">{order.order_number}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Order Details</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="px-6 pt-5 pb-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${cfg?.style ?? ""}`}>
                <StatusIcon className="h-4 w-4" />
                {cfg?.label ?? order.status}
              </span>
            </div>

            {/* Order Info Grid */}
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              {[
                { icon: User,        label: "Customer",   value: order.customer_name },
                { icon: Calendar,    label: "Date",       value: new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) },
                { icon: ShoppingBag, label: "Items",      value: `${order.items_count} item${order.items_count !== 1 ? "s" : ""}` },
                { icon: DollarSign,  label: "Total",      value: `$${Number(order.total).toFixed(2)}` },
                { icon: Hash,        label: "Order ID",   value: order.id.slice(0, 8).toUpperCase() },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/40 mt-0.5">
                    <row.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="text-sm font-medium text-card-foreground mt-0.5">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Timeline */}
            <div className="px-6 pb-6">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Order Progress</p>
              {isCancelled ? (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm font-medium text-destructive">This order was cancelled</p>
                </div>
              ) : (
                <div className="flex items-center gap-0">
                  {timeline.map((step, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    const StepIcon = statusConfig[step]?.icon ?? Clock;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                          <motion.div
                            initial={false}
                            animate={{ scale: active ? 1.15 : 1 }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                              done
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-accent/30 border-border text-muted-foreground"
                            }`}
                          >
                            <StepIcon className="h-3.5 w-3.5" />
                          </motion.div>
                          <span className={`text-[10px] font-medium capitalize whitespace-nowrap ${done ? "text-primary" : "text-muted-foreground"}`}>
                            {step}
                          </span>
                        </div>
                        {i < timeline.length - 1 && (
                          <div className="flex-1 mx-1 mb-5">
                            <div className="h-0.5 w-full bg-border overflow-hidden rounded-full">
                              <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: i < currentStep ? "100%" : "0%" }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
