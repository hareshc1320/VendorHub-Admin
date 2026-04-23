import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingBag, ClipboardList, Users, Settings,
  ChevronLeft, ChevronRight, Store, LogOut, Tag, BarChart3, Bell,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard",     path: "/",               icon: LayoutDashboard },
  { label: "Products",      path: "/products",       icon: ShoppingBag     },
  { label: "Orders",        path: "/orders",         icon: ClipboardList   },
  { label: "Customers",     path: "/customers",      icon: Users           },
  { label: "Reports",       path: "/reports",        icon: BarChart3       },
  { label: "Pricing",       path: "/pricing",        icon: Tag             },
  { label: "Notifications", path: "/notifications",  icon: Bell            },
  { label: "Settings",      path: "/settings",       icon: Settings        },
];

export function SidebarNav() {
  const { sidebarOpen, toggleSidebar } = useDashboard();
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/login" });
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar
          transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? "w-64" : "w-0 md:w-[72px]"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <span className="text-base font-semibold text-sidebar-accent-foreground tracking-tight">
              VendorHub
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                      transition-all duration-150
                      ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }
                    `}
                  >
                    <item.icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                      }`}
                    />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
          <div className="hidden md:block">
            <button
              onClick={toggleSidebar}
              className="flex w-full items-center justify-center rounded-lg py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
