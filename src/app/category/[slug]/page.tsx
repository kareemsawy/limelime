import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

const getCategoryData = unstable_cache(async (slug: string) => {
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return null;
  const products = await db.product.findMany({
    where: { status: "PUBLISHED", categoryId: category.id },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return { category, products };
}, ["category"], { revalidate: 300 });

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getCategoryData(params.slug);
  if (!data) return {};
  return { title: `${data.category.name} — Limelime` };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const data = await getCategoryData(params.slug);
  if (!data) notFound();
  const { category, products } = data;

  return (
    <main className="container mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">
          <Link href="/shop" className="hover:text-stone-700">Shop</Link> / {category.name}
        </p>
        <h1 className="font-serif text-5xl">{category.name}</h1>
        {category.description && <p className="text-stone-500 mt-2">{category.description}</p>}
        <p className="text-stone-400 text-sm mt-1">{products.length} products</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-stone-400">No products in this category yet.</div>
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
              <p className="font-sans text-sm text-stone-900">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-sm text-stone-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
