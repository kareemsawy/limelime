import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail({
  to, orderNumber, total,
}: { to: string; orderNumber: string; total: number }) {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "orders@limelime.com",
    to,
    subject: `Order confirmed — #${orderNumber}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1c1917;">
        <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #a8a29e; margin-bottom: 24px;">Limelime</p>
        <h1 style="font-size: 32px; font-weight: 400; margin-bottom: 16px;">Thank you for your order.</h1>
        <p style="font-size: 15px; color: #57534e; margin-bottom: 8px;">Order <strong>#${orderNumber}</strong> has been confirmed.</p>
        <p style="font-size: 15px; color: #57534e; margin-bottom: 40px;">Total: <strong>$${(total / 100).toFixed(2)}</strong></p>
        <p style="font-size: 14px; color: #57534e;">We'll send a shipping notification when your items are on their way.</p>
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 40px 0;">
        <p style="font-size: 12px; color: #a8a29e;">Limelime — ${process.env.NEXT_PUBLIC_APP_URL ?? "limelime.com"}</p>
      </div>
    `,
  });
  if (error) console.error("Failed to send order confirmation email:", error);
}

export async function subscribeToNewsletter(email: string): Promise<boolean> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    console.warn("RESEND_AUDIENCE_ID not set — newsletter signup not recorded");
    return true;
  }
  try {
    const { error } = await resend.contacts.create({ email, audienceId });
    return !error;
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    return false;
  }
}
