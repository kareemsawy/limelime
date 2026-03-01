export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { images: { take: 1 }, category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Products</h1>
          <p className="text-stone-500 text-sm mt-1">{products.length} total</p>
        </div>
        <Link href="/admin/products/new"
          className="bg-stone-900 text-white px-5 py-2.5 text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors">
          + New Product
        </Link>
      </div>

      <div className="bg-white border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
              const lowStock = product.variants.some((v) => v.stock <= v.lowStockAt);
              return (
                <tr key={product.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-stone-100 relative flex-shrink-0">
                        {product.images[0] && (
                          <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{product.name}</p>
                        <p className="text-xs text-stone-400">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{product.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span>{formatPrice(product.price)}</span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-stone-400 line-through ml-1">{formatPrice(product.compareAtPrice)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${product.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={lowStock ? "text-orange-600 font-medium" : "text-stone-600"}>{totalStock}</span>
                    {lowStock && <span className="text-xs text-orange-500 ml-1">Low</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${product.id}`} className="text-xs text-stone-400 hover:text-stone-900 uppercase tracking-widest">Edit</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
