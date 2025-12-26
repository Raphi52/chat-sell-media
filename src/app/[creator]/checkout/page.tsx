"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import {
  ArrowLeft,
  Shield,
  Lock,
  Check,
  Loader2,
  Crown,
  Copy,
  QrCode,
  Sparkles,
} from "lucide-react";

// Subscription plans configuration
const plans = {
  basic: {
    id: "basic",
    name: "Basic",
    description: "Perfect for casual fans",
    monthlyPrice: 9.99,
    annualPrice: 95.88,
    tier: "BASIC",
    features: [
      "Access to basic content library",
      "Standard resolution downloads",
      "10 downloads per month",
      "Email support",
    ],
  },
  vip: {
    id: "vip",
    name: "VIP",
    description: "Ultimate experience",
    monthlyPrice: 29.99,
    annualPrice: 287.88,
    tier: "VIP",
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
  },
};

type PlanKey = keyof typeof plans;

const paymentMethods = [
  {
    id: "card",
    name: "Credit Card",
    icon: (
      <div className="flex gap-2">
        <svg className="w-10 h-6" viewBox="0 0 50 32" fill="none">
          <rect width="50" height="32" rx="4" fill="#1A1F71"/>
          <text x="25" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontStyle="italic" fontFamily="Arial">VISA</text>
        </svg>
        <svg className="w-10 h-6" viewBox="0 0 50 32" fill="none">
          <rect width="50" height="32" rx="4" fill="#000"/>
          <circle cx="19" cy="16" r="10" fill="#EB001B"/>
          <circle cx="31" cy="16" r="10" fill="#F79E1B"/>
          <path d="M25 8C27.5 10 29 12.8 29 16C29 19.2 27.5 22 25 24C22.5 22 21 19.2 21 16C21 12.8 22.5 10 25 8Z" fill="#FF5F00"/>
        </svg>
      </div>
    ),
    description: "Visa, Mastercard, Amex",
  },
  {
    id: "crypto",
    name: "Cryptocurrency",
    icon: (
      <div className="flex gap-2">
        <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#F7931A"/>
          <path d="M22.5 13.5c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.7-1.7-.4-.7 2.7c-.4-.1-.7-.2-1-.2l-2.3-.6-.4 1.8s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1-.1 0-.1 0-.2 0l-1.2 4.7c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.6c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.7c3 .6 5.2.3 6.1-2.3.8-2.1 0-3.3-1.6-4.1 1.1-.3 2-1 2.2-2.5zm-4 5.5c-.6 2.3-4.4 1-5.6.7l1-4c1.3.3 5.2 1 4.6 3.3zm.6-5.6c-.5 2.1-3.7.9-4.7.7l.9-3.6c1 .2 4.4.7 3.8 2.9z" fill="white"/>
        </svg>
        <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#627EEA"/>
          <path d="M16 4L9 16.5 16 21l7-4.5L16 4z" fill="white" fillOpacity="0.6"/>
          <path d="M9 17.5L16 28l7-10.5L16 22l-7-4.5z" fill="white"/>
        </svg>
      </div>
    ),
    description: "Bitcoin, Ethereum",
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const creatorSlug = params.creator as string;
  const basePath = `/${creatorSlug}`;
  const { data: session, status } = useSession();
  const { formatPrice } = useCurrency();

  const [selectedPayment, setSelectedPayment] = useState("card");
  const [selectedCrypto, setSelectedCrypto] = useState<"btc" | "eth" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cryptoPayment, setCryptoPayment] = useState<{
    payAddress: string;
    payAmount: number;
    payCurrency: string;
    qrCodeUrl?: string;
  } | null>(null);

  // Get plan from URL
  const planId = searchParams.get("plan") as PlanKey;
  const interval = searchParams.get("interval") || "monthly";
  const plan = planId ? plans[planId] : null;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(`${basePath}/checkout?plan=${planId}&interval=${interval}`);
      router.push(`${basePath}/auth/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, router, planId, interval, basePath]);

  const price = plan ? (interval === "annual" ? plan.annualPrice : plan.monthlyPrice) : 0;

  // Handle payment
  const handlePayment = async () => {
    if (!plan) return;
    setProcessing(true);

    try {
      if (selectedPayment === "crypto") {
        // Create crypto payment with QR code
        const response = await fetch("/api/payments/crypto/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subscription",
            planId: plan.id.toUpperCase(),
            billingInterval: interval === "annual" ? "ANNUAL" : "MONTHLY",
            currency: selectedCrypto || "btc",
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create payment");
        }

        const data = await response.json();

        // Show payment details with QR code
        setCryptoPayment({
          payAddress: data.payAddress,
          payAmount: data.payAmount,
          payCurrency: data.payCurrency,
          qrCodeUrl: data.qrCodeUrl,
        });
      } else {
        // Stripe checkout
        const response = await fetch("/api/payments/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subscription",
            planId: plan.id.toUpperCase(),
            billingInterval: interval === "annual" ? "ANNUAL" : "MONTHLY",
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create checkout");
        }

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <Card variant="luxury" className="p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-4">
            Plan not found
          </h1>
          <p className="text-[var(--muted)] mb-6">
            The subscription plan you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href={`${basePath}#membership`}>
            <Button variant="premium">View Plans</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`${basePath}#membership`}
            className="inline-flex items-center text-[var(--muted)] hover:text-[var(--foreground)] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to plans
          </Link>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Payment Methods */}
            <Card variant="luxury" className="p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Payment Method
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      selectedPayment === method.id
                        ? "border-[var(--gold)] bg-[var(--gold)]/10"
                        : "border-[var(--border)] hover:border-[var(--gold)]/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === method.id
                          ? "border-[var(--gold)]"
                          : "border-[var(--muted)]"
                      }`}
                    >
                      {selectedPayment === method.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
                      )}
                    </div>
                    <div className="flex-shrink-0">{method.icon}</div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-[var(--foreground)]">{method.name}</p>
                      <p className="text-xs text-[var(--muted)]">{method.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Crypto selection - BTC and ETH only */}
            {selectedPayment === "crypto" && !cryptoPayment && (
              <Card variant="luxury" className="p-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Select Cryptocurrency
                </h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { id: "btc", name: "Bitcoin", symbol: "BTC", color: "#F7931A" },
                    { id: "eth", name: "Ethereum", symbol: "ETH", color: "#627EEA" },
                  ].map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => setSelectedCrypto(crypto.id as "btc" | "eth")}
                      className={`p-4 rounded-lg border transition-colors text-center ${
                        selectedCrypto === crypto.id
                          ? "border-[var(--gold)] bg-[var(--gold)]/10"
                          : "border-[var(--border)] hover:border-[var(--gold)]"
                      }`}
                    >
                      <div
                        className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${crypto.color}20` }}
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ color: crypto.color }}
                        >
                          {crypto.symbol.charAt(0)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {crypto.symbol}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{crypto.name}</p>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Crypto QR Code Payment */}
            {selectedPayment === "crypto" && cryptoPayment && (
              <Card variant="luxury" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Scan to Pay
                  </h2>
                  <button
                    onClick={() => {
                      setCryptoPayment(null);
                      setSelectedCrypto(null);
                    }}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Change
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  {/* QR Code */}
                  {cryptoPayment.qrCodeUrl && (
                    <div className="bg-white p-3 rounded-lg mb-4">
                      <img
                        src={cryptoPayment.qrCodeUrl}
                        alt="Payment QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  )}

                  {/* Amount */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-[var(--muted)] mb-1">Send exactly:</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {cryptoPayment.payAmount} {cryptoPayment.payCurrency.toUpperCase()}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="w-full bg-black/50 p-3 rounded-lg border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] mb-2">To this address:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-[var(--gold)] break-all">
                        {cryptoPayment.payAddress}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cryptoPayment.payAddress);
                        }}
                        className="p-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] rounded transition-colors flex-shrink-0"
                        title="Copy address"
                      >
                        <Copy className="w-4 h-4 text-[var(--muted)]" />
                      </button>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="mt-4 bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-lg p-3 w-full">
                    <p className="text-xs text-[var(--gold)] text-center">
                      Your subscription will be activated automatically once payment is confirmed (10-30 min)
                    </p>
                  </div>

                  {/* Dashboard link */}
                  <Link href={`${basePath}/dashboard/billing`} className="mt-4">
                    <Button variant="gold-outline" size="sm">
                      Check Payment Status
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* Pay Button */}
            {!cryptoPayment && (
              <Button
                variant="premium"
                size="lg"
                className="w-full"
                onClick={handlePayment}
                disabled={processing || (selectedPayment === "crypto" && !selectedCrypto)}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    {selectedPayment === "crypto" ? "Pay with Crypto" : `Pay ${formatPrice(price)}`}
                  </>
                )}
              </Button>
            )}

            {/* Security badges */}
            <div className="flex items-center justify-center gap-6 text-[var(--muted)]">
              <div className="flex items-center gap-2 text-xs">
                <Lock className="w-4 h-4" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="w-4 h-4" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card variant="featured" className="p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Order Summary
              </h2>

              {/* Product */}
              <div className="flex items-start gap-4 pb-4 border-b border-[var(--border)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--foreground)]">{plan.name}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {interval === "annual" ? "Annual" : "Monthly"} subscription
                  </p>
                </div>
              </div>

              {/* Features */}
              <ul className="py-4 space-y-2 border-b border-[var(--border)]">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-[var(--gold)] mr-2 flex-shrink-0" />
                    <span className="text-[var(--foreground-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing */}
              <div className="py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Subscription</span>
                  <span className="text-[var(--foreground)]">{formatPrice(price)}</span>
                </div>
                {interval === "annual" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Savings</span>
                    <span className="text-emerald-500">
                      -{formatPrice((plan.monthlyPrice * 12) - plan.annualPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-semibold text-[var(--foreground)]">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[var(--foreground)]">
                      {formatPrice(price)}
                    </span>
                    <span className="text-[var(--muted)] text-sm ml-1">
                      /{interval === "annual" ? "year" : "month"}
                    </span>
                  </div>
                </div>
                {interval === "annual" && (
                  <p className="text-xs text-[var(--muted)] text-right mt-1">
                    ({formatPrice(plan.annualPrice / 12)}/month)
                  </p>
                )}
              </div>

              {/* Trial info */}
              <div className="mt-6 p-3 bg-[var(--gold)]/10 rounded-lg flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[var(--gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--gold)]">
                    7-Day Free Trial
                  </p>
                  <p className="text-xs text-[var(--gold)]/80">
                    Cancel anytime during your trial at no charge.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
