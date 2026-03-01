"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Settings {
  id: string;
  currency: string;
  flatShippingRate: number;
  freeShippingThreshold: number;
  taxEnabled: boolean;
  taxRate: number;
}

export default function EditSettingsForm({ settings }: { settings: Settings | null }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = {
      currency: form.get("currency"),
      flatShippingRate: Math.round(parseFloat(form.get("flatShippingRate") as string) * 100),
      freeShippingThreshold: Math.round(parseFloat(form.get("freeShippingThreshold") as string) * 100),
      taxEnabled: form.get("taxEnabled") === "on",
      taxRate: parseFloat(form.get("taxRate") as string) / 100,
    };
    await fetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Currency</label>
        <select name="currency" defaultValue={settings?.currency ?? "USD"} className="w-full border border-stone-200 px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Flat Shipping Rate ($)</label>
        <input name="flatShippingRate" type="number" step="0.01" min="0"
          defaultValue={(settings?.flatShippingRate ?? 599) / 100}
          className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Free Shipping Threshold ($)</label>
        <input name="freeShippingThreshold" type="number" step="0.01" min="0"
          defaultValue={(settings?.freeShippingThreshold ?? 15000) / 100}
          className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
      </div>
      <div className="flex items-center gap-3">
        <input name="taxEnabled" type="checkbox" defaultChecked={settings?.taxEnabled ?? false} className="accent-stone-900" id="taxEnabled" />
        <label htmlFor="taxEnabled" className="text-sm text-stone-700">Enable tax calculation</label>
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Tax Rate (%)</label>
        <input name="taxRate" type="number" step="0.01" min="0" max="100"
          defaultValue={(settings?.taxRate ?? 0.08) * 100}
          className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
      </div>
      <button type="submit" disabled={loading}
        className="bg-stone-900 text-white px-6 py-2.5 text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-50">
        {saved ? "Saved ✓" : loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
