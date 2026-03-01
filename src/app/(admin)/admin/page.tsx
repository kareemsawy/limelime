import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { unstable_cache } from "next/cache";

interface RevenueDay { date: string; revenue: number; orders: number; }

const getDashboardData = unstable_cache(async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [revenueAgg, orderCount, recentOrders] = await Promise.all([
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: thirtyDaysAgo } }, _sum: { total: true }, _count: true }),
    db.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, orderNumber: true, email: true, total: true, status: true, createdAt: true } }),
  ]);

  const lowStockResult = await db.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Variant" WHERE stock <= "lowStockAt" AND stock >= 0`;
  const lowStock = Number(lowStockResult[0]?.count ?? 0);

  const rawRevenue = await db.$queryRaw<{ date: Date; revenue: bigint; orders: bigint }[]>`
    SELECT DATE("createdAt") as date, SUM(total)::bigint as revenue, COUNT(*)::bigint as orders
    FROM "Order" WHERE status = 'PAID' AND "createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("createdAt") ORDER BY date ASC`;

  const revenueByDay: RevenueDay[] = rawRevenue.map((r) => ({ date: r.date.toISOString().split("T")[0], revenue: Number(r.revenue), orders: Number(r.orders) }));
  const aov = revenueAgg._count > 0 ? Math.round((revenueAgg._sum.total ?? 0) / revenueAgg._count) : 0;

  return {
    revenue: revenueAgg._sum.total ?? 0, orderCount, aov, lowStock, revenueByDay,
    recentOrders: recentOrders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })),
  };
}, ["admin-dashboard"], { revalidate: 60 });

export default async function AdminDashboard() {
  const data = await getDashboardData();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Last 30 days</p>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Revenue", value: formatPrice(data.revenue) },
          { label: "Orders", value: data.orderCount.toString() },
          { label: "Avg Order", value: formatPrice(data.aov) },
          { label: "Low Stock", value: data.lowStock.toString() },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-stone-200 p-6">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className="font-serif text-3xl">{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-stone-200 p-6">
        <h2 className="font-serif text-xl mb-4">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-stone-400 uppercase tracking-widest border-b border-stone-100">
            <th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3">Total</th><th className="pb-3">Status</th>
          </tr></thead>
          <tbody>{data.recentOrders.map((order) => (
            <tr key={order.id} className="border-b border-stone-50">
              <td className="py-3"><a href={`/admin/orders/${order.id}`} className="hover:underline">{order.orderNumber}</a></td>
              <td className="py-3 text-stone-600">{order.email}</td>
              <td className="py-3">{formatPrice(order.total)}</td>
              <td className="py-3"><span className="bg-stone-100 text-stone-600 px-2 py-0.5 text-xs rounded">{order.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
