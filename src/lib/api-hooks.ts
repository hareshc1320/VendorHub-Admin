import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Product, Customer, Order, Profile } from "@/lib/mock-data";

// Prisma returns camelCase createdAt — map to snake_case for frontend compatibility
function normalizeDate<T extends { createdAt?: string; created_at?: string }>(item: T): T & { created_at: string } {
  return { ...item, created_at: item.created_at ?? item.createdAt ?? "" };
}

// ===== PRODUCTS =====
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const data = await apiFetch<Product[]>("/products");
      return data.map(normalizeDate);
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Product, "id" | "owner_id" | "created_at">) =>
      apiFetch<Product>("/products", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export async function uploadFile(file: File): Promise<{ url: string; name: string; mimetype: string }> {
  const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
  const token = localStorage.getItem("vendorhub_token");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(body.error ?? "Upload failed");
  }
  return res.json();
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<Product>) =>
      apiFetch<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

// ===== CUSTOMERS =====
export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const data = await apiFetch<Customer[]>("/customers");
      return data.map(normalizeDate);
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Customer, "id" | "owner_id" | "created_at" | "orders_count" | "total_spent">) =>
      apiFetch<Customer>("/customers", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

// ===== ORDERS =====
export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const data = await apiFetch<Order[]>("/orders");
      return data.map(normalizeDate);
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Order, "id" | "owner_id" | "created_at">) =>
      apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<Order>) =>
      apiFetch<Order>(`/orders/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/orders/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

// ===== PROFILE =====
export function useProfile() {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: () => apiFetch<Profile>("/profile"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Profile>) =>
      apiFetch<Profile>("/profile", { method: "PUT", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// ===== DASHBOARD STATS =====
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () =>
      apiFetch<{
        productCount: number;
        customerCount: number;
        orderCount: number;
        totalRevenue: number;
        pendingOrders: number;
      }>("/dashboard/stats"),
  });
}

// ===== DASHBOARD REVENUE CHART =====
export function useDashboardRevenue(period: string) {
  return useQuery<{ name: string; revenue: number; orders: number }[]>({
    queryKey: ["dashboard-revenue", period],
    queryFn: () =>
      apiFetch(`/dashboard/revenue?period=${period}`),
  });
}

// ===== DASHBOARD REPORTS =====
export function useDashboardReports(enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard-reports"],
    queryFn: () =>
      apiFetch<{
        kpis: { totalRevenue: number; totalOrders: number; newCustomers: number; productsSold: number };
        monthlyRevenue: { month: string; revenue: number }[];
        categoryData: { name: string; value: number }[];
        performance: { avgOrderValue: number; conversionRate: number; retention: number; returnRate: number };
      }>("/dashboard/reports"),
    enabled,
  });
}

// ===== NOTIFICATIONS =====
export interface Notification {
  id: string;
  title: string;
  desc: string;
  type: string;
  read: boolean;
  owner_id: string;
  createdAt: string;
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<Notification[]>("/notifications"),
    refetchInterval: 60_000, // refresh every 60s
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/notifications/read-all", { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDismissNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ===== REVIEWS =====
export interface Review {
  id: string;
  customer_name: string;
  product_name: string;
  rating: number;
  comment: string | null;
  status: string;
  owner_id: string;
  createdAt: string;
}

export function useReviews() {
  return useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: () => apiFetch<Review[]>("/reviews"),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Review, "id" | "owner_id" | "createdAt">) =>
      apiFetch<Review>("/reviews", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<Review>) =>
      apiFetch<Review>(`/reviews/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

// ===== PRICING PLANS =====
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  yearly_price: number;
  period: string;
  description: string;
  badge: string | null;
  highlight: boolean;
  active: boolean;
  subscribers: number;
  features: string[];
  sort_order: number;
}

export function usePricingPlans() {
  return useQuery<PricingPlan[]>({
    queryKey: ["pricing-plans"],
    queryFn: () => apiFetch<PricingPlan[]>("/pricing/all"),
  });
}

export function useUpdatePricingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<PricingPlan>) =>
      apiFetch<PricingPlan>(`/pricing/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pricing-plans"] }),
  });
}
