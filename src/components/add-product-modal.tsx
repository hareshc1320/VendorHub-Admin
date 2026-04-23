import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Upload, Package, Pencil, Loader2 } from "lucide-react";
import { useCreateProduct, useUpdateProduct } from "@/lib/api-hooks";
import { toast } from "sonner";
import type { Product } from "@/lib/mock-data";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
}

const categories = ["Audio", "Wearables", "Accessories", "Peripherals", "Cameras", "Storage", "Uncategorized"];

export function AddProductModal({ open, onClose, product }: AddProductModalProps) {
  const isEdit = !!product;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const mutation = isEdit ? updateMutation : createMutation;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setPrice(product ? String(product.price) : "");
      setStock(product ? String(product.stock) : "");
      setDescription(product?.description ?? "");
      setCategory(product?.category ?? "");
    }
  }, [open, product]);

  function reset() {
    setName(""); setPrice(""); setStock(""); setDescription(""); setCategory("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !category) return;

    const numPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
    const numStock = parseInt(stock || "0", 10);

    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Enter a valid price");
      return;
    }

    try {
      if (isEdit && product) {
        await updateMutation.mutateAsync({
          id: product.id,
          name: name.trim(),
          price: numPrice,
          stock: isNaN(numStock) ? 0 : numStock,
          description: description.trim() || null,
          category,
        });
        toast.success("Product updated");
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          price: numPrice,
          stock: isNaN(numStock) ? 0 : numStock,
          description: description.trim() || null,
          category,
        });
        toast.success("Product added");
      }
      reset();
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  {isEdit ? <Pencil className="h-5 w-5 text-primary" /> : <Package className="h-5 w-5 text-primary" />}
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  {isEdit ? "Edit Product" : "Add New Product"}
                </h2>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">Product Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Headphones Pro"
                  maxLength={200}
                  className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-card-foreground">Price (USD)</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                    className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-card-foreground">Stock</label>
                  <input
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    inputMode="numeric"
                    className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring appearance-none"
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief product description…"
                  rows={3}
                  maxLength={2000}
                  className="w-full rounded-lg border border-input bg-input px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring resize-none"
                />
              </div>

              {!isEdit && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-card-foreground">Product Image</label>
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-accent/20 px-4 py-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or <span className="font-medium text-primary">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground/70">PNG, JPG up to 5 MB</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground hover:bg-accent">
                  Cancel
                </button>
                <button type="submit" disabled={mutation.isPending}
                  className="h-10 inline-flex items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70">
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEdit ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
