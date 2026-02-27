"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Zap, Users, GraduationCap, ArrowRight, Star } from "lucide-react";
import { mockPlans } from "@/lib/mock-data";
import { formatPrice, cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free:    <Star className="w-5 h-5" />,
  premium: <Crown className="w-5 h-5" />,
  family:  <Users className="w-5 h-5" />,
  student: <GraduationCap className="w-5 h-5" />,
};

const PLAN_COLORS: Record<string, { from: string; to: string; accent: string }> = {
  free:    { from: "#1a1a24", to: "#111118", accent: "#64748b" },
  premium: { from: "#1e0a3c", to: "#0d0620", accent: "#7c3aed" },
  family:  { from: "#0c1f2c", to: "#060e14", accent: "#06b6d4" },
  student: { from: "#0c2018", to: "#06100c", accent: "#10b981" },
};

export default function SubscribePage() {
  const [billing, setBilling] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState<string | null>(null);

  const plans = mockPlans.filter(p =>
    billing === "year" ? p.interval === "year" || p.tier === "free" || p.tier === "family" || p.tier === "student" : p.interval === "month"
  );

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.tier === "free") return;
    setLoading(plan.id);
    // In production: call subscriptionApi.createCheckout(plan.stripePriceId)
    // then redirect to Stripe checkout session URL
    await new Promise(r => setTimeout(r, 1200));
    setLoading(null);
    alert(`Redirect to Stripe Checkout for: ${plan.name}`);
  };

  return (
    <div className="min-h-full px-4 md:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-900/40 border border-brand-700/40 text-brand-300 text-sm font-medium mb-4">
          <Crown className="w-3.5 h-3.5" />
          Soundwave Premium
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-content-primary tracking-tight mb-4">
          Music without limits
        </h1>
        <p className="text-lg text-content-secondary">
          Unlock full access to millions of tracks, high-quality audio, and exclusive features.
          Cancel anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 mt-8 p-1 bg-surface-overlay rounded-full border border-surface-border">
          {(["month", "year"] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                billing === b
                  ? "bg-brand-600 text-white shadow-glow-brand"
                  : "text-content-secondary hover:text-content-primary"
              )}
            >
              {b === "month" ? "Monthly" : "Yearly"}
              {b === "year" && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-emerald-900/60 text-emerald-300 rounded-full">
                  Save 17%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {plans.map((plan, i) => {
          const colors = PLAN_COLORS[plan.tier];
          const isPremium = plan.tier === "premium";
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "relative rounded-2xl p-6 border transition-all duration-300",
                isPremium
                  ? "border-brand-600/60 shadow-glow-brand scale-[1.02]"
                  : "border-surface-border hover:border-surface-hover"
              )}
              style={{
                background: `linear-gradient(160deg, ${colors.from} 0%, ${colors.to} 100%)`,
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-xs font-bold rounded-full shadow-glow-brand">
                  MOST POPULAR
                </div>
              )}

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${colors.accent}20`, color: colors.accent }}
              >
                {PLAN_ICONS[plan.tier]}
              </div>

              {/* Name & price */}
              <h3 className="text-lg font-bold text-content-primary">{plan.name}</h3>
              <p className="text-sm text-content-muted mt-0.5 mb-4">{plan.description}</p>

              <div className="mb-6">
                {plan.price === 0 ? (
                  <span className="text-3xl font-extrabold text-content-primary">Free</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-content-primary">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-content-muted text-sm">
                      / {plan.interval === "year" ? "yr" : "mo"}
                    </span>
                  </div>
                )}
                {plan.interval === "year" && plan.price > 0 && (
                  <p className="text-xs text-content-muted mt-1">
                    Billed as {formatPrice(plan.price)} per year
                  </p>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mb-6",
                  plan.tier === "free"
                    ? "bg-surface-border text-content-muted cursor-default"
                    : isPremium
                      ? "bg-brand-600 hover:bg-brand-500 text-white shadow-glow-brand active:scale-95"
                      : "border border-surface-border hover:border-content-muted text-content-primary hover:bg-surface-hover"
                )}
              >
                {loading === plan.id ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : plan.tier === "free" ? (
                  "Current Plan"
                ) : (
                  <>Get {plan.name} <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>

              {/* Features */}
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${colors.accent}20` }}
                    >
                      <Check className="w-2.5 h-2.5" style={{ color: colors.accent }} />
                    </div>
                    <span className="text-content-secondary">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ / Trust signals */}
      <div className="mt-16 max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-8 text-sm text-content-muted mb-8">
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Cancel anytime</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> No hidden fees</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Instant access</span>
        </div>
        <p className="text-content-muted text-sm">
          Payments are processed securely by{" "}
          <span className="text-content-secondary font-medium">Stripe</span>.
          Your card is never stored on our servers.
        </p>
      </div>
    </div>
  );
}
