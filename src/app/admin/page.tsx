"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui";
import {
  DollarSign,
  Users,
  Image,
  MessageSquare,
  TrendingUp,
  Crown,
  CreditCard,
  Bitcoin,
} from "lucide-react";

const stats = [
  {
    label: "Total Revenue",
    value: "$12,450",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Active Subscribers",
    value: "284",
    change: "+8.2%",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    label: "Media Items",
    value: "156",
    change: "+24",
    icon: Image,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    label: "Messages",
    value: "1,247",
    change: "+156",
    icon: MessageSquare,
    color: "text-[var(--gold)]",
    bgColor: "bg-[var(--gold)]/10",
  },
];

const recentPayments = [
  {
    id: 1,
    user: "John D.",
    type: "Subscription",
    plan: "VIP",
    amount: 49.99,
    method: "card",
    time: "2 min ago",
  },
  {
    id: 2,
    user: "Sarah M.",
    type: "PPV Unlock",
    plan: null,
    amount: 9.99,
    method: "crypto",
    time: "15 min ago",
  },
  {
    id: 3,
    user: "Mike R.",
    type: "Subscription",
    plan: "Premium",
    amount: 19.99,
    method: "card",
    time: "1 hour ago",
  },
  {
    id: 4,
    user: "Emily K.",
    type: "Tip",
    plan: null,
    amount: 25.0,
    method: "crypto",
    time: "2 hours ago",
  },
  {
    id: 5,
    user: "David L.",
    type: "Media",
    plan: null,
    amount: 4.99,
    method: "card",
    time: "3 hours ago",
  },
];

const topContent = [
  { title: "VIP Exclusive #12", views: 1247, earnings: 2450 },
  { title: "Behind the Scenes", views: 892, earnings: 1890 },
  { title: "Private Collection", views: 756, earnings: 1560 },
  { title: "Studio Session", views: 623, earnings: 1240 },
];

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Dashboard
        </h1>
        <p className="text-[var(--muted)]">
          Welcome back! Here's what's happening with your content.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="luxury" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                {stat.value}
              </h3>
              <p className="text-[var(--muted)] text-sm">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="luxury" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Recent Payments
              </h2>
              <span className="text-[var(--gold)] text-sm cursor-pointer hover:underline">
                View all
              </span>
            </div>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.method === "crypto"
                          ? "bg-orange-500/10"
                          : "bg-blue-500/10"
                      }`}
                    >
                      {payment.method === "crypto" ? (
                        <Bitcoin className="w-5 h-5 text-orange-500" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {payment.user}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {payment.type}
                        {payment.plan && (
                          <span className="ml-1 text-[var(--gold)]">
                            ({payment.plan})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--foreground)]">
                      ${payment.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{payment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Top Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="luxury" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Top Performing Content
              </h2>
              <span className="text-[var(--gold)] text-sm cursor-pointer hover:underline">
                View all
              </span>
            </div>
            <div className="space-y-4">
              {topContent.map((content, index) => (
                <div
                  key={content.title}
                  className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center">
                      <span className="text-[var(--gold)] font-bold text-sm">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {content.title}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {content.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-500">
                      ${content.earnings.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <Card variant="featured" className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-[var(--gold)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Ready to upload new content?
              </h3>
              <p className="text-[var(--muted)]">
                Add photos, videos, or exclusive packs for your subscribers.
              </p>
            </div>
            <a
              href="/admin/media"
              className="px-6 py-3 bg-[var(--gold)] text-[var(--background)] font-semibold rounded-xl hover:bg-[var(--gold-light)] transition-colors"
            >
              Upload Media
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
