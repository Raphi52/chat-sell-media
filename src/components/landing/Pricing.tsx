"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Star, Crown, MessageCircle, Download, Zap, Sparkles, ArrowRight } from "lucide-react";
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
    gradient: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "vip",
    name: "VIP",
    description: "Ultimate experience",
    monthlyPrice: 29.99,
    annualPrice: 287.88,
    isPopular: true,
    features: [
      "Full content access",
      "4K resolution downloads",
      "Unlimited downloads",
      "Direct messaging",
      "Early access to new content",
      "Exclusive VIP-only content",
      "Behind-the-scenes access",
      "Priority support",
    ],
    tier: "VIP",
    gradient: "from-[var(--gold)] to-yellow-500",
    iconBg: "bg-[var(--gold)]/20",
    iconColor: "text-[var(--gold)]",
  },
];

interface PricingProps {
  creatorSlug?: string;
}

export function Pricing({ creatorSlug = "miacosta" }: PricingProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const { formatPrice, isLoading } = useCurrency();
  const basePath = `/${creatorSlug}`;

  return (
    <section id="membership" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--gold)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-4 h-4" />
            Membership Plans
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Choose Your{" "}
            <span className="gradient-gold-text">Access</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Unlock exclusive content with a plan that fits your needs
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mb-14"
        >
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !isAnnual ? "text-white" : "text-gray-500"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn(
              "relative w-16 h-8 rounded-full transition-colors p-1",
              isAnnual ? "bg-[var(--gold)]" : "bg-white/10"
            )}
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-white shadow-lg"
              animate={{ x: isAnnual ? 32 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              isAnnual ? "text-white" : "text-gray-500"
            )}
          >
            Annual
          </span>
          {isAnnual && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold"
            >
              Save 20%
            </motion.span>
          )}
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={cn(
                "relative rounded-3xl overflow-hidden",
                plan.isPopular ? "md:scale-105 z-10" : ""
              )}
            >
              {/* Popular badge */}
              {plan.isPopular && (
                <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-[var(--gold)] via-yellow-500 to-[var(--gold)]" />
              )}

              <div className={cn(
                "p-8 h-full border rounded-3xl transition-all duration-300",
                plan.isPopular
                  ? "bg-gradient-to-b from-[var(--gold)]/10 to-transparent border-[var(--gold)]/30 hover:border-[var(--gold)]/50"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              )}>
                {plan.isPopular && (
                  <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--gold)] text-black text-sm font-semibold">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-8">
                  <div className={cn(
                    "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4",
                    plan.iconBg
                  )}>
                    <Crown className={cn("w-7 h-7", plan.iconColor)} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={cn(
                      "text-5xl font-bold text-white",
                      isLoading && "opacity-50"
                    )}>
                      {formatPrice(isAnnual
                        ? plan.annualPrice / 12
                        : plan.monthlyPrice
                      )}
                    </span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-[var(--gold)] mt-2">
                      Billed {formatPrice(plan.annualPrice)}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        plan.isPopular ? "bg-[var(--gold)]/20" : "bg-green-500/20"
                      )}>
                        <Check
                          className={cn(
                            "w-3 h-3",
                            plan.isPopular ? "text-[var(--gold)]" : "text-green-400"
                          )}
                        />
                      </div>
                      <span className="text-sm text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={`${basePath}/checkout?plan=${plan.id}&interval=${isAnnual ? "annual" : "monthly"}`}>
                  <Button
                    variant={plan.isPopular ? "premium" : "gold-outline"}
                    className="w-full gap-2 group"
                    size="lg"
                  >
                    Get {plan.name}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-sm text-gray-500 mb-4">
            Secure payments powered by
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white font-medium">Stripe</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[#F7931A] font-medium">Bitcoin</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[#627EEA] font-medium">Ethereum</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
