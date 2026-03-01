"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCouponForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      code: (form.get("code") as string).toUpperCase(),
      type: form.get("type"),
      value: parseFloat(form.get("value") as string),
      minOrder: form.get("minOrder") ? Math.round(parseFloat(form.get("minOrder") as string) * 100) : null,
      maxUses: form.get("maxUses") ? parseInt(form.get("maxUses") as string) : null,
      expiresAt: form.get("expiresAt") || null,
      active: true,
    };
    const res = await fetch("/api/admin/coupons", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to create coupon");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white border border-stone-200 p-5">
      <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">New Coupon</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-stone-500 block mb-1">Code *</label>
          <input name="code" required placeholder="SUMMER20" className="w-full border border-stone-200 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-stone-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-stone-500 block mb-1">Type</label>
            <select name="type" className="w-full border border-stone-200 px-3 py-2 text-sm bg-white focus:outline-none">
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed $</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">Value *</label>
            <input name="value" type="number" step="0.01" min="0" required className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="text-xs text-stone-500 block mb-1">Min Order ($)</label>
          <input name="minOrder" type="number" step="0.01" min="0" placeholder="Optional" className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-stone-500 block mb-1">Max Uses</label>
          <input name="maxUses" type="number" min="1" placeholder="Unlimited" className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-stone-500 block mb-1">Expires At</label>
          <input name="expiresAt" type="date" className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
        </div>
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-stone-900 text-white py-2.5 text-xs uppercase tracking-widest hover:bg-stone-700 transition-colors disabled:opacity-50">
          {loading ? "Creating..." : "Create Coupon"}
        </button>
      </form>
    </div>
  );
}
