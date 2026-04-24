export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string | null;
  image_url: string | null;
  owner_id: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  orders_count: number;
  total_spent: number;
  status: string;
  owner_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  items_count: number;
  owner_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  store_name: string | null;
  bio: string | null;
}

export const INITIAL_PRODUCTS: Product[] = [
  { id: "p1", name: "Wireless Noise-Cancelling Headphones", price: 299.99, stock: 42, category: "Audio", description: "Premium audio with ANC", image_url: null, owner_id: "mock", created_at: "2026-01-15T10:00:00Z" },
  { id: "p2", name: "Smart Fitness Tracker Pro", price: 149.99, stock: 8, category: "Wearables", description: "Track your health goals", image_url: null, owner_id: "mock", created_at: "2026-01-20T09:00:00Z" },
  { id: "p3", name: "USB-C Hub 10-in-1", price: 79.99, stock: 0, category: "Accessories", description: "Expand your connectivity", image_url: null, owner_id: "mock", created_at: "2026-02-01T08:00:00Z" },
  { id: "p4", name: "Mechanical Keyboard RGB", price: 189.99, stock: 23, category: "Peripherals", description: "Tactile typing experience", image_url: null, owner_id: "mock", created_at: "2026-02-10T11:00:00Z" },
  { id: "p5", name: "4K Webcam Pro", price: 129.99, stock: 5, category: "Cameras", description: "Crystal clear video calls", image_url: null, owner_id: "mock", created_at: "2026-02-20T13:00:00Z" },
  { id: "p6", name: "Portable SSD 1TB", price: 99.99, stock: 67, category: "Storage", description: "Fast and compact storage", image_url: null, owner_id: "mock", created_at: "2026-03-01T10:00:00Z" },
  { id: "p7", name: "Wireless Charging Pad", price: 49.99, stock: 0, category: "Accessories", description: "Qi-certified fast charging", image_url: null, owner_id: "mock", created_at: "2026-03-10T14:00:00Z" },
  { id: "p8", name: "True Wireless Earbuds", price: 199.99, stock: 31, category: "Audio", description: "12h battery + ANC", image_url: null, owner_id: "mock", created_at: "2026-03-15T09:00:00Z" },
  { id: "p9", name: "Smart Watch Series X", price: 399.99, stock: 14, category: "Wearables", description: "Premium health tracking", image_url: null, owner_id: "mock", created_at: "2026-04-01T10:00:00Z" },
  { id: "p10", name: "Gaming Mouse Pro", price: 89.99, stock: 55, category: "Peripherals", description: "16000 DPI precision", image_url: null, owner_id: "mock", created_at: "2026-04-10T11:00:00Z" },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Aarav Shah", email: "aarav.shah@example.com", phone: "+91-98765-43210", orders_count: 8, total_spent: 2349.92, status: "vip", owner_id: "mock", created_at: "2026-01-05T00:00:00Z" },
  { id: "c2", name: "Priya Mehta", email: "priya.mehta@example.com", phone: "+91-87654-32109", orders_count: 5, total_spent: 899.95, status: "active", owner_id: "mock", created_at: "2026-01-12T00:00:00Z" },
  { id: "c3", name: "Rohan Verma", email: "rohan.verma@example.com", phone: null, orders_count: 2, total_spent: 379.98, status: "active", owner_id: "mock", created_at: "2026-02-01T00:00:00Z" },
  { id: "c4", name: "Sneha Patel", email: "sneha.patel@example.com", phone: "+91-76543-21098", orders_count: 12, total_spent: 4199.88, status: "vip", owner_id: "mock", created_at: "2026-01-08T00:00:00Z" },
  { id: "c5", name: "Karan Joshi", email: "karan.joshi@example.com", phone: "+91-65432-10987", orders_count: 1, total_spent: 149.99, status: "active", owner_id: "mock", created_at: "2026-03-05T00:00:00Z" },
  { id: "c6", name: "Anita Sharma", email: "anita.sharma@example.com", phone: null, orders_count: 0, total_spent: 0, status: "inactive", owner_id: "mock", created_at: "2026-03-20T00:00:00Z" },
  { id: "c7", name: "Vikram Singh", email: "vikram.singh@example.com", phone: "+91-54321-09876", orders_count: 6, total_spent: 1549.94, status: "vip", owner_id: "mock", created_at: "2026-02-14T00:00:00Z" },
  { id: "c8", name: "Divya Nair", email: "divya.nair@example.com", phone: "+91-43210-98765", orders_count: 3, total_spent: 529.97, status: "active", owner_id: "mock", created_at: "2026-03-01T00:00:00Z" },
];

export const INITIAL_ORDERS: Order[] = [
  { id: "o1", order_number: "ORD-1024", customer_name: "Aarav Shah", total: 299.99, status: "delivered", items_count: 1, owner_id: "mock", created_at: "2026-04-18T08:00:00Z" },
  { id: "o2", order_number: "ORD-1023", customer_name: "Priya Mehta", total: 149.99, status: "shipped", items_count: 1, owner_id: "mock", created_at: "2026-04-17T10:00:00Z" },
  { id: "o3", order_number: "ORD-1022", customer_name: "Rohan Verma", total: 79.99, status: "processing", items_count: 1, owner_id: "mock", created_at: "2026-04-17T14:00:00Z" },
  { id: "o4", order_number: "ORD-1021", customer_name: "Sneha Patel", total: 589.98, status: "delivered", items_count: 3, owner_id: "mock", created_at: "2026-04-16T09:00:00Z" },
  { id: "o5", order_number: "ORD-1020", customer_name: "Karan Joshi", total: 149.99, status: "processing", items_count: 1, owner_id: "mock", created_at: "2026-04-16T16:00:00Z" },
  { id: "o6", order_number: "ORD-1019", customer_name: "Vikram Singh", total: 399.99, status: "shipped", items_count: 2, owner_id: "mock", created_at: "2026-04-15T11:00:00Z" },
  { id: "o7", order_number: "ORD-1018", customer_name: "Divya Nair", total: 229.98, status: "delivered", items_count: 2, owner_id: "mock", created_at: "2026-04-14T13:00:00Z" },
  { id: "o8", order_number: "ORD-1017", customer_name: "Aarav Shah", total: 189.99, status: "cancelled", items_count: 1, owner_id: "mock", created_at: "2026-04-13T09:00:00Z" },
  { id: "o9", order_number: "ORD-1016", customer_name: "Sneha Patel", total: 499.97, status: "delivered", items_count: 4, owner_id: "mock", created_at: "2026-04-12T10:00:00Z" },
  { id: "o10", order_number: "ORD-1015", customer_name: "Priya Mehta", total: 99.99, status: "delivered", items_count: 1, owner_id: "mock", created_at: "2026-04-11T14:00:00Z" },
];

export const MOCK_PROFILE: Profile = {
  id: "mock-admin-id",
  full_name: "Admin User",
  store_name: "VendorHub Store",
  bio: "Managing the VendorHub multi-vendor marketplace.",
};
