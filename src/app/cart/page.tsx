"use client";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { createCheckoutSession } from "@/server/actions/order.actions";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      const { url, error: err } = await createCheckoutSession(items, coupon || undefined);
      if (err) { setError(err); setLoading(false); return; }
      if (url) window.location.href = url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl mb-4">Your cart is empty</h1>
        <p className="text-stone-500 mb-8">Discover our collection of considered home objects.</p>
        <Link href="/shop" className="inline-block bg-stone-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors">
          Shop Now
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="font-serif text-4xl mb-10">Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 border-b border-stone-100 pb-6">
              <div className="relative w-20 h-24 bg-stone-100 flex-shrink-0">
                {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="font-sans text-sm text-stone-900 hover:underline">{item.name}</Link>
                {item.variantName && <p className="text-xs text-stone-400 mt-0.5">{item.variantName}</p>}
                <p className="text-sm mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-stone-200">
                    <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50 text-sm">−</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50 text-sm">+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId, item.variantId)} className="text-stone-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-sm font-sans text-right">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-xs text-stone-400 hover:text-stone-700 uppercase tracking-widest transition-colors">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="bg-stone-50 p-6 space-y-4 self-start">
          <h2 className="font-serif text-xl">Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Subtotal</span>
            <span>{formatPrice(total())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Shipping</span>
            <span className="text-stone-500">{total() >= 15000 ? "Free" : formatPrice(599)}</span>
          </div>
          <div className="border-t border-stone-200 pt-4 flex justify-between font-sans font-medium">
            <span>Total</span>
            <span>{formatPrice(total() >= 15000 ? total() : total() + 599)}</span>
          </div>

          {/* Coupon */}
          <div className="pt-2">
            <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Coupon Code</label>
            <div className="flex gap-2">
              <input type="text" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="flex-1 border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-stone-500 min-w-0" />
            </div>
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <button onClick={handleCheckout} disabled={loading}
            className="w-full bg-stone-900 text-white py-4 text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-50">
            {loading ? "Redirecting..." : "Checkout"}
          </button>
          <Link href="/shop" className="block text-center text-xs text-stone-400 hover:text-stone-700 uppercase tracking-widest">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
