"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Star, Crown, MessageCircle, Download, Zap } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/providers/CurrencyProvider";

const plans = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for casual fans",
    monthlyPrice: 9.99,
    annualPrice: 95.88,
    features: [
      "Access to basic content library",
      "Standard resolution downloads",
      "10 downloads per month",
      "Email support",
    ],
    tier: "BASIC",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Most popular choice",
    monthlyPrice: 19.99,
    annualPrice: 191.88,
    isPopular: true,
    features: [
      "Full content access",
      "4K resolution downloads",
      "Unlimited downloads",
      "Direct messaging",
      "Early access to new content",
      "Priority support",
    ],
    tier: "PREMIUM",
  },
  {
    id: "vip",
    name: "VIP",
    description: "Ultimate experience",
    monthlyPrice: 49.99,
    annualPrice: 479.88,
    features: [
      "Everything in Premium",
      "Exclusive VIP-only content",
      "Custom content requests",
      "Private video calls",
      "Behind-the-scenes access",
      "Personalized messages",
      "VIP badge on profile",
    ],
    tier: "VIP",
  },
];

const featureIcons: Record<string, React.ReactNode> = {
  "Direct messaging": <MessageCircle className="w-4 h-4" />,
  "Unlimited downloads": <Download className="w-4 h-4" />,
  "Early access to new content": <Zap className="w-4 h-4" />,
};

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { formatPrice, currency, isLoading } = useCurrency();

  return (
    <section id="membership" className="py-24 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--gold)]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-overline mb-4 block">Membership</span>
          <h2 className="text-headline text-[var(--foreground)] mb-4">
            Choose Your <span className="gradient-gold-text">Access</span>
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
            Unlock exclusive content with a plan that fits your needs.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !isAnnual ? "text-[var(--foreground)]" : "text-[var(--muted)]"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn(
              "relative w-14 h-7 rounded-full transition-colors",
              isAnnual ? "bg-[var(--gold)]" : "bg-[var(--surface)]"
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform",
                isAnnual ? "translate-x-8" : "translate-x-1"
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              isAnnual ? "text-[var(--foreground)]" : "text-[var(--muted)]"
            )}
          >
            Annual
          </span>
          {isAnnual && (
            <Badge variant="success" className="ml-2">
              Save 20%
            </Badge>
          )}
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-8 rounded-2xl",
                plan.isPopular ? "featured-card scale-105 z-10" : "luxury-card"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="premium" className="px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--gold)]/10 mb-4">
                  <Crown className={cn(
                    "w-6 h-6",
                    plan.id === "vip" ? "text-[var(--gold)]" : "text-[var(--gold-muted)]"
                  )} />
                </div>
                <h3 className="text-title text-[var(--foreground)] mb-2">
                  {plan.name}
                </h3>
                <p className="text-[var(--muted)] text-sm mb-6">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={cn(
                    "text-4xl font-bold text-[var(--foreground)]",
                    isLoading && "opacity-50"
                  )}>
                    {formatPrice(isAnnual
                      ? plan.annualPrice / 12
                      : plan.monthlyPrice
                    )}
                  </span>
                  <span className="text-[var(--muted)]">/month</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-[var(--gold)] mt-2">
                    Billed {formatPrice(plan.annualPrice)}/year
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={cn(
                        "w-5 h-5 flex-shrink-0",
                        plan.isPopular || plan.id === "vip"
                          ? "text-[var(--gold)]"
                          : "text-[var(--success)]"
                      )}
                    />
                    <span className="text-sm text-[var(--foreground-secondary)]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={`/checkout?plan=${plan.id}&interval=${isAnnual ? "annual" : "monthly"}`}>
                <Button
                  variant={plan.isPopular ? "premium" : "gold-outline"}
                  className="w-full"
                  size="lg"
                >
                  Get {plan.name}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm text-[var(--muted)] mb-4">
            Secure payments powered by
          </p>
          <div className="flex items-center justify-center gap-6">
            <span className="text-[var(--foreground-secondary)] font-medium">Stripe</span>
            <span className="text-[var(--muted)]">•</span>
            <span className="text-[var(--foreground-secondary)] font-medium">Bitcoin</span>
            <span className="text-[var(--muted)]">•</span>
            <span className="text-[var(--foreground-secondary)] font-medium">Ethereum</span>
            <span className="text-[var(--muted)]">•</span>
            <span className="text-[var(--foreground-secondary)] font-medium">USDT</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
