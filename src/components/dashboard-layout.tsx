import type { ReactNode } from "react";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";
import { SidebarNav } from "@/components/sidebar-nav";
import { TopNavbar } from "@/components/top-navbar";

function LayoutInner({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useDashboard();

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div
        className={`flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-64" : "md:ml-[72px]"
        }`}
      >
        <TopNavbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
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
