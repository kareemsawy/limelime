export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminInventoryPage() {
  const variants = await db.variant.findMany({
    include: { product: { select: { name: true, slug: true, status: true } } },
    orderBy: [{ stock: "asc" }],
  });

  const lowStock = variants.filter((v) => v.stock <= v.lowStockAt && v.stock >= 0);
  const outOfStock = variants.filter((v) => v.stock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Inventory</h1>
        <p className="text-stone-500 text-sm mt-1">{variants.length} variants · {outOfStock.length} out of stock · {lowStock.length} low stock</p>
      </div>

      {/* Alerts */}
      {outOfStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-sm font-medium text-red-800 mb-2">Out of Stock ({outOfStock.length})</p>
          <div className="space-y-1">
            {outOfStock.map((v) => (
              <p key={v.id} className="text-sm text-red-700">
                <Link href={`/admin/products/${v.productId}`} className="hover:underline">{v.product.name}</Link>
                {" — "}{v.name} ({v.sku})
              </p>
            ))}
          </div>
        </div>
      )}

      {lowStock.filter((v) => v.stock > 0).length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded">
          <p className="text-sm font-medium text-orange-800 mb-2">Low Stock</p>
          <div className="space-y-1">
            {lowStock.filter((v) => v.stock > 0).map((v) => (
              <p key={v.id} className="text-sm text-orange-700">
                <Link href={`/admin/products/${v.productId}`} className="hover:underline">{v.product.name}</Link>
                {" — "}{v.name}: {v.stock} left (alert at {v.lowStockAt})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="bg-white border border-stone-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Alert At</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${v.productId}`} className="text-stone-900 hover:underline">{v.product.name}</Link>
                </td>
                <td className="px-4 py-3 text-stone-600">{v.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-400">{v.sku}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${v.stock === 0 ? "text-red-600" : v.stock <= v.lowStockAt ? "text-orange-600" : "text-stone-900"}`}>
                    {v.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-400">{v.lowStockAt}</td>
                <td className="px-4 py-3">
                  {v.stock === 0
                    ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Out of stock</span>
                    : v.stock <= v.lowStockAt
                    ? <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Low stock</span>
                    : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">In stock</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
