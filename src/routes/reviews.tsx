import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Eye, EyeOff, Clock, CheckCircle, Search } from "lucide-react";
import { useReviews, useUpdateReview, useDeleteReview, useCreateReview, type Review } from "@/lib/api-hooks";
import { toast } from "sonner";

const FILTERS = ["All", "Published", "Pending", "Hidden"] as const;
type Filter = typeof FILTERS[number];

const STATUS_CONFIG = {
  published: { label: "Published", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  pending:   { label: "Pending",   color: "text-amber-400 bg-amber-500/10 border-amber-500/20",     icon: Clock       },
  hidden:    { label: "Hidden",    color: "text-slate-400 bg-slate-500/10 border-slate-500/20",      icon: EyeOff      },
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${sz} ${i <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AddReviewModal({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateReview();
  const [form, setForm] = useState({ customer_name: "", product_name: "", rating: 5, comment: "", status: "published" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      toast.success("Review added");
      onClose();
    } catch {
      toast.error("Failed to add review");
    }
  }

  const inputCls = "h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h2 className="text-lg font-bold text-foreground mb-5">Add Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Customer Name *</label>
            <input required value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
              placeholder="e.g. Aarav Shah" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Product Name *</label>
            <input required value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
              placeholder="e.g. Wireless Headphones" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, rating: r }))}>
                  <Star className={`w-7 h-7 transition-colors ${r <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30 hover:text-yellow-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Comment</label>
            <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={3} placeholder="Customer's review comment..."
              className="w-full rounded-lg border border-input bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className={`${inputCls} cursor-pointer`}>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {createMutation.isPending ? "Adding..." : "Add Review"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function ReviewsPage() {
  const { data: reviews = [], isLoading } = useReviews();
  const updateMutation = useUpdateReview();
  const deleteMutation = useDeleteReview();
  const [filter, setFilter]     = useState<Filter>("All");
  const [search, setSearch]     = useState("");
  const [showAdd, setShowAdd]   = useState(false);

  const filtered = reviews.filter(r => {
    const matchFilter =
      filter === "All"       ? true :
      filter === "Published" ? r.status === "published" :
      filter === "Pending"   ? r.status === "pending"   :
                               r.status === "hidden";
    const matchSearch = search === "" ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.product_name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const avgRating  = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const totalStars = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));

  async function handleStatusChange(review: Review, status: string) {
    try {
      await updateMutation.mutateAsync({ id: review.id, status });
      toast.success(`Review ${status}`);
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <DashboardLayout>
      <AnimatePresence>
        {showAdd && <AddReviewModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Reviews</h1>
            <p className="text-sm text-muted-foreground mt-1">{reviews.length} total reviews</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Star className="h-4 w-4" />
            Add Review
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground mb-1">Average Rating</p>
            <p className="text-3xl font-black text-foreground">{avgRating}</p>
            <StarRating rating={Math.round(Number(avgRating))} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground mb-1">Total Reviews</p>
            <p className="text-3xl font-black text-foreground">{reviews.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{reviews.filter(r => r.status === "published").length} published</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground mb-2">Rating Breakdown</p>
            <div className="space-y-1">
              {totalStars.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-3">{star}</span>
                  <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-1.5 rounded-full bg-accent overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full"
                      style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-3">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground mb-3">By Status</p>
            <div className="space-y-2">
              {(["published", "pending", "hidden"] as const).map(s => {
                const cfg = STATUS_CONFIG[s];
                const Icon = cfg.icon;
                return (
                  <div key={s} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3 h-3 ${cfg.color.split(" ")[0]}`} />
                      <span className="text-xs text-muted-foreground capitalize">{s}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {reviews.filter(r => r.status === s).length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}>
                {f}
                {f !== "All" && (
                  <span className="ml-1.5 text-[10px]">
                    {reviews.filter(r => r.status === f.toLowerCase()).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="h-9 w-full sm:w-64 rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Reviews list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="space-y-px">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 px-5 py-4 border-b border-border/50 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-accent/40 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-accent/40 animate-pulse" />
                    <div className="h-3 w-64 rounded bg-accent/40 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Star className="h-12 w-12 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No reviews found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try a different filter or add a new review</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((review, i) => {
                const cfg = STATUS_CONFIG[review.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`group flex items-start gap-4 px-5 py-4 hover:bg-accent/20 transition-colors ${
                      i !== 0 ? "border-t border-border/50" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {review.customer_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="text-sm font-semibold text-foreground">{review.customer_name}</span>
                          <span className="text-muted-foreground text-xs mx-1.5">on</span>
                          <span className="text-sm text-muted-foreground">{review.product_name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-muted-foreground/60">{timeAgo(review.createdAt)}</span>
                        </div>
                      </div>

                      <StarRating rating={review.rating} />

                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>

                        {review.status !== "published" && (
                          <button onClick={() => handleStatusChange(review, "published")}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-0.5 rounded-full border border-emerald-500/20 hover:bg-emerald-500/10">
                            <Eye className="w-3 h-3" /> Publish
                          </button>
                        )}
                        {review.status !== "hidden" && (
                          <button onClick={() => handleStatusChange(review, "hidden")}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-300 transition-colors px-2 py-0.5 rounded-full border border-slate-500/20 hover:bg-slate-500/10">
                            <EyeOff className="w-3 h-3" /> Hide
                          </button>
                        )}
                        {review.status !== "pending" && (
                          <button onClick={() => handleStatusChange(review, "pending")}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors px-2 py-0.5 rounded-full border border-amber-500/20 hover:bg-amber-500/10">
                            <Clock className="w-3 h-3" /> Pending
                          </button>
                        )}
                        <button onClick={() => handleDelete(review.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-[11px] font-medium text-destructive hover:text-destructive/80 transition-all px-2 py-0.5 rounded-full border border-destructive/20 hover:bg-destructive/10">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Showing {filtered.length} of {reviews.length} reviews
          </p>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
