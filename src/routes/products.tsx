import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AddProductModal } from "@/components/add-product-modal";
import { Search, Plus, Pencil, Trash2, Filter, Package, ChevronDown, Download } from "lucide-react";
import { exportCSV } from "@/lib/csv-export";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts, useDeleteProduct } from "@/lib/api-hooks";
import { toast } from "sonner";
import type { Product } from "@/lib/mock-data";

const allCategories = ["All", "Audio", "Wearables", "Accessories", "Peripherals", "Cameras", "Storage", "Uncategorized"];

function getStatus(stock: number) {
  if (stock === 0) return { label: "Out of Stock", style: "bg-destructive/15 text-destructive" };
  if (stock < 10)  return { label: "Low Stock",    style: "bg-warning/15 text-warning"         };
  return               { label: "In Stock",       style: "bg-success/15 text-success"          };
}

export function ProductsPage() {
  const { data: products = [] } = useProducts();
  const deleteMutation = useDeleteProduct();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Product deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {products.length} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => exportCSV("products", filtered.map(p => ({ Name: p.name, Category: p.category, Price: p.price, Stock: p.stock, Description: p.description ?? "" })))}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Download className="h-4 w-4" /> Export CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setEditingProduct(undefined); setModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Product
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full rounded-lg border border-input bg-input pl-9 pr-4 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-input pl-9 pr-8 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
          >
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3.5 text-left font-medium text-muted-foreground hidden md:table-cell">Stock</th>
                <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3.5 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((p) => {
                  const status = getStatus(p.stock);
                  return (
                    <motion.tr
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-border/50 last:border-0 hover:bg-accent/20"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/40 text-lg">
                              📦
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-card-foreground leading-tight">{p.name}</p>
                            <p className="text-xs text-muted-foreground sm:hidden mt-0.5">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/40 px-2 py-0.5 text-xs font-medium text-card-foreground">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-card-foreground">
                        ${Number(p.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">{p.stock} units</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.style}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => { setEditingProduct(p); setModalOpen(true); }}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No products found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Add your first product to get started</p>
            </div>
          )}
        </div>
      </div>

      <AddProductModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProduct(undefined); }}
        product={editingProduct}
      />
    </DashboardLayout>
  );
}
