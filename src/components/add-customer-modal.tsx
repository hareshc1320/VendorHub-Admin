import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, UserPlus, Loader2 } from "lucide-react";
import { useCreateCustomer } from "@/lib/api-hooks";
import { toast } from "sonner";

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: "active",   label: "Active"   },
  { value: "vip",      label: "VIP"      },
  { value: "inactive", label: "Inactive" },
];

export function AddCustomerModal({ open, onClose }: AddCustomerModalProps) {
  const createMutation = useCreateCustomer();
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [phone,  setPhone]  = useState("");
  const [status, setStatus] = useState("active");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  function reset() {
    setName(""); setEmail(""); setPhone(""); setStatus("active"); setErrors({});
  }

  function validate() {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createMutation.mutateAsync({
        name:   name.trim(),
        email:  email.trim(),
        phone:  phone.trim() || null,
        status,
      });
      toast.success("Customer added successfully");
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
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">Add Customer</h2>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Shah"
                  maxLength={200}
                  className={`h-10 w-full rounded-lg border bg-input px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring transition-colors ${
                    errors.name ? "border-destructive" : "border-input focus:border-ring"
                  }`}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className={`h-10 w-full rounded-lg border bg-input px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring transition-colors ${
                    errors.email ? "border-destructive" : "border-input focus:border-ring"
                  }`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">
                  Phone <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91-98765-43210"
                  className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <div className="flex gap-2">
                  {statusOptions.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatus(s.value)}
                      className={`flex-1 h-9 rounded-lg text-xs font-medium transition-all border ${
                        status === s.value
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-accent/30 text-muted-foreground border-input hover:bg-accent"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { reset(); onClose(); }}
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
                  Add Customer
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
