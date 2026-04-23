import { createRouter, createRoute, createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { IndexPage }     from "@/routes/index";
import { ProductsPage }  from "@/routes/products";
import { OrdersPage }    from "@/routes/orders";
import { CustomersPage } from "@/routes/customers";
import { SettingsPage }  from "@/routes/settings";
import { PricingPage }        from "@/routes/pricing";
import { NotificationsPage }  from "@/routes/notifications";
import { ReportsPage }        from "@/routes/reports";
import { LoginPage }          from "@/routes/login";

const rootRoute = createRootRoute({ component: Outlet });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <AuthGuard><IndexPage /></AuthGuard>,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: () => <AuthGuard><ProductsPage /></AuthGuard>,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: () => <AuthGuard><OrdersPage /></AuthGuard>,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customers",
  component: () => <AuthGuard><CustomersPage /></AuthGuard>,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => <AuthGuard><SettingsPage /></AuthGuard>,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pricing",
  component: () => <AuthGuard><PricingPage /></AuthGuard>,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: () => <AuthGuard><NotificationsPage /></AuthGuard>,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: () => <AuthGuard><ReportsPage /></AuthGuard>,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  ordersRoute,
  customersRoute,
  settingsRoute,
  pricingRoute,
  notificationsRoute,
  reportsRoute,
  loginRoute,
]);

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
