import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Limelime database...");

  await db.user.upsert({
    where: { email: "admin@limelime.com" },
    update: {},
    create: {
      email: "admin@limelime.com",
      name: "Admin User",
      passwordHash: await bcrypt.hash("limelime-admin-2025", 12),
      role: "ADMIN",
    },
  });

  await db.user.upsert({
    where: { email: "manager@limelime.com" },
    update: {},
    create: {
      email: "manager@limelime.com",
      name: "Store Manager",
      passwordHash: await bcrypt.hash("limelime-manager-2025", 12),
      role: "MANAGER",
    },
  });

  await db.user.upsert({
    where: { email: "support@limelime.com" },
    update: {},
    create: {
      email: "support@limelime.com",
      name: "Support Staff",
      passwordHash: await bcrypt.hash("limelime-support-2025", 12),
      role: "SUPPORT",
    },
  });

  await db.siteSettings.upsert({
    where: { key: "default" },
    update: {},
    create: {
      key: "default",
      currency: "USD",
      flatShippingRate: 599,
      freeShippingThreshold: 15000,
      taxEnabled: false,
      taxRate: 0.08,
    },
  });

  const [catVases, catCushions, catThrows, catTableware, catCandles, catLighting] =
    await Promise.all([
      db.category.upsert({ where: { slug: "vases" }, update: {}, create: { name: "Vases", slug: "vases" } }),
      db.category.upsert({ where: { slug: "cushions" }, update: {}, create: { name: "Cushions", slug: "cushions" } }),
      db.category.upsert({ where: { slug: "throws" }, update: {}, create: { name: "Throws", slug: "throws" } }),
      db.category.upsert({ where: { slug: "tableware" }, update: {}, create: { name: "Tableware", slug: "tableware" } }),
      db.category.upsert({ where: { slug: "candles" }, update: {}, create: { name: "Candles", slug: "candles" } }),
      db.category.upsert({ where: { slug: "lighting" }, update: {}, create: { name: "Lighting", slug: "lighting" } }),
    ]);

  type ProductSeed = {
    name: string; slug: string; description: string; price: number;
    compareAtPrice?: number; status: "DRAFT" | "PUBLISHED"; featured: boolean;
    categoryId: string; tags: string[];
    images: { url: string; alt: string; position: number }[];
    variants: { name: string; sku: string; stock: number; lowStockAt: number; options: Record<string, string>; price?: number }[];
  };

  const products: ProductSeed[] = [
    {
      name: "Stoneware Bud Vase", slug: "stoneware-bud-vase",
      description: "Handcrafted stoneware vase with a matte sage glaze. A considered object for the minimal home.",
      price: 6800, compareAtPrice: 8500, status: "PUBLISHED", featured: true, categoryId: catVases.id,
      tags: ["vase", "stoneware", "sage", "new"],
      images: [{ url: "https://picsum.photos/seed/vase-sm/800/1000", alt: "Stoneware Bud Vase", position: 0 }],
      variants: [
        { name: "Small", sku: "VAS-BUD-SM", stock: 24, lowStockAt: 5, options: { size: "Small" } },
        { name: "Large", sku: "VAS-BUD-LG", stock: 12, lowStockAt: 4, options: { size: "Large" }, price: 9800 },
      ],
    },
    {
      name: "Linen Cushion Cover", slug: "linen-cushion-cover",
      description: "Pure washed linen cushion cover with invisible zip. Stonewashed for instant softness.",
      price: 4200, status: "PUBLISHED", featured: false, categoryId: catCushions.id,
      tags: ["cushion", "linen", "natural"],
      images: [{ url: "https://picsum.photos/seed/cushion-linen/800/1000", alt: "Linen Cushion Cover", position: 0 }],
      variants: [
        { name: "50x50 / Natural", sku: "CUS-LIN-50-NAT", stock: 30, lowStockAt: 6, options: { size: "50x50", color: "Natural" } },
        { name: "50x50 / Sage", sku: "CUS-LIN-50-SAG", stock: 18, lowStockAt: 5, options: { size: "50x50", color: "Sage" } },
        { name: "60x40 / Natural", sku: "CUS-LIN-60-NAT", stock: 22, lowStockAt: 5, options: { size: "60x40", color: "Natural" } },
      ],
    },
    {
      name: "Merino Wool Throw", slug: "merino-wool-throw",
      description: "Extra-fine merino wool throw. Breathable, warm, and beautifully draped over any surface.",
      price: 18500, compareAtPrice: 22000, status: "PUBLISHED", featured: true, categoryId: catThrows.id,
      tags: ["throw", "merino", "wool", "luxury"],
      images: [{ url: "https://picsum.photos/seed/merino-throw/800/1000", alt: "Merino Wool Throw", position: 0 }],
      variants: [
        { name: "Oat", sku: "THR-MER-OAT", stock: 8, lowStockAt: 5, options: { color: "Oat" } },
        { name: "Charcoal", sku: "THR-MER-CHA", stock: 4, lowStockAt: 6, options: { color: "Charcoal" } },
      ],
    },
    {
      name: "Ceramic Dinner Plate", slug: "ceramic-dinner-plate",
      description: "Irregular-edge dinner plate in speckled white stoneware. Each piece subtly unique.",
      price: 3200, status: "PUBLISHED", featured: false, categoryId: catTableware.id,
      tags: ["tableware", "ceramic", "plate"],
      images: [{ url: "https://picsum.photos/seed/ceramic-plate/800/1000", alt: "Ceramic Dinner Plate", position: 0 }],
      variants: [
        { name: "27cm / White", sku: "TAB-PLT-27-WHT", stock: 40, lowStockAt: 8, options: { size: "27cm", color: "White" } },
        { name: "27cm / Terracotta", sku: "TAB-PLT-27-TER", stock: 20, lowStockAt: 5, options: { size: "27cm", color: "Terracotta" } },
      ],
    },
    {
      name: "Soy Wax Candle", slug: "soy-wax-candle",
      description: "Clean-burning soy wax candle in recycled glass. Scented with vetiver and white cedar.",
      price: 3800, status: "PUBLISHED", featured: false, categoryId: catCandles.id,
      tags: ["candle", "soy", "vetiver"],
      images: [{ url: "https://picsum.photos/seed/soy-candle/800/1000", alt: "Soy Wax Candle", position: 0 }],
      variants: [
        { name: "180g", sku: "CAN-SOY-180", stock: 50, lowStockAt: 10, options: { size: "180g" } },
        { name: "300g", sku: "CAN-SOY-300", stock: 30, lowStockAt: 8, options: { size: "300g" }, price: 5500 },
      ],
    },
    {
      name: "Rattan Pendant Light", slug: "rattan-pendant-light",
      description: "Hand-woven rattan pendant shade with cotton flex. Warm, diffused light for any room.",
      price: 14500, status: "PUBLISHED", featured: true, categoryId: catLighting.id,
      tags: ["lighting", "rattan", "pendant", "handmade"],
      images: [{ url: "https://picsum.photos/seed/rattan-light/800/1000", alt: "Rattan Pendant Light", position: 0 }],
      variants: [
        { name: "40cm Natural", sku: "LGT-RAT-40-NAT", stock: 15, lowStockAt: 4, options: { size: "40cm", color: "Natural" } },
        { name: "60cm Natural", sku: "LGT-RAT-60-NAT", stock: 8, lowStockAt: 3, options: { size: "60cm", color: "Natural" } },
      ],
    },
  ];

  for (const { variants, images, ...data } of products) {
    const product = await db.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: { ...data, images: { create: images }, variants: { create: variants } },
    });
    console.log(`  ✓ ${product.name}`);
  }

  await db.collection.upsert({
    where: { slug: "spring-2025" },
    update: {},
    create: { name: "Spring 2025", slug: "spring-2025", description: "Light, considered objects for the considered home.", featured: true },
  });

  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "percent", value: 10, minOrder: 5000, maxUses: 100, active: true },
  });

  await db.homepageContent.upsert({
    where: { key: "hero" },
    update: {},
    create: {
      key: "hero",
      data: { eyebrow: "Spring Collection 2025", title: "New Arrivals", ctaText: "Explore Collection", ctaUrl: "/shop", imageUrl: "https://picsum.photos/seed/limelime-hero/1800/1000" },
    },
  });

  console.log("✅ Seed complete");
  console.log("\nAdmin credentials:");
  console.log("  admin@limelime.com    / limelime-admin-2025");
  console.log("  manager@limelime.com  / limelime-manager-2025");
  console.log("  support@limelime.com  / limelime-support-2025");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => db.$disconnect());
