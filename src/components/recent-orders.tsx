import { INITIAL_ORDERS } from "@/lib/mock-data";

const statusStyles: Record<string, string> = {
  delivered:  "bg-success/15 text-success",
  processing: "bg-info/15 text-info",
  shipped:    "bg-warning/15 text-warning",
  cancelled:  "bg-destructive/15 text-destructive",
};

export function RecentOrders() {
  const recent = INITIAL_ORDERS.slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">Recent Orders</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Latest transactions</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left font-medium text-muted-foreground">Order</th>
              <th className="pb-3 text-left font-medium text-muted-foreground">Customer</th>
              <th className="pb-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((order) => (
              <tr key={order.id} className="border-b border-border/50 last:border-0">
                <td className="py-3 font-medium text-card-foreground">{order.order_number}</td>
                <td className="py-3 text-muted-foreground">{order.customer_name}</td>
                <td className="py-3 font-medium text-card-foreground">
                  ${Number(order.total).toFixed(2)}
                </td>
                <td className="py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[order.status] ?? ""}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
