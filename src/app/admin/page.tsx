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
  Camera,
  Film,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAdminCreator } from "@/components/providers/AdminCreatorContext";
import Link from "next/link";

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
  const { selectedCreator } = useAdminCreator();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [topMedia, setTopMedia] = useState<TopMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async (creatorSlug: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?creator=${creatorSlug}`);
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
    fetchStats(selectedCreator.slug);
  }, [selectedCreator.slug]);

  const statsDisplay = [
    {
      label: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0",
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Active Subscribers",
      value: stats?.activeSubscribers?.toString() || "0",
      icon: Users,
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Media Items",
      value: stats?.totalMedia?.toString() || "0",
      icon: Image,
      color: "text-purple-400",
      bgColor: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Messages",
      value: stats?.totalMessages?.toLocaleString() || "0",
      icon: MessageSquare,
      color: "text-[var(--gold)]",
      bgColor: "from-[var(--gold)]/20 to-[var(--gold)]/5",
      borderColor: "border-[var(--gold)]/20",
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
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[var(--gold)] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Creator Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          {/* Background */}
          <div className="absolute inset-0">
            {selectedCreator.coverImage && (
              <img
                src={selectedCreator.coverImage}
                alt=""
                className="w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative p-6 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--gold)]/30 shadow-xl">
              {selectedCreator.avatar ? (
                <img
                  src={selectedCreator.avatar}
                  alt={selectedCreator.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-black text-2xl font-bold">
                  {selectedCreator.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">
                  {selectedCreator.displayName}
                </h1>
                <span className="px-3 py-1 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] text-xs font-semibold">
                  Creator
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">@{selectedCreator.slug}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Camera className="w-4 h-4" />
                  <span>{selectedCreator.stats?.photos || 0} photos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Film className="w-4 h-4" />
                  <span>{selectedCreator.stats?.videos || 0} videos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{selectedCreator.stats?.subscribers || 0} subscribers</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/${selectedCreator.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Page
              </Link>
              <button
                onClick={() => fetchStats(selectedCreator.slug)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsDisplay.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${stat.bgColor} border ${stat.borderColor} overflow-hidden`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-black/30`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
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
          <div className="bg-[#111] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                Recent Payments
              </h2>
              <Link
                href="/admin/payments"
                className="text-[var(--gold)] text-sm hover:underline"
              >
                View all
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-500">No payments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          payment.provider === "NOWPAYMENTS"
                            ? "bg-orange-500/20"
                            : "bg-blue-500/20"
                        }`}
                      >
                        {payment.provider === "NOWPAYMENTS" ? (
                          <Bitcoin className="w-5 h-5 text-orange-400" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {payment.type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-400">
                      ${payment.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-[#111] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                Top Performing Content
              </h2>
              <Link
                href="/admin/media"
                className="text-[var(--gold)] text-sm hover:underline"
              >
                View all
              </Link>
            </div>
            {topMedia.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Image className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-500">No content yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topMedia.map((content, index) => (
                  <div
                    key={content.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold)]/30 to-[var(--gold)]/10 flex items-center justify-center">
                        <span className="text-[var(--gold)] font-bold text-sm">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {content.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {content.views.toLocaleString()} views
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-400">
                      ${content.earnings.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <div className="relative rounded-2xl overflow-hidden border border-[var(--gold)]/20 bg-gradient-to-r from-[var(--gold)]/10 to-transparent p-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)]/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center shadow-lg shadow-[var(--gold)]/20">
              <Sparkles className="w-7 h-7 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">
                Ready to upload new content?
              </h3>
              <p className="text-gray-400">
                Add photos, videos, or exclusive packs for your subscribers.
              </p>
            </div>
            <Link
              href="/admin/media"
              className="px-6 py-3 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[var(--gold)]/30 transition-all"
            >
              Upload Media
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
