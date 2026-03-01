export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";

const getShopData = unstable_cache(async (categorySlug?: string) => {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: {
        status: "PUBLISHED",
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany(),
  ]);
  return { products, categories };
}, ["shop"], { revalidate: 300 });

export default async function ShopPage({ searchParams }: { searchParams: { category?: string } }) {
  const { products, categories } = await getShopData(searchParams.category);

  return (
    <main className="container mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-5xl mb-2">Shop</h1>
        <p className="text-stone-500 text-sm">{products.length} products</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-10 flex-wrap">
        <Link href="/shop"
          className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${!searchParams.category ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-600 hover:border-stone-900"}`}>
          All
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/shop?category=${cat.slug}`}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${searchParams.category === cat.slug ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-600 hover:border-stone-900"}`}>
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-stone-400">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group">
              <div className="aspect-[4/5] bg-stone-100 overflow-hidden mb-4 relative">
                {product.images[0] && (
                  <Image src={product.images[0].url} alt={product.images[0].alt ?? product.name}
                    fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                {product.compareAtPrice && (
                  <span className="absolute top-3 left-3 bg-stone-900 text-white text-xs px-2 py-1">Sale</span>
                )}
              </div>
              {product.category && (
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{product.category.name}</p>
              )}
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
      )}
    </main>
  );
}
