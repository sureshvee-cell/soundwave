import { NextRequest } from "next/server";
import Stripe from "stripe";
import prisma  from "@/lib/db";
import { ok, err, requireAuth, route } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });

export const POST = route(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const sub = await prisma.subscription.findUnique({ where: { userId: authUser.sub } });
  if (!sub?.stripeCustomerId) return err("No active subscription", 400);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}` || "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer:   sub.stripeCustomerId,
    return_url: `${appUrl}/subscribe`,
  });

  return ok({ url: session.url });
});
