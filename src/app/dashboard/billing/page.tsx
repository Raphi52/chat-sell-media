"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, Button, Badge } from "@/components/ui";
import {
  CreditCard,
  Bitcoin,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Image,
  MessageSquare,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Demo data
const transactions = [
  {
    id: "1",
    type: "SUBSCRIPTION",
    description: "VIP Monthly Subscription",
    amount: 49.99,
    status: "COMPLETED",
    provider: "STRIPE",
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "2",
    type: "MEDIA_PURCHASE",
    description: "Artistic Vision - Photo Set",
    amount: 4.99,
    status: "COMPLETED",
    provider: "CRYPTO",
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: "3",
    type: "PPV_UNLOCK",
    description: "Exclusive Message Content",
    amount: 9.99,
    status: "COMPLETED",
    provider: "STRIPE",
    createdAt: new Date(Date.now() - 259200000),
  },
  {
    id: "4",
    type: "TIP",
    description: "Tip to Creator",
    amount: 25.0,
    status: "COMPLETED",
    provider: "CRYPTO",
    createdAt: new Date(Date.now() - 345600000),
  },
  {
    id: "5",
    type: "SUBSCRIPTION",
    description: "Premium Annual Subscription",
    amount: 191.88,
    status: "PENDING",
    provider: "CRYPTO",
    createdAt: new Date(Date.now() - 432000000),
  },
];

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
};

const statusIcons: Record<string, any> = {
  COMPLETED: CheckCircle,
  PENDING: Clock,
  FAILED: XCircle,
  REFUNDED: XCircle,
};

export default function BillingPage() {
  const [filter, setFilter] = useState("all");

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  const totalSpent = transactions
    .filter((tx) => tx.status === "COMPLETED")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Billing & Payments
        </h1>
        <p className="text-[var(--muted)]">
          View your payment history and manage your billing
        </p>
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
              <p className="text-xl font-bold text-[var(--foreground)]">
                ${totalSpent.toFixed(2)}
              </p>
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
              <p className="text-xl font-bold text-[var(--foreground)]">VIP</p>
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
              <p className="text-xl font-bold text-[var(--foreground)]">
                {transactions.length}
              </p>
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
          <div className="divide-y divide-[var(--border)]">
            {filteredTransactions.map((tx) => {
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
                        typeColors[tx.type]
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
                          {tx.createdAt.toLocaleDateString()}
                        </span>
                        <span className="text-[var(--muted)]">•</span>
                        <span className="flex items-center gap-1">
                          {tx.provider === "CRYPTO" ? (
                            <Bitcoin className="w-3 h-3 text-orange-500" />
                          ) : (
                            <CreditCard className="w-3 h-3 text-blue-500" />
                          )}
                          <span className="text-[var(--muted)]">
                            {tx.provider === "CRYPTO" ? "Crypto" : "Card"}
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
                        statusColors[tx.status]
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

          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-[var(--muted)]">No transactions found</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Manage Subscription */}
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
                  Manage Subscription
                </h3>
                <p className="text-[var(--muted)]">
                  Update payment method, change plan, or cancel subscription
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Billing Portal
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
