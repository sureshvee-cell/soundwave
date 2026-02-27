import { NextRequest } from "next/server";
import Stripe from "stripe";
import { z }  from "zod";
import prisma  from "@/lib/db";
import { ok, parseBody, requireAuth, route } from "@/lib/api-helpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });

export const POST = route(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const { priceId } = await parseBody(req, z.object({ priceId: z.string() }));

  // Get or create Stripe customer
  let sub = await prisma.subscription.findUnique({ where: { userId: authUser.sub } });
  let customerId = sub?.stripeCustomerId;

  if (!customerId) {
    const user     = await prisma.user.findUnique({ where: { id: authUser.sub } });
    const customer = await stripe.customers.create({
      email:    user!.email,
      name:     user!.displayName,
      metadata: { userId: user!.id },
    });
    customerId = customer.id;
    await prisma.subscription.upsert({
      where:  { userId: authUser.sub },
      update: { stripeCustomerId: customerId },
      create: { userId: authUser.sub, tier: "FREE", status: "ACTIVE", stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer:             customerId,
    mode:                 "subscription",
    payment_method_types: ["card"],
    line_items:           [{ price: priceId, quantity: 1 }],
    success_url:          `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:           `${appUrl}/subscribe?canceled=1`,
    metadata:             { userId: authUser.sub },
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: authUser.sub },
    },
  });

  return ok({ url: session.url, sessionId: session.id });
});
