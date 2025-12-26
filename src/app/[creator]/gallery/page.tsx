"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button, Badge, Card } from "@/components/ui";
import {
  Play,
  Lock,
  Image as ImageIcon,
  Grid,
  LayoutGrid,
  X,
  Crown,
  Loader2,
  Check,
  ShoppingBag,
  CreditCard,
  Bitcoin,
  Sparkles,
  Camera,
  Film,
  Eye,
  Heart,
  Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CryptoPaymentModal } from "@/components/payments";

const categories = [
  { id: "All", label: "All", icon: Sparkles },
  { id: "Photos", label: "Photos", icon: Camera },
  { id: "Videos", label: "Videos", icon: Film },
  { id: "Exclusive", label: "VIP", icon: Crown },
  { id: "Free", label: "Free", icon: Heart },
];

interface MediaItem {
  id: string;
  type: "PHOTO" | "VIDEO" | "AUDIO" | "PACK";
  title: string;
  thumbnailUrl: string | null;
  contentUrl: string;
  accessTier: "FREE" | "BASIC" | "VIP";
  isPurchaseable: boolean;
  price: number | null;
  duration: number | null;
  hasAccess?: boolean;
  hasPurchased?: boolean;
}

const tierVariants: Record<string, "free" | "basic" | "vip" | "premium"> = {
  FREE: "free",
  BASIC: "basic",
  PREMIUM: "premium",
  VIP: "vip",
};

export default function GalleryPage() {
  const params = useParams();
  const creatorSlug = params.creator as string;
  const { data: session } = useSession();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [isGridView, setIsGridView] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [userTier, setUserTier] = useState<string>("FREE");
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [showPaymentChoice, setShowPaymentChoice] = useState<string | null>(null);
  const [showCryptoModal, setShowCryptoModal] = useState<{
    mediaId: string;
    title: string;
    price: number;
  } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { formatPrice } = useCurrency();

  const tierOrder = ["FREE", "BASIC", "VIP"];

  const hasAccessToMedia = (item: MediaItem) => {
    if (item.accessTier === "FREE") return true;
    if (purchasedIds.has(item.id)) return true;
    const userTierIndex = tierOrder.indexOf(userTier);
    const mediaTierIndex = tierOrder.indexOf(item.accessTier);
    return userTierIndex >= mediaTierIndex;
  };

  useEffect(() => {
    const fetchUserAccess = async () => {
      if (!session?.user?.id) return;
      try {
        const subRes = await fetch("/api/user/subscription");
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.subscription?.plan?.accessTier) {
            setUserTier(subData.subscription.plan.accessTier);
          }
        }
        const libRes = await fetch("/api/user/library?tab=purchased");
        if (libRes.ok) {
          const libData = await libRes.json();
          const ids = new Set<string>(
            libData.purchasedContent?.map((item: any) => item.id) || []
          );
          setPurchasedIds(ids);
        }
      } catch (error) {
        console.error("Error fetching user access:", error);
      }
    };
    fetchUserAccess();
  }, [session?.user?.id]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch("/api/media?published=true");
        if (res.ok) {
          const data = await res.json();
          setMediaItems(data.media || []);
        }
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const handlePurchase = (mediaId: string) => {
    if (!session?.user) {
      router.push(`/${creatorSlug}/auth/login?callbackUrl=/${creatorSlug}/gallery`);
      return;
    }
    setShowPaymentChoice(mediaId);
  };

  const handleStripePurchase = async (mediaId: string) => {
    setShowPaymentChoice(null);
    setIsPurchasing(mediaId);
    try {
      const res = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "media", mediaId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else {
        const error = await res.json();
        if (error.error === "Already purchased") {
          setPurchasedIds((prev) => new Set([...prev, mediaId]));
          alert("Vous avez déjà acheté ce média!");
        } else {
          alert(error.error || "Erreur lors de l'achat");
        }
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Erreur lors de l'achat");
    } finally {
      setIsPurchasing(null);
    }
  };

  const handleCryptoPurchase = (mediaId: string) => {
    setShowPaymentChoice(null);
    const item = mediaItems.find((m) => m.id === mediaId);
    if (item && item.price) {
      setShowCryptoModal({ mediaId, title: item.title, price: item.price });
    }
  };

  const filteredMedia = mediaItems.filter((item) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Photos") return item.type === "PHOTO";
    if (activeCategory === "Videos") return item.type === "VIDEO";
    if (activeCategory === "Exclusive") return item.accessTier === "VIP";
    if (activeCategory === "Free") return item.accessTier === "FREE";
    return true;
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const stats = {
    photos: mediaItems.filter((m) => m.type === "PHOTO").length,
    videos: mediaItems.filter((m) => m.type === "VIDEO").length,
    exclusive: mediaItems.filter((m) => m.accessTier === "VIP").length,
  };

  return (
    <>
      <Navbar creatorSlug={creatorSlug} />
      <main className="min-h-screen bg-black">
        {/* Hero Header */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--gold)]/5 via-transparent to-black" />
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--gold)]/10 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-20 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Sparkles className="w-4 h-4" />
                Exclusive Collection
              </motion.span>
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
                My <span className="gradient-gold-text-animated">Gallery</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Browse through my exclusive collection of photos and videos
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap justify-center gap-6 mb-12"
            >
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                <Camera className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.photos}</p>
                  <p className="text-xs text-gray-500">Photos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                <Film className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.videos}</p>
                  <p className="text-xs text-gray-500">Videos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                <Crown className="w-5 h-5 text-[var(--gold)]" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.exclusive}</p>
                  <p className="text-xs text-gray-500">VIP Only</p>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-black shadow-lg shadow-[var(--gold)]/25"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {category.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  onClick={() => setIsGridView(true)}
                  className={cn(
                    "p-2.5 rounded-lg transition-all",
                    isGridView
                      ? "bg-[var(--gold)] text-black"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={cn(
                    "p-2.5 rounded-lg transition-all",
                    !isGridView
                      ? "bg-[var(--gold)] text-black"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gallery Content */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-[var(--gold)]/20 border-t-[var(--gold)] animate-spin" />
                  <Sparkles className="w-6 h-6 text-[var(--gold)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-400 mt-4">Loading content...</p>
              </div>
            ) : (
              /* Gallery Grid */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  "grid gap-4",
                  isGridView
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {filteredMedia.map((item, index) => {
                  const canAccess = hasAccessToMedia(item);
                  const isPurchased = purchasedIds.has(item.id);
                  const isHovered = hoveredItem === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedMedia(item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className={cn(
                        "relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300",
                        isHovered && "border-[var(--gold)]/50 shadow-xl shadow-[var(--gold)]/10",
                        isGridView ? "aspect-[3/4]" : "aspect-video"
                      )}>
                        {/* Image */}
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-600" />
                          </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                        {/* Gold glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--gold)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Top badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                          <Badge
                            variant={item.type === "VIDEO" ? "video" : "photo"}
                            className="backdrop-blur-sm"
                          >
                            {item.type === "VIDEO" ? (
                              <>
                                <Play className="w-3 h-3" fill="currentColor" />
                                {formatDuration(item.duration)}
                              </>
                            ) : (
                              <>
                                <Camera className="w-3 h-3" />
                                Photo
                              </>
                            )}
                          </Badge>
                          <Badge
                            variant={tierVariants[item.accessTier] || "default"}
                            className="backdrop-blur-sm"
                          >
                            {item.accessTier === "VIP" && <Crown className="w-3 h-3" />}
                            {item.accessTier}
                          </Badge>
                        </div>

                        {/* Status badge - Top Right */}
                        <div className="absolute top-3 right-3 z-10">
                          {isPurchased ? (
                            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          ) : !canAccess ? (
                            <motion.div
                              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                              animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
                            >
                              <Lock className="w-4 h-4 text-white" />
                            </motion.div>
                          ) : null}
                        </div>

                        {/* Play button for videos */}
                        {item.type === "VIDEO" && canAccess && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                          >
                            <motion.div
                              className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center shadow-xl shadow-[var(--gold)]/30"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
                            </motion.div>
                          </motion.div>
                        )}

                        {/* Content info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                          <h3 className="text-white font-semibold text-base mb-2 line-clamp-1 group-hover:text-[var(--gold-light)] transition-colors">
                            {item.title}
                          </h3>
                          {item.price && item.isPurchaseable && !isPurchased && !canAccess && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                              className="flex items-center gap-2"
                            >
                              <Badge variant="price" className="text-sm px-3 py-1">
                                {formatPrice(item.price)}
                              </Badge>
                              <span className="text-xs text-gray-400">One-time purchase</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Hover border effect */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Empty state */}
            {!isLoading && filteredMedia.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--gold)]/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-10 h-10 text-[var(--gold)]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No content found
                </h3>
                <p className="text-gray-400 mb-6">
                  Try changing your filters to see more content
                </p>
                <Button
                  variant="gold-outline"
                  onClick={() => setActiveCategory("All")}
                >
                  View All Content
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedMedia(null)}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
              onClick={() => setSelectedMedia(null)}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full mx-4"
            >
              {(() => {
                const item = mediaItems.find((m) => m.id === selectedMedia);
                if (!item) return null;

                const canAccess = hasAccessToMedia(item);
                const isPurchased = purchasedIds.has(item.id);
                const canBuy = item.isPurchaseable && item.price && !canAccess;

                return (
                  <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    <div className="relative aspect-video">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className={cn(
                            "w-full h-full object-cover",
                            !canAccess && "blur-2xl scale-110"
                          )}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <ImageIcon className="w-20 h-20 text-gray-600" />
                        </div>
                      )}

                      {/* Locked overlay */}
                      {!canAccess && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center px-6"
                          >
                            <motion.div
                              className="w-24 h-24 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[var(--gold)]/30"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Lock className="w-10 h-10 text-black" />
                            </motion.div>
                            <h3 className="text-3xl font-bold text-white mb-2">
                              {item.accessTier === "VIP" ? "VIP Content" : "Premium Content"}
                            </h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                              {canBuy
                                ? "Purchase this content for one-time access"
                                : "Subscribe to unlock this exclusive content"}
                            </p>
                            {canBuy ? (
                              <Button
                                variant="premium"
                                size="lg"
                                className="gap-2 px-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePurchase(item.id);
                                }}
                                disabled={isPurchasing === item.id}
                              >
                                {isPurchasing === item.id ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-5 h-5" />
                                    Buy for {formatPrice(item.price!)}
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="premium"
                                size="lg"
                                className="gap-2 px-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/${creatorSlug}/membership`);
                                }}
                              >
                                <Crown className="w-5 h-5" />
                                Subscribe Now
                              </Button>
                            )}
                          </motion.div>
                        </div>
                      )}

                      {/* Purchased badge */}
                      {isPurchased && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-emerald-500 text-white border-0 px-4 py-2">
                            <Check className="w-4 h-4 mr-1" />
                            Purchased
                          </Badge>
                        </div>
                      )}

                      {/* Play button for accessible videos */}
                      {canAccess && item.type === "VIDEO" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.button
                            className="w-20 h-20 rounded-full bg-[var(--gold)] flex items-center justify-center shadow-xl shadow-[var(--gold)]/30"
                            whileHover={{ scale: 1.1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.contentUrl, "_blank");
                            }}
                          >
                            <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Content info */}
                    <div className="p-6 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">
                            {item.title}
                          </h2>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.type === "VIDEO" ? "video" : "photo"}>
                              {item.type}
                            </Badge>
                            <Badge variant={tierVariants[item.accessTier] || "default"}>
                              {item.accessTier === "VIP" && <Crown className="w-3 h-3 mr-1" />}
                              {item.accessTier}
                            </Badge>
                            {item.duration && (
                              <Badge variant="duration">
                                {formatDuration(item.duration)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {canAccess && item.contentUrl && (
                          <Button
                            variant="premium"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.contentUrl, "_blank");
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            View Full
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Method Choice Modal */}
      <AnimatePresence>
        {showPaymentChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={() => setShowPaymentChoice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <div className="bg-[#111] rounded-3xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Payment Method
                  </h2>
                  <button
                    onClick={() => setShowPaymentChoice(null)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStripePurchase(showPaymentChoice)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">Credit Card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-500 -rotate-90" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCryptoPurchase(showPaymentChoice)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                      <Bitcoin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">Cryptocurrency</p>
                      <p className="text-xs text-gray-500">Bitcoin, Ethereum</p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-500 -rotate-90" />
                  </motion.button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-4">
                  Secure & encrypted payment
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crypto Payment Modal */}
      <CryptoPaymentModal
        isOpen={!!showCryptoModal}
        onClose={() => setShowCryptoModal(null)}
        type="media"
        mediaId={showCryptoModal?.mediaId}
        title={showCryptoModal?.title || ""}
        price={showCryptoModal?.price || 0}
      />

      <Footer creatorSlug={creatorSlug} />
    </>
  );
}
