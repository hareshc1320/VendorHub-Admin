import { useRef, useEffect } from "react";
import { Menu, Bell, Search, ShoppingBag, Star, TrendingUp, UserPlus, X, Sun, Moon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useDashboard } from "@/lib/dashboard-context";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import {
  useNotifications,
  useMarkAllNotificationsRead,
  useDismissNotification,
  type Notification,
} from "@/lib/api-hooks";
import { useState } from "react";

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  order:    { icon: ShoppingBag, color: "text-blue-400 bg-blue-500/10"      },
  review:   { icon: Star,        color: "text-amber-400 bg-amber-500/10"    },
  revenue:  { icon: TrendingUp,  color: "text-emerald-400 bg-emerald-500/10" },
  customer: { icon: UserPlus,    color: "text-purple-400 bg-purple-500/10"  },
  info:     { icon: Bell,        color: "text-gray-400 bg-gray-500/10"      },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export function TopNavbar() {
  const { toggleSidebar } = useDashboard();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications();
  const markAllMutation    = useMarkAllNotificationsRead();
  const dismissMutation    = useDismissNotification();

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    markAllMutation.mutate();
  }

  function dismiss(id: string) {
    dismissMutation.mutate(id);
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden sm:flex flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search anything…"
          className="h-9 w-full rounded-lg border border-input bg-input pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Mobile search icon */}
        <button className="sm:hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
          <Search className="h-5 w-5" />
        </button>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={toggleTheme}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "dark" ? (
              <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Sun className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Moon className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowNotif((p) => !p)}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Bell className="h-5 w-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1rem)] rounded-2xl border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-card-foreground">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                  <AnimatePresence initial={false}>
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((n: Notification) => {
                        const cfg = typeConfig[n.type] ?? typeConfig.info;
                        const Icon = cfg.icon;
                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`group flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-colors relative ${
                              !n.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className={`text-sm font-medium leading-tight ${!n.read ? "text-card-foreground" : "text-muted-foreground"}`}>
                                  {n.title}
                                </p>
                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.desc}</p>
                              <p className="text-[11px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                            </div>
                            <button
                              onClick={() => dismiss(n.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground transition-all shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-border bg-accent/10">
                    <button
                      onClick={() => { setShowNotif(false); navigate({ to: "/notifications" }); }}
                      className="w-full text-xs text-center text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground leading-none">Admin User</p>
            <p className="text-xs text-muted-foreground mt-0.5">admin@vendorhub.io</p>
          </div>
        </div>
      </div>
    </header>
  );
}
