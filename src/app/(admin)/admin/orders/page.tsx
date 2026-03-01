import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const orders = await db.order.findMany({
    where: searchParams.status ? { status: searchParams.status as never } : {},
    include: { items: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FULFILLED: "bg-blue-100 text-blue-700",
    REFUNDED: "bg-purple-100 text-purple-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const statuses = ["PENDING", "PAID", "FULFILLED", "REFUNDED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Orders</h1>
          <p className="text-stone-500 text-sm mt-1">{orders.length} orders</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/admin/orders" className={`px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors ${!searchParams.status ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-600 hover:border-stone-900"}`}>
          All
        </Link>
        {statuses.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`}
            className={`px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors ${searchParams.status === s ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-600 hover:border-stone-900"}`}>
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-stone-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3 font-medium text-stone-900">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <p className="text-stone-900">{order.user?.name ?? "Guest"}</p>
                  <p className="text-xs text-stone-400">{order.email}</p>
                </td>
                <td className="px-4 py-3 text-stone-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500 text-xs">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-xs text-stone-400 hover:text-stone-900 uppercase tracking-widest">View</Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-400">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
