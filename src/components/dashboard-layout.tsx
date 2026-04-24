import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";
import { SidebarNav } from "@/components/sidebar-nav";
import { TopNavbar } from "@/components/top-navbar";

function LayoutInner({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useDashboard();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div
        className={`flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-64" : "md:ml-[72px]"
        }`}
      >
        <TopNavbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <LayoutInner>{children}</LayoutInner>
    </DashboardProvider>
  );
}
