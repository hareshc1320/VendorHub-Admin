import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Upload, Package, Pencil, Loader2, FileText, FileSpreadsheet, File, CheckCircle2, Trash2 } from "lucide-react";
import { useCreateProduct, useUpdateProduct, uploadFile } from "@/lib/api-hooks";
import { toast } from "sonner";
import type { Product } from "@/lib/mock-data";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
}

const categories = ["Audio", "Wearables", "Accessories", "Peripherals", "Cameras", "Storage", "Uncategorized"];

function FileIcon({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) return <Upload className="h-8 w-8 text-primary" />;
  if (mime === "application/pdf") return <FileText className="h-8 w-8 text-red-500" />;
  if (mime.includes("csv") || mime.includes("excel") || mime.includes("spreadsheet"))
    return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setPrice(product ? String(product.price) : "");
      setStock(product ? String(product.stock) : "");
      setDescription(product?.description ?? "");
      setCategory(product?.category ?? "");
      setImageUrl(product?.image_url ?? null);
      setSelectedFile(null);
      setPreview(product?.image_url ?? null);
    }
  }, [open, product]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large — maximum size is 20 MB");
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    setUploading(true);
    try {
      const result = await uploadFile(file);
      setImageUrl(result.url);
      toast.success("File uploaded");
    } catch (err) {
      toast.error((err as Error).message);
      setSelectedFile(null);
      setPreview(isEdit ? (product?.image_url ?? null) : null);
    } finally {
      setUploading(false);
    }
  }, [isEdit, product]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function clearFile() {
    setSelectedFile(null);
    setPreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function reset() {
    setName(""); setPrice(""); setStock(""); setDescription(""); setCategory("");
    setImageUrl(null); setSelectedFile(null); setPreview(null);
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

    if (uploading) {
      toast.error("Please wait for the file to finish uploading");
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
          image_url: imageUrl,
        });
        toast.success("Product updated");
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          price: numPrice,
          stock: isNaN(numStock) ? 0 : numStock,
          description: description.trim() || null,
          category,
          image_url: imageUrl,
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

              {/* File Upload */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-card-foreground">
                  Product File
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">(image, PDF, CSV, or any file — max 20 MB)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  className="hidden"
                  onChange={handleInputChange}
                />

                {selectedFile || preview ? (
                  <div className="rounded-lg border border-border bg-accent/10 p-4">
                    <div className="flex items-start gap-3">
                      {/* Image preview or file icon */}
                      {preview && selectedFile?.type.startsWith("image/") ? (
                        <img
                          src={preview}
                          alt="preview"
                          className="h-16 w-16 rounded-lg object-cover shrink-0 border border-border"
                        />
                      ) : preview && !selectedFile ? (
                        /* existing image from edit */
                        <img
                          src={preview}
                          alt="current"
                          className="h-16 w-16 rounded-lg object-cover shrink-0 border border-border"
                        />
                      ) : selectedFile ? (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-accent/40 border border-border">
                          <FileIcon mime={selectedFile.type} />
                        </div>
                      ) : null}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {selectedFile?.name ?? "Current file"}
                        </p>
                        {selectedFile && (
                          <p className="text-xs text-muted-foreground mt-0.5">{formatSize(selectedFile.size)}</p>
                        )}
                        {uploading ? (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                            <span className="text-xs text-primary">Uploading…</span>
                          </div>
                        ) : imageUrl ? (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            <span className="text-xs text-success">Uploaded</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors
                      ${dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border bg-accent/20 hover:border-primary/50 hover:bg-accent/40"
                      }
                    `}
                  >
                    <Upload className={`h-8 w-8 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or{" "}
                      <span className="font-medium text-primary">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Any file type · PNG, JPG, PDF, CSV, ZIP… · Max 20 MB
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground hover:bg-accent">
                  Cancel
                </button>
                <button type="submit" disabled={mutation.isPending || uploading}
                  className="h-10 inline-flex items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70">
                  {(mutation.isPending || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
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
