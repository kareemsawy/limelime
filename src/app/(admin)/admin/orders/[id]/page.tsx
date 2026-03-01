export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import UpdateOrderStatus from "./UpdateOrderStatus";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true, variant: true } },
      user: true,
    },
  });

  if (!order) notFound();

  const addr = order.shippingAddress as Record<string, string>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs text-stone-400 hover:text-stone-700 uppercase tracking-widest">← Orders</Link>
          <h1 className="font-serif text-3xl text-stone-900 mt-1">{order.orderNumber}</h1>
          <p className="text-stone-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 p-5">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Customer</p>
          <p className="font-medium text-stone-900">{order.user?.name ?? "Guest"}</p>
          <p className="text-sm text-stone-600">{order.email}</p>
        </div>
        <div className="bg-white border border-stone-200 p-5">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Shipping Address</p>
          {addr?.line1 ? (
            <div className="text-sm text-stone-600 space-y-0.5">
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postalCode}</p>
              <p>{addr.country}</p>
            </div>
          ) : (
            <p className="text-sm text-stone-400">Not yet provided</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-stone-200 p-5">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">Items</p>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <span className="font-medium text-stone-900">{item.name}</span>
                {item.variantName && <span className="text-stone-400"> — {item.variantName}</span>}
                <span className="text-stone-400"> × {item.quantity}</span>
              </div>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-100 mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between text-stone-500"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
          <div className="flex justify-between font-medium text-stone-900 pt-1 border-t border-stone-100"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>

      {order.trackingNumber && (
        <div className="bg-white border border-stone-200 p-5">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Tracking</p>
          <p className="font-mono text-sm">{order.trackingNumber}</p>
        </div>
      )}
    </div>
  );
}