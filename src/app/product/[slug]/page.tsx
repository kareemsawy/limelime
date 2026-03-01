import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import AddToCartButton from "./AddToCartButton";

const getProduct = unstable_cache(async (slug: string) => {
  return db.product.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
    },
  });
}, ["product"], { revalidate: 300 });

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} — Limelime`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  return (
    <main className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-4">
          {product.images.map((img, i) => (
            <div key={img.id} className={`relative bg-stone-100 ${i === 0 ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
              <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" priority={i === 0} />
            </div>
          ))}
          {product.images.length === 0 && (
            <div className="aspect-[4/5] bg-stone-100 flex items-center justify-center">
              <span className="text-stone-300 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:sticky md:top-24 self-start space-y-6">
          {product.category && (
            <p className="text-xs uppercase tracking-widest text-stone-400">{product.category.name}</p>
          )}
          <h1 className="font-serif text-4xl text-stone-900">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-sans">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-stone-400 line-through font-sans">{formatPrice(product.compareAtPrice)}</span>
            )}
            {product.compareAtPrice && (
              <span className="text-xs bg-stone-900 text-white px-2 py-1">
                Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </span>
            )}
          </div>

          <p className="text-stone-600 leading-relaxed">{product.description}</p>

          <AddToCartButton product={product} variants={product.variants} />

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-100">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs uppercase tracking-widest text-stone-400 border border-stone-200 px-2 py-1">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
