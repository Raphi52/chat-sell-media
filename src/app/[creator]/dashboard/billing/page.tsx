"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Button, Badge } from "@/components/ui";
import {
  CreditCard,
  Bitcoin,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Image,
  MessageSquare,
  Gift,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
}

interface BillingSummary {
  totalSpent: number;
  transactionCount: number;
  currentPlan: string;
  nextBillingDate: string | null;
}

const typeIcons: Record<string, any> = {
  SUBSCRIPTION: Crown,
  MEDIA_PURCHASE: Image,
  PPV_UNLOCK: MessageSquare,
  TIP: Gift,
};

const typeColors: Record<string, string> = {
  SUBSCRIPTION: "bg-purple-500/20 text-purple-400",
  MEDIA_PURCHASE: "bg-blue-500/20 text-blue-400",
  PPV_UNLOCK: "bg-emerald-500/20 text-emerald-400",
  TIP: "bg-[var(--gold)]/20 text-[var(--gold)]",
};

const statusColors: Record<string, string> = {
  COMPLETED: "text-emerald-500",
  PENDING: "text-yellow-500",
  FAILED: "text-red-500",
  REFUNDED: "text-blue-500",
  CANCELLED: "text-gray-500",
};

const statusIcons: Record<string, any> = {
  COMPLETED: CheckCircle,
  PENDING: Clock,
  FAILED: XCircle,
  REFUNDED: XCircle,
  CANCELLED: XCircle,
};

export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchBilling = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.set("type", filter);

      const res = await fetch(`/api/user/billing?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching billing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Billing & Payments
          </h1>
          <p className="text-[var(--muted)]">
            View your payment history and manage your billing
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchBilling}>
          <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Card variant="luxury" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Total Spent</p>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
              ) : (
                <p className="text-xl font-bold text-[var(--foreground)]">
                  ${(summary?.totalSpent || 0).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card variant="luxury" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Current Plan</p>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
              ) : (
                <p className="text-xl font-bold text-[var(--foreground)]">
                  {summary?.currentPlan || "Free"}
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card variant="luxury" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Transactions</p>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
              ) : (
                <p className="text-xl font-bold text-[var(--foreground)]">
                  {summary?.transactionCount || 0}
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        {[
          { id: "all", label: "All" },
          { id: "SUBSCRIPTION", label: "Subscriptions" },
          { id: "MEDIA_PURCHASE", label: "Purchases" },
          { id: "PPV_UNLOCK", label: "Unlocks" },
          { id: "TIP", label: "Tips" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === item.id
                ? "bg-[var(--gold)] text-[var(--background)]"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            )}
          >
            {item.label}
          </button>
        ))}
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="luxury" className="overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">
              Transaction History
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
              <p className="text-[var(--muted)]">No transactions found</p>
              <p className="text-sm text-[var(--muted)] mt-1">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {transactions.map((tx) => {
                const Icon = typeIcons[tx.type] || CreditCard;
                const StatusIcon = statusIcons[tx.status] || Clock;

                return (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          typeColors[tx.type] || "bg-gray-500/20 text-gray-400"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[var(--muted)]">
                            {formatDate(tx.createdAt)}
                          </span>
                          <span className="text-[var(--muted)]">•</span>
                          <span className="flex items-center gap-1">
                            {tx.provider === "NOWPAYMENTS" ? (
                              <Bitcoin className="w-3 h-3 text-orange-500" />
                            ) : (
                              <CreditCard className="w-3 h-3 text-blue-500" />
                            )}
                            <span className="text-[var(--muted)]">
                              {tx.provider === "NOWPAYMENTS" ? "Crypto" : "Card"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--foreground)]">
                        ${tx.amount.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          "text-sm flex items-center gap-1 justify-end",
                          statusColors[tx.status] || "text-gray-500"
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Manage Subscription */}
      {summary?.currentPlan !== "Free" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card variant="featured" className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {summary?.currentPlan} Subscription
                  </h3>
                  <p className="text-[var(--muted)]">
                    {summary?.nextBillingDate
                      ? `Next billing: ${formatDate(summary.nextBillingDate)}`
                      : "Manage your subscription settings"}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Manage
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
