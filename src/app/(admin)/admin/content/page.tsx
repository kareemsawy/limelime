import { db } from "@/lib/db";
import EditHeroForm from "./EditHeroForm";

export default async function AdminContentPage() {
  const hero = await db.homepageContent.findUnique({ where: { key: "hero" } });
  const heroData = hero?.data as { eyebrow?: string; title?: string; ctaText?: string; ctaUrl?: string; imageUrl?: string } | null;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Content</h1>
        <p className="text-stone-500 text-sm mt-1">Manage homepage content</p>
      </div>

      <div className="bg-white border border-stone-200 p-6">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-5">Hero Section</p>
        <EditHeroForm initialData={heroData} />
      </div>
    </div>
  );
}
