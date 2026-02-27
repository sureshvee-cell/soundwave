import { Router }    from "express";
import Stripe        from "stripe";
import { z }         from "zod";
import { prisma }    from "../server";
import { authenticate, type AuthRequest } from "../middleware/auth";
import { AppError }  from "../middleware/errorHandler";
import { logger }    from "../config/logger";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

// GET /api/subscriptions/plans
router.get("/plans", async (_req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where:   { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ success: true, data: plans });
  } catch (err) { next(err); }
});

// GET /api/subscriptions/current
router.get("/current", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
});

// POST /api/subscriptions/checkout — create Stripe checkout session
router.post("/checkout", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { priceId } = z.object({ priceId: z.string() }).parse(req.body);

    // Get or create Stripe customer
    let sub = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
    let customerId = sub?.stripeCustomerId;

    if (!customerId) {
      const user     = await prisma.user.findUnique({ where: { id: req.user!.id } });
      const customer = await stripe.customers.create({
        email:    user!.email,
        name:     user!.displayName,
        metadata: { userId: user!.id },
      });
      customerId = customer.id;
      await prisma.subscription.upsert({
        where:  { userId: req.user!.id },
        update: { stripeCustomerId: customerId },
        create: { userId: req.user!.id, tier: "FREE", status: "ACTIVE", stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer:         customerId,
      mode:             "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.APP_URL}/subscribe?canceled=1`,
      metadata:    { userId: req.user!.id },
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: { userId: req.user!.id },
      },
    });

    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (err) { next(err); }
});

// POST /api/subscriptions/portal — Stripe customer portal
router.post("/portal", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
    if (!sub?.stripeCustomerId) throw new AppError(400, "No active subscription found");

    const session = await stripe.billingPortal.sessions.create({
      customer:   sub.stripeCustomerId,
      return_url: `${process.env.APP_URL}/subscribe`,
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (err) { next(err); }
});

// POST /api/subscriptions/cancel
router.post("/cancel", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
    if (!sub?.stripeSubscriptionId) throw new AppError(400, "No active subscription");

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const updated = await prisma.subscription.update({
      where: { userId: req.user!.id },
      data:  { cancelAtPeriodEnd: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

export default router;
