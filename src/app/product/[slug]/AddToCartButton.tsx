"use client";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

interface Variant {
  id: string;
  name: string;
  price: number | null;
  stock: number;
  options: unknown;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
}

export default function AddToCartButton({ product, variants }: { product: Product; variants: Variant[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const price = selectedVariant?.price ?? product.price;
  const inStock = !selectedVariant || selectedVariant.stock > 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      variantId: selectedVariantId || undefined,
      name: product.name,
      variantName: selectedVariant?.name,
      price,
      quantity: qty,
      imageUrl: product.images[0]?.url,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-4">
      {variants.length > 1 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Option</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button key={v.id} onClick={() => setSelectedVariantId(v.id)}
                disabled={v.stock === 0}
                className={`px-4 py-2 text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                  ${selectedVariantId === v.id ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-700 hover:border-stone-900"}`}>
                {v.name}
                {v.price && v.price !== product.price && ` — ${formatPrice(v.price)}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-stone-300">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50">−</button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50">+</button>
        </div>
        <span className="text-sm text-stone-500">{formatPrice(price * qty)}</span>
      </div>

      <button onClick={handleAdd} disabled={!inStock}
        className="w-full bg-stone-900 text-white py-4 text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {!inStock ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
      </button>
    </div>
  );
}
