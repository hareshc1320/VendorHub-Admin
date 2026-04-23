import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShoppingBag, Star, TrendingUp, UserPlus, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications, useMarkAllNotificationsRead, useDismissNotification, type Notification } from "@/lib/api-hooks";
import { toast } from "sonner";

const typeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  order:    { icon: ShoppingBag, color: "text-blue-400 bg-blue-500/10",      label: "Orders"   },
  review:   { icon: Star,        color: "text-amber-400 bg-amber-500/10",    label: "Reviews"  },
  revenue:  { icon: TrendingUp,  color: "text-emerald-400 bg-emerald-500/10", label: "Revenue"  },
  customer: { icon: UserPlus,    color: "text-purple-400 bg-purple-500/10",  label: "Customers"},
  info:     { icon: Bell,        color: "text-gray-400 bg-gray-500/10",      label: "Info"     },
};

const FILTERS = ["All", "Unread", "Orders", "Reviews", "Revenue", "Customers"] as const;
type Filter = typeof FILTERS[number];

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export function NotificationsPage() {
  const { data: notifications = [] } = useNotifications();
  const markAllMutation  = useMarkAllNotificationsRead();
  const dismissMutation  = useDismissNotification();
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = notifications.filter(n => {
    if (filter === "All")      return true;
    if (filter === "Unread")   return !n.read;
    return n.type === filter.toLowerCase().slice(0, -1) || n.type === filter.toLowerCase();
  });

  const unread = notifications.filter(n => !n.read).length;

  async function handleMarkAll() {
    await markAllMutation.mutateAsync();
    toast.success("All notifications marked as read");
  }

  async function handleDismiss(id: string) {
    await dismissMutation.mutateAsync(id);
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {f}
            {f === "Unread" && unread > 0 && (
              <span className="ml-1.5 text-[10px] font-bold bg-primary-foreground/20 px-1 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((n: Notification, i) => {
              const cfg = typeConfig[n.type] ?? typeConfig.info;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`group flex items-start gap-4 px-5 py-4 hover:bg-accent/30 transition-colors relative ${
                    i !== 0 ? "border-t border-border/50" : ""
                  } ${!n.read ? "bg-primary/[0.03]" : ""}`}
                >
                  {!n.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full" />
                  )}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-medium ${!n.read ? "text-card-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                        <button
                          onClick={() => handleDismiss(n.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
}
