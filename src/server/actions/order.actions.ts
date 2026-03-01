"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

interface CartItemInput {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export async function createCheckoutSession(
  items: CartItemInput[],
  couponCode?: string
): Promise<{ url: string | null; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!items.length) return { url: null, error: "Cart is empty" };

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await db.product.findMany({
    where: { id: { in: productIds }, status: "PUBLISHED" },
    include: { variants: true },
  });

  const lineItems = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { url: null, error: `Product not found: ${item.productId}` };

    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
    if (item.variantId && !variant) return { url: null, error: `Variant not found: ${item.variantId}` };
    if (variant && variant.stock < item.quantity) return { url: null, error: `Insufficient stock for ${product.name}` };

    const price = variant?.price ?? product.price;
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: item.variantName ?? undefined,
          images: item.imageUrl ? [item.imageUrl] : [],
          metadata: { productId: product.id, variantId: variant?.id ?? "" },
        },
        unit_amount: price,
      },
      quantity: item.quantity,
    });
  }

  let coupon = null;
  if (couponCode) {
    const now = new Date();
    coupon = await db.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(), active: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        ],
      },
    });
    if (coupon?.maxUses != null && coupon.usedCount >= coupon.maxUses) coupon = null;
  }

  const settings = await db.siteSettings.findFirst({ where: { key: "default" } });
  const freeThreshold = settings?.freeShippingThreshold ?? 10000;
  const shippingRate = settings?.flatShippingRate ?? 599;
  const subtotal = lineItems.reduce((acc, l) => acc + l.price_data.unit_amount * l.quantity, 0);
  const shipping = subtotal >= freeThreshold ? 0 : shippingRate;
  let discount = 0;
  if (coupon) {
    discount = coupon.type === "percent" ? Math.round(subtotal * (coupon.value / 100)) : Math.min(coupon.value, subtotal);
  }

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "NL", "SE"] },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/orders?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?cancelled=1`,
    customer_email: session?.user?.email ?? undefined,
    metadata: { userId: session?.user?.id ?? "", couponId: coupon?.id ?? "" },
  });

  const orderNumber = generateOrderNumber();
  await db.order.create({
    data: {
      orderNumber,
      email: session?.user?.email ?? "guest@pending.com",
      userId: session?.user?.id ?? undefined,
      status: "PENDING",
      stripeSessionId: stripeSession.id,
      subtotal, shipping, discount, tax: 0,
      total: subtotal - discount + shipping,
      shippingAddress: {},
      couponId: coupon?.id ?? undefined,
      items: {
        create: items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
          return {
            productId: item.productId,
            variantId: item.variantId ?? undefined,
            name: product.name,
            variantName: item.variantName ?? undefined,
            price: variant?.price ?? product.price,
            quantity: item.quantity,
          };
        }),
      },
    },
  });

  return { url: stripeSession.url };
}
