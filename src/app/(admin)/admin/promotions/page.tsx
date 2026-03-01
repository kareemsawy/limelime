import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import CreateCouponForm from "./CreateCouponForm";

export default async function AdminPromotionsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Promotions</h1>
        <p className="text-stone-500 text-sm mt-1">Manage coupon codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Used</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900">{c.code}</td>
                    <td className="px-4 py-3 text-stone-500 capitalize">{c.type}</td>
                    <td className="px-4 py-3">
                      {c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}
                      {c.minOrder && <span className="text-xs text-stone-400 ml-1">(min {formatPrice(c.minOrder)})</span>}
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${c.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-stone-400">No coupons yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <CreateCouponForm />
        </div>
      </div>
    </div>
  );
}
