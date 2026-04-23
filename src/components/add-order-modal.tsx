import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ClipboardList, Loader2 } from "lucide-react";
import { useCreateOrder } from "@/lib/api-hooks";
import { toast } from "sonner";

interface AddOrderModalProps {
  open: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped"    },
  { value: "delivered",  label: "Delivered"  },
  { value: "cancelled",  label: "Cancelled"  },
];

export function AddOrderModal({ open, onClose }: AddOrderModalProps) {
  const createMutation = useCreateOrder();
  const [customerName, setCustomerName] = useState("");
  const [total, setTotal]               = useState("");
  const [itemsCount, setItemsCount]     = useState("1");
  const [status, setStatus]             = useState("processing");

  function reset() {
    setCustomerName(""); setTotal(""); setItemsCount("1"); setStatus("processing");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numTotal = parseFloat(total.replace(/[^0-9.]/g, ""));
    const numItems = parseInt(itemsCount || "1", 10);

    if (!customerName.trim()) { toast.error("Customer name is required"); return; }
    if (isNaN(numTotal) || numTotal <= 0) { toast.error("Enter a valid total amount"); return; }

    const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await createMutation.mutateAsync({
        order_number:  orderNum,
        customer_name: customerName.trim(),
        total:         numTotal,
        status,
        items_count:   isNaN(numItems) ? 1 : numItems,
      });
      toast.success(`Order ${orderNum} created`);
      reset();
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">New Order</h2>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">Customer Name</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Aarav Shah"
                  maxLength={200}
                  className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-card-foreground">Total Amount ($)</label>
                  <input
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                    className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-card-foreground">Items Count</label>
                  <input
                    value={itemsCount}
                    onChange={(e) => setItemsCount(e.target.value)}
                    placeholder="1"
                    inputMode="numeric"
                    min="1"
                    className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="h-10 inline-flex items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70 transition-colors"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Order
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
