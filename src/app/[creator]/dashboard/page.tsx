"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Crown,
  Image,
  MessageCircle,
  Star,
  ArrowRight,
  Play,
  Lock,
  Loader2,
} from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  thumbnail: string;
  isLocked: boolean;
  accessTier: string;
}

interface DashboardStats {
  unlockedContent: number;
  messageCount: number;
  currentPlan: string;
  planTier: string;
  canMessage: boolean;
}

interface Subscription {
  id: string;
  planName: string;
  accessTier: string;
  status: string;
  currentPeriodEnd: string;
  canMessage: boolean;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/user/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setSubscription(data.subscription);
          setRecentContent(data.recentContent || []);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const isPremium = subscription && subscription.accessTier !== "FREE";

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-semibold text-[var(--foreground)] mb-2">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-[var(--muted)]">
          Here&apos;s what&apos;s happening with your account
        </p>
      </motion.div>

      {/* Subscription Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card
          variant="featured"
          className="p-6 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="flex-1">
            <Badge variant="vip" className="mb-3">
              <Star className="w-3 h-3 mr-1" />
              {isPremium ? subscription.planName : "Free Account"}
            </Badge>
            {isPremium ? (
              <>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  You&apos;re a {subscription.planName} member!
                </h2>
                <p className="text-[var(--muted)] mb-4">
                  Enjoy your exclusive access to premium content and features.
                </p>
                <Link href="/dashboard/subscription">
                  <Button variant="outline" className="gap-2">
                    Manage Subscription
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  Upgrade to Premium
                </h2>
                <p className="text-[var(--muted)] mb-4">
                  Unlock all exclusive content, direct messaging, and more!
                </p>
                <Link href="/dashboard/subscription">
                  <Button variant="premium" className="gap-2">
                    <Crown className="w-4 h-4" />
                    View Plans
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
              <Crown className="w-16 h-16 text-[var(--gold)]" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
              <Image className="w-6 h-6 text-[var(--gold)]" />
            </div>
            <div>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
              ) : (
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {stats?.unlockedContent || 0}
                </p>
              )}
              <p className="text-sm text-[var(--muted)]">Unlocked Content</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[var(--gold)]" />
            </div>
            <div>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
              ) : (
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {stats?.messageCount || 0}
                </p>
              )}
              <p className="text-sm text-[var(--muted)]">Messages</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-[var(--gold)]" />
            </div>
            <div>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
              ) : (
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {stats?.currentPlan || "Free"}
                </p>
              )}
              <p className="text-sm text-[var(--muted)]">Current Plan</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Recent Content
          </h2>
          <Link href="/gallery">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
          </div>
        ) : recentContent.length === 0 ? (
          <Card className="p-8 text-center">
            <Image className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <p className="text-[var(--muted)]">No content available yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentContent.map((item) => (
              <Link key={item.id} href={`/gallery?id=${item.id}`}>
                <Card
                  variant="luxury"
                  hover
                  className="overflow-hidden p-0 cursor-pointer"
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className={`w-full h-full object-cover ${
                        item.isLocked ? "blur-lg" : ""
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {item.isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center">
                          <Lock className="w-5 h-5 text-[var(--background)]" />
                        </div>
                      </div>
                    )}

                    {item.type === "video" && !item.isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center">
                          <Play
                            className="w-5 h-5 text-[var(--background)] ml-0.5"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant={item.type === "video" ? "video" : "photo"}>
                        {item.type}
                      </Badge>
                      <Badge
                        className={
                          item.accessTier === "VIP"
                            ? "bg-[var(--gold)]/20 text-[var(--gold)]"
                            : item.accessTier === "BASIC"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }
                      >
                        {item.accessTier}
                      </Badge>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-medium">{item.title}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
