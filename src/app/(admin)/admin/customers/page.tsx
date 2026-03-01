import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: { select: { total: true, status: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Customers</h1>
        <p className="text-stone-500 text-sm mt-1">{customers.length} registered customers</p>
      </div>

      <div className="bg-white border border-stone-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spent</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const totalSpent = customer.orders.filter((o) => o.status === "PAID" || o.status === "FULFILLED").reduce((s, o) => s + o.total, 0);
              return (
                <tr key={customer.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{customer.name ?? "—"}</p>
                    <p className="text-xs text-stone-400">{customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{customer._count.orders}</td>
                  <td className="px-4 py-3 font-medium">{totalSpent > 0 ? formatPrice(totalSpent) : "—"}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {new Date(customer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${customer.id}`} className="text-xs text-stone-400 hover:text-stone-900 uppercase tracking-widest">View</Link>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-stone-400">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
