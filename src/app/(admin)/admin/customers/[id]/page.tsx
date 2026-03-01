export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await db.user.findUnique({
    where: { id: params.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  const totalSpent = customer.orders.filter((o) => ["PAID", "FULFILLED"].includes(o.status)).reduce((s, o) => s + o.total, 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/customers" className="text-xs text-stone-400 hover:text-stone-700 uppercase tracking-widest">← Customers</Link>
        <h1 className="font-serif text-3xl text-stone-900 mt-1">{customer.name ?? customer.email}</h1>
        <p className="text-stone-500 text-sm">{customer.email} · {customer.role}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: customer.orders.length.toString() },
          { label: "Total Spent", value: formatPrice(totalSpent) },
          { label: "Member Since", value: new Date(customer.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-stone-200 p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="font-serif text-2xl">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200 p-5">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">Order History</p>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-stone-400">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {customer.orders.map((order) => (
              <div key={order.id} className="flex justify-between items-center text-sm">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-stone-900 hover:underline">{order.orderNumber}</Link>
                  <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p>{formatPrice(order.total)}</p>
                  <p className="text-xs text-stone-400">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}