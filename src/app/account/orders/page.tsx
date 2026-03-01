export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AccountOrdersPage({ searchParams }: { searchParams: { success?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login?callbackUrl=/account/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FULFILLED: "bg-blue-100 text-blue-700",
    REFUNDED: "bg-purple-100 text-purple-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Account</p>
        <h1 className="font-serif text-4xl">Your Orders</h1>
        <p className="text-stone-500 text-sm mt-1">{session.user.email}</p>
      </div>

      {searchParams.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm mb-8 rounded">
          Your order has been placed successfully. Thank you!
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-400 mb-6">You haven't placed any orders yet.</p>
          <Link href="/shop" className="inline-block bg-stone-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-stone-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-sans font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                    {order.status}
                  </span>
                  <p className="text-sm font-medium mt-1">{formatPrice(order.total)}</p>
                </div>
              </div>
              <div className="border-t border-stone-100 pt-4 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-stone-600">
                    <span>{item.name}{item.variantName ? ` — ${item.variantName}` : ""} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {order.trackingNumber && (
                <p className="text-xs text-stone-500 mt-3">Tracking: <span className="font-medium">{order.trackingNumber}</span></p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}