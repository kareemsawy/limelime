export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://limelime.vercel.app";
  const products = await db.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
  const categories = await db.category.findMany({ select: { slug: true } });

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({ url: `${baseUrl}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...categories.map((c) => ({ url: `${baseUrl}/category/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
