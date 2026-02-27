import { Router, Request, Response } from "express";
import Stripe   from "stripe";
import { prisma } from "../server";
import { logger } from "../config/logger";

const router = Router();
const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });

// POST /api/webhooks/stripe
// Body is raw (see server.ts — express.raw middleware applied before this route)
router.post("/stripe", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error("Stripe webhook signature verification failed:", err);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  logger.info(`Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId      = subscription.items.data[0].price.id;
          const plan         = await prisma.subscriptionPlan.findFirst({ where: { stripePriceId: priceId } });
          const userId       = session.metadata?.userId;
          if (userId && plan) {
            await prisma.subscription.update({
              where: { userId },
              data: {
                tier:                 plan.tier,
                status:               "ACTIVE",
                stripeSubscriptionId: subscription.id,
                stripePriceId:        priceId,
                currentPeriodStart:   new Date(subscription.current_period_start * 1000),
                currentPeriodEnd:     new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd:    subscription.cancel_at_period_end,
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
              status:             "ACTIVE",
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd:   new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data:  { status: "PAST_DUE" },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data:  { tier: "FREE", status: "CANCELED", stripeSubscriptionId: null, stripePriceId: null },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub   = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0].price.id;
        const plan    = await prisma.subscriptionPlan.findFirst({ where: { stripePriceId: priceId } });
        if (plan) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
              tier:              plan.tier,
              status:            sub.status.toUpperCase() as "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING",
              cancelAtPeriodEnd: sub.cancel_at_period_end,
              currentPeriodEnd:  new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    logger.error("Error processing Stripe webhook:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

export default router;
