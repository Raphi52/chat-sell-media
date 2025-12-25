"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";

interface Stats {
  totalRevenue: number;
  activeSubscribers: number;
  totalMedia: number;
  totalMessages: number;
  totalUsers: number;
}

interface Payment {
  id: string;
  type: string;
  amount: number;
  provider: string;
  createdAt: string;
}

interface TopMedia {
  id: string;
  title: string;
  views: number;
  earnings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [topMedia, setTopMedia] = useState<TopMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentPayments(data.recentPayments || []);
        setTopMedia(data.topMedia || []);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsDisplay = [
    {
      label: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0",
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Active Subscribers",
      value: stats?.activeSubscribers?.toString() || "0",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Media Items",
      value: stats?.totalMedia?.toString() || "0",
      icon: Image,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Messages",
      value: stats?.totalMessages?.toLocaleString() || "0",
      icon: MessageSquare,
      color: "text-[var(--gold)]",
      bgColor: "bg-[var(--gold)]/10",
    },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Dashboard
          </h1>
          <p className="text-[var(--muted)]">
            Welcome back! Here's what's happening with your content.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat, index) => (
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
              <a
                href="/admin/payments"
                className="text-[var(--gold)] text-sm cursor-pointer hover:underline"
              >
                View all
              </a>
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-center text-[var(--muted)] py-8">
                No payments yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.provider === "NOWPAYMENTS"
                            ? "bg-orange-500/10"
                            : "bg-blue-500/10"
                        }`}
                      >
                        {payment.provider === "NOWPAYMENTS" ? (
                          <Bitcoin className="w-5 h-5 text-orange-500" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {payment.type.replace("_", " ")}
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                          {payment.provider}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--foreground)]">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatTimeAgo(payment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <a
                href="/admin/media"
                className="text-[var(--gold)] text-sm cursor-pointer hover:underline"
              >
                View all
              </a>
            </div>
            {topMedia.length === 0 ? (
              <p className="text-center text-[var(--muted)] py-8">
                No content yet
              </p>
            ) : (
              <div className="space-y-4">
                {topMedia.map((content, index) => (
                  <div
                    key={content.id}
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
            )}
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
