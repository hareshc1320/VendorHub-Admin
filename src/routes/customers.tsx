import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AddCustomerModal } from "@/components/add-customer-modal";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Mail, TrendingUp, ShoppingBag, DollarSign, Trash2, UserPlus, Download } from "lucide-react";
import { exportCSV } from "@/lib/csv-export";
import { useCustomers, useDeleteCustomer } from "@/lib/api-hooks";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active:   "bg-success/15 text-success",
  vip:      "bg-primary/15 text-primary",
  inactive: "bg-muted text-muted-foreground",
};

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

export function CustomersPage() {
  const { data: customers = [] } = useCustomers();
  const deleteMutation = useDeleteCustomer();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const stats = useMemo(() => ({
    total:        customers.length,
    active:       customers.filter((c) => c.status === "active" || c.status === "vip").length,
    totalRevenue: customers.reduce((sum, c) => sum + Number(c.total_spent), 0),
    avgOrders:    customers.length
      ? Math.round(customers.reduce((sum, c) => sum + c.orders_count, 0) / customers.length)
      : 0,
  }), [customers]);

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Customer deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers</h1>
            <p className="text-sm text-muted-foreground mt-1">{customers.length} registered customers</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV("customers", filtered.map(c => ({ Name: c.name, Email: c.email, Phone: c.phone ?? "", Status: c.status, Orders: c.orders_count, "Total Spent": c.total_spent })))}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4" /> Add Customer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Customers", value: stats.total,                                                color: "text-primary",  icon: Users      },
            { label: "Active",          value: stats.active,                                               color: "text-success",  icon: TrendingUp },
            { label: "Total Revenue",   value: `$${(stats.totalRevenue / 1000).toFixed(1)}k`,             color: "text-chart-4",  icon: DollarSign },
            { label: "Avg Orders",      value: stats.avgOrders,                                            color: "text-warning",  icon: ShoppingBag },
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

        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="h-10 w-full rounded-lg border border-input bg-input pl-9 pr-4 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Orders</th>
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Spent</th>
                  <th className="px-4 py-3.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3.5 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((c) => (
                    <motion.tr
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b border-border/50 last:border-0 hover:bg-accent/20"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                            {initials(c.name)}
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{c.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">{c.phone ?? "—"}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{c.orders_count}</td>
                      <td className="px-4 py-3.5 font-semibold text-card-foreground">${Number(c.total_spent).toFixed(2)}</td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[c.status] ?? ""}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-primary">
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No customers found</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AddCustomerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardLayout>
  );
}
