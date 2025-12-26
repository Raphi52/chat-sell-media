"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, Button, Badge } from "@/components/ui";
import {
  Crown,
  Check,
  Zap,
  Star,
  CreditCard,
  Bitcoin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "BASIC",
    name: "Basic",
    monthlyPrice: 9.99,
    annualPrice: 95.88,
    features: [
      "Access to basic content library",
      "Standard resolution downloads",
      "10 downloads per month",
      "Email support",
    ],
    color: "blue",
    icon: Zap,
  },
  {
    id: "PREMIUM",
    name: "Premium",
    monthlyPrice: 19.99,
    annualPrice: 191.88,
    features: [
      "Full content access",
      "4K resolution downloads",
      "Unlimited downloads",
      "Direct messaging",
      "Early access to new content",
      "Priority support",
    ],
    color: "purple",
    isPopular: true,
    icon: Star,
  },
  {
    id: "VIP",
    name: "VIP",
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
    color: "gold",
    icon: Crown,
  },
];

const cryptoCurrencies = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", icon: "₿", color: "#F7931A" },
  { id: "eth", name: "Ethereum", symbol: "ETH", icon: "Ξ", color: "#627EEA" },
];

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [isProcessing, setIsProcessing] = useState(false);

  // Demo: No current subscription
  const currentSubscription = null;

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);
    setSelectedPlan(planId);

    try {
      if (paymentMethod === "card") {
        // Stripe checkout
        const response = await fetch("/api/payments/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subscription",
            planId,
            billingInterval,
          }),
        });

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        // Crypto payment
        const response = await fetch("/api/payments/crypto/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subscription",
            planId,
            billingInterval,
            currency: selectedCrypto,
          }),
        });

        const data = await response.json();
        if (data.payAddress) {
          // Show payment modal with address
          alert(`Send ${data.payAmount} ${data.payCurrency.toUpperCase()} to:\n${data.payAddress}`);
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
          Choose Your Plan
        </h1>
        <p className="text-[var(--muted)] max-w-2xl mx-auto">
          Unlock exclusive content and features with our premium membership plans.
          Cancel anytime.
        </p>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center gap-4 mb-8"
      >
        <button
          onClick={() => setBillingInterval("MONTHLY")}
          className={cn(
            "px-6 py-2 rounded-full font-medium transition-all",
            billingInterval === "MONTHLY"
              ? "bg-[var(--gold)] text-[var(--background)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingInterval("ANNUAL")}
          className={cn(
            "px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2",
            billingInterval === "ANNUAL"
              ? "bg-[var(--gold)] text-[var(--background)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          Annual
          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
            Save 20%
          </Badge>
        </button>
      </motion.div>

      {/* Payment Method Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-center gap-4 mb-8"
      >
        <button
          onClick={() => setPaymentMethod("card")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
            paymentMethod === "card"
              ? "border-[var(--gold)] bg-[var(--gold)]/10"
              : "border-[var(--border)] hover:border-[var(--gold)]/50"
          )}
        >
          <CreditCard className={cn(
            "w-5 h-5",
            paymentMethod === "card" ? "text-[var(--gold)]" : "text-[var(--muted)]"
          )} />
          <span className={paymentMethod === "card" ? "text-[var(--gold)]" : "text-[var(--muted)]"}>
            Card
          </span>
        </button>
        <button
          onClick={() => setPaymentMethod("crypto")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
            paymentMethod === "crypto"
              ? "border-[var(--gold)] bg-[var(--gold)]/10"
              : "border-[var(--border)] hover:border-[var(--gold)]/50"
          )}
        >
          <Bitcoin className={cn(
            "w-5 h-5",
            paymentMethod === "crypto" ? "text-[var(--gold)]" : "text-[var(--muted)]"
          )} />
          <span className={paymentMethod === "crypto" ? "text-[var(--gold)]" : "text-[var(--muted)]"}>
            Crypto
          </span>
        </button>
      </motion.div>

      {/* Crypto Currency Selection */}
      {paymentMethod === "crypto" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          {cryptoCurrencies.map((crypto) => (
            <button
              key={crypto.id}
              onClick={() => setSelectedCrypto(crypto.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                selectedCrypto === crypto.id
                  ? "border-[var(--gold)] bg-[var(--surface)]"
                  : "border-[var(--border)] hover:border-[var(--gold)]/50"
              )}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: crypto.color }}
              >
                {crypto.icon}
              </span>
              <span className={cn(
                "font-medium",
                selectedCrypto === crypto.id ? "text-[var(--foreground)]" : "text-[var(--muted)]"
              )}>
                {crypto.symbol}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const price = billingInterval === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;
          const monthlyEquivalent = billingInterval === "ANNUAL" ? plan.annualPrice / 12 : plan.monthlyPrice;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card
                variant={plan.isPopular ? "featured" : "luxury"}
                className={cn(
                  "p-6 relative overflow-hidden",
                  plan.isPopular && "ring-2 ring-[var(--gold)]"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[var(--gold)] text-[var(--background)]">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                      plan.color === "gold"
                        ? "bg-[var(--gold)]/10"
                        : plan.color === "purple"
                        ? "bg-purple-500/10"
                        : "bg-blue-500/10"
                    )}
                  >
                    <plan.icon
                      className={cn(
                        "w-7 h-7",
                        plan.color === "gold"
                          ? "text-[var(--gold)]"
                          : plan.color === "purple"
                          ? "text-purple-500"
                          : "text-blue-500"
                      )}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-[var(--foreground)]">
                      ${monthlyEquivalent.toFixed(2)}
                    </span>
                    <span className="text-[var(--muted)]">/mo</span>
                  </div>
                  {billingInterval === "ANNUAL" && (
                    <p className="text-sm text-[var(--muted)] mt-1">
                      Billed ${price.toFixed(2)} annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-[var(--muted)]"
                    >
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.isPopular ? "premium" : "outline"}
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing && selectedPlan === plan.id}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Features Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <Card variant="luxury" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-[var(--gold)]" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Subscription Benefits
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-[var(--foreground)] mb-2">
                Flexible Billing
              </h4>
              <p className="text-[var(--muted)]">
                Pay monthly or save 20% with annual billing. Cancel anytime with no
                hidden fees.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--foreground)] mb-2">
                Multiple Payment Options
              </h4>
              <p className="text-[var(--muted)]">
                Pay with credit/debit cards or cryptocurrency (Bitcoin, Ethereum).
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--foreground)] mb-2">
                Instant Access
              </h4>
              <p className="text-[var(--muted)]">
                Get immediate access to your tier's content as soon as your payment
                is confirmed.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
