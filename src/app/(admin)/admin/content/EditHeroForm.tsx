"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeroData {
  eyebrow?: string;
  title?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
}

export default function EditHeroForm({ initialData }: { initialData: HeroData | null }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = {
      eyebrow: form.get("eyebrow"),
      title: form.get("title"),
      ctaText: form.get("ctaText"),
      ctaUrl: form.get("ctaUrl"),
      imageUrl: form.get("imageUrl"),
    };
    await fetch("/api/admin/content/hero", { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { name: "eyebrow", label: "Eyebrow Text", placeholder: "Spring Collection 2025" },
        { name: "title", label: "Heading", placeholder: "New Arrivals" },
        { name: "ctaText", label: "Button Text", placeholder: "Shop Now" },
        { name: "ctaUrl", label: "Button URL", placeholder: "/shop" },
        { name: "imageUrl", label: "Image URL", placeholder: "https://..." },
      ].map((field) => (
        <div key={field.name}>
          <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">{field.label}</label>
          <input name={field.name} defaultValue={initialData?.[field.name as keyof HeroData] ?? ""} placeholder={field.placeholder}
            className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
        </div>
      ))}
      <button type="submit" disabled={loading}
        className="bg-stone-900 text-white px-6 py-2.5 text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-50">
        {saved ? "Saved ✓" : loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
