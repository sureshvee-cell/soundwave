import { NextRequest } from "next/server";
import Stripe from "stripe";
import prisma  from "@/lib/db";
import { ok, err, requireAuth, route } from "@/lib/api-helpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });

export const POST = route(async (req: NextRequest) => {
  const authUser = await requireAuth(req);
  const sub = await prisma.subscription.findUnique({ where: { userId: authUser.sub } });
  if (!sub?.stripeSubscriptionId) return err("No active subscription", 400);

  await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
  const updated = await prisma.subscription.update({
    where: { userId: authUser.sub },
    data:  { cancelAtPeriodEnd: true },
  });
  return ok(updated);
});
