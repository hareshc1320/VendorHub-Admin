import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000, orders: 240 },
  { name: "Feb", revenue: 5200, orders: 310 },
  { name: "Mar", revenue: 4800, orders: 280 },
  { name: "Apr", revenue: 6100, orders: 390 },
  { name: "May", revenue: 5400, orders: 320 },
  { name: "Jun", revenue: 7200, orders: 450 },
  { name: "Jul", revenue: 6800, orders: 420 },
  { name: "Aug", revenue: 8100, orders: 510 },
  { name: "Sep", revenue: 7400, orders: 460 },
  { name: "Oct", revenue: 9200, orders: 580 },
  { name: "Nov", revenue: 8600, orders: 540 },
  { name: "Dec", revenue: 10400, orders: 650 },
];

export function RevenueChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-card-foreground">Revenue Overview</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Monthly revenue and order trends</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "oklch(0.55 0.02 260)", fontSize: 12 }}
              axisLine={{ stroke: "oklch(0.25 0.015 260)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0.02 260)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.17 0.02 260)",
                border: "1px solid oklch(0.25 0.015 260)",
                borderRadius: "8px",
                color: "oklch(0.95 0.01 260)",
                fontSize: "13px",
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="oklch(0.65 0.2 250)"
              strokeWidth={2}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
