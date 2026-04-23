import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Check, Pencil, X, Save, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePricingPlans, useUpdatePricingPlan, type PricingPlan } from "@/lib/api-hooks";

type EditState = {
  name: string;
  price: string;
  yearly_price: string;
  description: string;
  features: string;
};

export function PricingPage() {
  const { data: plans = [], isLoading } = usePricingPlans();
  const updateMutation = useUpdatePricingPlan();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", price: "", yearly_price: "", description: "", features: "" });

  function startEdit(plan: PricingPlan) {
    setEditingId(plan.id);
    setEditState({
      name: plan.name,
      price: String(plan.price),
      yearly_price: String(plan.yearly_price),
      description: plan.description,
      features: plan.features.join("\n"),
    });
  }

  function cancelEdit() { setEditingId(null); }

  async function saveEdit(id: string) {
    const price = parseFloat(editState.price);
    const yearly_price = parseFloat(editState.yearly_price);
    if (isNaN(price) || price < 0) { toast.error("Invalid price"); return; }
    try {
      await updateMutation.mutateAsync({
        id,
        name: editState.name.trim(),
        price,
        yearly_price: isNaN(yearly_price) ? 0 : yearly_price,
        description: editState.description.trim(),
        features: editState.features.split("\n").map(f => f.trim()).filter(Boolean),
      });
      setEditingId(null);
      toast.success("Plan updated");
    } catch {
      toast.error("Failed to update plan");
    }
  }

  async function toggleActive(plan: PricingPlan) {
    try {
      await updateMutation.mutateAsync({ id: plan.id, active: !plan.active });
      toast.success(`${plan.name} plan ${plan.active ? "disabled" : "enabled"}`);
    } catch {
      toast.error("Failed to update plan");
    }
  }

  const totalSubscribers = plans.reduce((s, p) => s + p.subscribers, 0);
  const activeRevenue = plans
    .filter(p => p.active && p.price > 0)
    .reduce((s, p) => s + p.price * p.subscribers, 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pricing Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage plans shown on your marketing website
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">Total Subscribers</p>
            <p className="text-lg font-bold text-foreground">{totalSubscribers.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
            <p className="text-lg font-bold text-foreground">${activeRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const isEditing = editingId === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-xl border bg-card flex flex-col transition-all ${
                  plan.active ? "border-border" : "border-border opacity-60"
                } ${plan.highlight ? "ring-1 ring-primary/40" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 flex-1">
                  {/* Plan header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {isEditing ? (
                        <input
                          value={editState.name}
                          onChange={e => setEditState(s => ({ ...s, name: e.target.value }))}
                          className="w-32 rounded-md border border-border bg-muted px-2 py-1 text-sm font-semibold text-foreground"
                        />
                      ) : (
                        <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(plan.id)} disabled={updateMutation.isPending} className="rounded-lg p-1.5 text-success hover:bg-success/10 transition-colors">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEdit} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(plan)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleActive(plan)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                              plan.active
                                ? "bg-success/15 text-success hover:bg-destructive/15 hover:text-destructive"
                                : "bg-destructive/15 text-destructive hover:bg-success/15 hover:text-success"
                            }`}
                          >
                            {plan.active ? "Active" : "Disabled"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-muted-foreground w-20">Monthly $</span>
                          <input type="number" min="0" value={editState.price}
                            onChange={e => setEditState(s => ({ ...s, price: e.target.value }))}
                            className="w-24 rounded-md border border-border bg-muted px-2 py-1 text-sm font-bold text-foreground" />
                        </div>
                        {plan.period === "month" && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-muted-foreground w-20">Yearly $</span>
                            <input type="number" min="0" value={editState.yearly_price}
                              onChange={e => setEditState(s => ({ ...s, yearly_price: e.target.value }))}
                              className="w-24 rounded-md border border-border bg-muted px-2 py-1 text-sm font-bold text-foreground" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-foreground">
                          {plan.price === 0 ? "Free" : `$${plan.price}`}
                        </span>
                        {plan.price > 0 && <span className="text-sm text-muted-foreground mb-1">/{plan.period}</span>}
                        {plan.yearly_price > 0 && (
                          <span className="text-xs text-muted-foreground mb-1.5 ml-1">(${plan.yearly_price}/mo yearly)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {isEditing ? (
                    <input value={editState.description}
                      onChange={e => setEditState(s => ({ ...s, description: e.target.value }))}
                      className="w-full rounded-md border border-border bg-muted px-2 py-1 text-sm text-muted-foreground mb-4" />
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  )}

                  {/* Subscribers */}
                  <div className="flex items-center gap-1.5 mb-4 rounded-lg bg-muted/50 px-3 py-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{plan.subscribers.toLocaleString()}</span> subscribers
                    </span>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Features</p>
                    {isEditing ? (
                      <textarea value={editState.features}
                        onChange={e => setEditState(s => ({ ...s, features: e.target.value }))}
                        rows={6} placeholder="One feature per line"
                        className="w-full rounded-md border border-border bg-muted px-2 py-1.5 text-sm text-foreground resize-none" />
                    ) : (
                      <ul className="space-y-2">
                        {plan.features.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Changes here update the plans displayed on the marketing website in real-time.
      </p>
    </DashboardLayout>
  );
}
