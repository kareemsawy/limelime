export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import Image from "next/image";

const getHomeData = unstable_cache(async () => {
  const [featured, categories, hero] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      take: 4,
    }),
    db.category.findMany({ take: 6 }),
    db.homepageContent.findUnique({ where: { key: "hero" } }),
  ]);
  return { featured, categories, hero };
}, ["homepage"], { revalidate: 300 });

export default async function HomePage() {
  const { featured, categories, hero } = await getHomeData();
  const heroData = hero?.data as { eyebrow: string; title: string; ctaText: string; ctaUrl: string; imageUrl: string } | null;

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[90vh] flex items-end pb-16 overflow-hidden">
        {heroData?.imageUrl && (
          <Image src={heroData.imageUrl} alt="Hero" fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 container mx-auto px-6">
          {heroData?.eyebrow && <p className="text-white/70 text-xs tracking-[0.2em] uppercase mb-3">{heroData.eyebrow}</p>}
          <h1 className="font-serif text-white text-6xl md:text-8xl mb-8">{heroData?.title ?? "New Arrivals"}</h1>
          <Link href={heroData?.ctaUrl ?? "/shop"} className="inline-block bg-white text-stone-900 px-8 py-3 text-sm tracking-widest uppercase hover:bg-stone-100 transition-colors">
            {heroData?.ctaText ?? "Shop Now"}
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 container mx-auto px-6">
        <h2 className="font-serif text-4xl mb-12 text-center">Featured</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group">
              <div className="aspect-[4/5] bg-stone-100 overflow-hidden mb-4 relative">
                {product.images[0] && (
                  <Image src={product.images[0].url} alt={product.images[0].alt ?? product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                {product.compareAtPrice && (
                  <span className="absolute top-3 left-3 bg-stone-900 text-white text-xs px-2 py-1">Sale</span>
                )}
              </div>
              <p className="font-sans text-sm text-stone-900">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-sans text-sm">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="font-sans text-sm text-stone-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-stone-50">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-4xl mb-12 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="group bg-stone-100 p-8 text-center hover:bg-stone-200 transition-colors">
                <span className="font-serif text-2xl">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
