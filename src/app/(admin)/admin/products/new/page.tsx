"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      price: Math.round(parseFloat(form.get("price") as string) * 100),
      compareAtPrice: form.get("compareAtPrice") ? Math.round(parseFloat(form.get("compareAtPrice") as string) * 100) : null,
      status: form.get("status"),
      featured: form.get("featured") === "on",
    };
    const res = await fetch("/api/admin/products", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    if (res.ok) {
      router.push("/admin/products");
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to create product");
      setLoading(false);
    }
  }

  function slugify(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">New Product</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-6 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Name *</label>
          <input name="name" required className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
            onChange={(e) => { const slug = e.currentTarget.form?.slug as HTMLInputElement; if (slug) slug.value = slugify(e.target.value); }} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Slug *</label>
          <input name="slug" required className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400 font-mono" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Description *</label>
          <textarea name="description" required rows={4} className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Price (USD) *</label>
            <input name="price" type="number" step="0.01" min="0" required className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Compare At Price</label>
            <input name="compareAtPrice" type="number" step="0.01" min="0" className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Status</label>
            <select name="status" className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400 bg-white">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input name="featured" type="checkbox" className="accent-stone-900" />
              Featured product
            </label>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-stone-900 text-white px-6 py-2.5 text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-50">
            {loading ? "Creating..." : "Create Product"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm border border-stone-300 text-stone-600 hover:border-stone-900 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
