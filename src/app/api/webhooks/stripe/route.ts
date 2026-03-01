import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/resend";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("⚠️ Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await db.order.updateMany({ where: { stripeSessionId: session.id }, data: { status: "CANCELLED" } });
        break;
      }
      default: break;
    }
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const order = await db.order.findUnique({
    where: { stripeSessionId: session.id },
    include: { items: { include: { variant: true } } },
  });
  if (!order) { console.error(`Order not found for session: ${session.id}`); return; }
  if (order.status === "PAID") return;

  const addr = session.shipping_details?.address;
  const shippingAddress = addr ? { line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, postalCode: addr.postal_code, country: addr.country } : {};

  await db.order.update({
    where: { id: order.id },
    data: { status: "PAID", stripePaymentId: session.payment_intent as string, shippingAddress },
  });

  for (const item of order.items) {
    if (item.variantId) {
      try {
        await db.variant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
        await db.inventoryAdjustment.create({ data: { variantId: item.variantId, delta: -item.quantity, reason: `Order ${order.orderNumber}` } });
      } catch (err) {
        console.error(`Stock update failed for variant ${item.variantId}:`, err);
      }
    }
  }

  if (order.couponId) {
    await db.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });
  }

  await sendOrderConfirmationEmail({ to: order.email, orderNumber: order.orderNumber, total: order.total });
}
