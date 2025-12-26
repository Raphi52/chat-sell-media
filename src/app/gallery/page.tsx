"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CryptoPaymentModal } from "@/components/payments";

const categories = ["All", "Photos", "Videos", "Exclusive", "Free"];

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

const tierColors: Record<string, string> = {
  FREE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  BASIC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PREMIUM: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  VIP: "bg-[var(--gold)]/20 text-[var(--gold)] border-[var(--gold)]/30",
};

export default function GalleryPage() {
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
  const { formatPrice } = useCurrency();

  // Tier order for access comparison
  const tierOrder = ["FREE", "BASIC", "VIP"];

  // Check if user has access to a media item
  const hasAccessToMedia = (item: MediaItem) => {
    if (item.accessTier === "FREE") return true;
    if (purchasedIds.has(item.id)) return true;
    const userTierIndex = tierOrder.indexOf(userTier);
    const mediaTierIndex = tierOrder.indexOf(item.accessTier);
    return userTierIndex >= mediaTierIndex;
  };

  // Fetch user's subscription and purchases
  useEffect(() => {
    const fetchUserAccess = async () => {
      if (!session?.user?.id) return;

      try {
        // Fetch subscription status
        const subRes = await fetch("/api/user/subscription");
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.subscription?.plan?.accessTier) {
            setUserTier(subData.subscription.plan.accessTier);
          }
        }

        // Fetch purchased media
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

  // Fetch media from API
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

  // Show payment method choice
  const handlePurchase = (mediaId: string) => {
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/gallery");
      return;
    }
    setShowPaymentChoice(mediaId);
  };

  // Handle Stripe payment
  const handleStripePurchase = async (mediaId: string) => {
    setShowPaymentChoice(null);
    setIsPurchasing(mediaId);

    try {
      const res = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "media",
          mediaId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
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

  // Handle crypto payment
  const handleCryptoPurchase = (mediaId: string) => {
    setShowPaymentChoice(null);
    const item = mediaItems.find((m) => m.id === mediaId);
    if (item && item.price) {
      setShowCryptoModal({
        mediaId,
        title: item.title,
        price: item.price,
      });
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

  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-overline mb-4 block">Gallery</span>
            <h1 className="text-headline text-[var(--foreground)] mb-4">
              Exclusive <span className="gradient-gold-text">Collection</span>
            </h1>
            <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
              Browse through our curated collection of exclusive content
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-8"
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeCategory === category
                      ? "bg-[var(--gold)] text-[var(--background)]"
                      : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGridView(true)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isGridView
                    ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsGridView(false)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  !isGridView
                    ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
            </div>
          ) : (
          /* Gallery Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "grid gap-4",
              isGridView
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2"
            )}
          >
            {filteredMedia.map((item, index) => {
              const canAccess = hasAccessToMedia(item);
              const isPurchased = purchasedIds.has(item.id);

              return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => setSelectedMedia(item.id)}
              >
                <Card variant="luxury" hover className="overflow-hidden p-0">
                  <div className="relative aspect-[4/5]">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                          !canAccess && "group-hover:blur-0"
                        )}
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--surface)] flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-[var(--muted)]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge variant={item.type === "VIDEO" ? "video" : "photo"}>
                        {item.type === "VIDEO" ? (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            {formatDuration(item.duration)}
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Photo
                          </>
                        )}
                      </Badge>
                      <Badge className={tierColors[item.accessTier]}>
                        {item.accessTier === "VIP" && <Crown className="w-3 h-3 mr-1" />}
                        {item.accessTier}
                      </Badge>
                    </div>

                    {/* Lock/Unlock status */}
                    <div className="absolute top-3 right-3">
                      {isPurchased ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Acheté
                        </Badge>
                      ) : !canAccess ? (
                        <div className="w-8 h-8 rounded-full bg-[var(--gold)]/80 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-[var(--background)]" />
                        </div>
                      ) : null}
                    </div>

                    {/* Play button for videos */}
                    {item.type === "VIDEO" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center animate-gold-pulse">
                          <Play className="w-6 h-6 text-[var(--background)] ml-1" fill="currentColor" />
                        </div>
                      </div>
                    )}

                    {/* Content info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-medium text-lg mb-1">
                        {item.title}
                      </h3>
                      {item.price && (
                        <p className="text-[var(--gold)] font-semibold">
                          {formatPrice(item.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
            })}
          </motion.div>
          )}

          {/* Empty state */}
          {!isLoading && filteredMedia.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-[var(--gold)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                No content found
              </h3>
              <p className="text-[var(--muted)]">
                Try changing your filters to see more content
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedMedia(null)}
          >
            <button
              className="absolute top-6 right-6 p-2 text-white/60 hover:text-white"
              onClick={() => setSelectedMedia(null)}
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full mx-4"
            >
              {(() => {
                const item = mediaItems.find((m) => m.id === selectedMedia);
                if (!item) return null;

                const canAccess = hasAccessToMedia(item);
                const isPurchased = purchasedIds.has(item.id);
                const canBuy = item.isPurchaseable && item.price && !canAccess;

                return (
                  <Card variant="luxury" className="overflow-hidden p-0">
                    <div className="relative aspect-video">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className={cn(
                            "w-full h-full object-cover",
                            !canAccess && "blur-xl"
                          )}
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--surface)] flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-[var(--muted)]" />
                        </div>
                      )}

                      {!canAccess && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-[var(--gold)] flex items-center justify-center mx-auto mb-4 animate-gold-pulse">
                              <Lock className="w-8 h-8 text-[var(--background)]" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                              Contenu {item.accessTier}
                            </h3>
                            <p className="text-white/70 mb-6">
                              {canBuy
                                ? "Achetez ce contenu pour le débloquer"
                                : "Abonnez-vous pour débloquer ce contenu"}
                            </p>
                            {canBuy ? (
                              <Button
                                variant="premium"
                                size="lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePurchase(item.id);
                                }}
                                disabled={isPurchasing === item.id}
                              >
                                {isPurchasing === item.id ? (
                                  <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Traitement...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-5 h-5 mr-2" />
                                    Acheter {formatPrice(item.price!)}
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="premium"
                                size="lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push("/#membership");
                                }}
                              >
                                <Crown className="w-5 h-5 mr-2" />
                                S'abonner
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show purchased badge */}
                      {isPurchased && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Acheté
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-[var(--foreground)]">
                            {item.title}
                          </h2>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={item.type === "VIDEO" ? "video" : "photo"}>
                              {item.type}
                            </Badge>
                            <Badge className={tierColors[item.accessTier]}>
                              {item.accessTier}
                            </Badge>
                          </div>
                        </div>
                        {canBuy && (
                          <Button
                            variant="premium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchase(item.id);
                            }}
                            disabled={isPurchasing === item.id}
                          >
                            {isPurchasing === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>Acheter {formatPrice(item.price!)}</>
                            )}
                          </Button>
                        )}
                        {canAccess && item.contentUrl && (
                          <Button
                            variant="premium"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.contentUrl, "_blank");
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Voir
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setShowPaymentChoice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card variant="luxury" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">
                    Mode de paiement
                  </h2>
                  <button
                    onClick={() => setShowPaymentChoice(null)}
                    className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--muted)]" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Stripe/Card */}
                  <button
                    onClick={() => handleStripePurchase(showPaymentChoice)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-[var(--foreground)]">
                        Carte bancaire
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        Visa, Mastercard, Amex
                      </p>
                    </div>
                  </button>

                  {/* Crypto */}
                  <button
                    onClick={() => handleCryptoPurchase(showPaymentChoice)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Bitcoin className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-[var(--foreground)]">
                        Cryptomonnaie
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        Bitcoin, Ethereum
                      </p>
                    </div>
                  </button>
                </div>
              </Card>
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

      <Footer />
    </>
  );
}
