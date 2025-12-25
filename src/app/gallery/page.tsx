"use client";

import { useState } from "react";
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
  Filter,
  X,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/providers/CurrencyProvider";

const categories = ["All", "Photos", "Videos", "Exclusive", "Free"];

const mediaItems = [
  // FREE Content
  {
    id: 1,
    type: "PHOTO",
    title: "Beach Day",
    thumbnail: "/media/preview/2800579910636666662_1.jpg",
    accessTier: "FREE",
    price: null,
  },
  {
    id: 2,
    type: "PHOTO",
    title: "Summer Vibes",
    thumbnail: "/media/preview/3039035234726006678_1.jpg",
    accessTier: "FREE",
    price: null,
  },
  {
    id: 3,
    type: "PHOTO",
    title: "Golden Hour",
    thumbnail: "/media/preview/2742624509601580698_1.jpg",
    accessTier: "FREE",
    price: null,
  },
  {
    id: 4,
    type: "PHOTO",
    title: "Paradise",
    thumbnail: "/media/preview/3036738115692549406_1.jpg",
    accessTier: "FREE",
    price: null,
  },
  // BASIC Content
  {
    id: 5,
    type: "PHOTO",
    title: "Sun Kissed",
    thumbnail: "/media/preview/2742624509601580698_2.jpg",
    accessTier: "BASIC",
    price: null,
  },
  {
    id: 6,
    type: "PHOTO",
    title: "Summer Set",
    thumbnail: "/media/preview/2741838065857470044_1.jpg",
    accessTier: "BASIC",
    price: null,
  },
  {
    id: 7,
    type: "PHOTO",
    title: "Poolside",
    thumbnail: "/media/preview/2978828947044579726_1.jpg",
    accessTier: "BASIC",
    price: null,
  },
  {
    id: 8,
    type: "PHOTO",
    title: "Sunset Glow",
    thumbnail: "/media/preview/2975918725330176846_1.jpg",
    accessTier: "BASIC",
    price: null,
  },
  // PREMIUM Content
  {
    id: 9,
    type: "PHOTO",
    title: "Tropical Paradise",
    thumbnail: "/media/preview/2741838065857470044_2.jpg",
    accessTier: "PREMIUM",
    price: 4.99,
  },
  {
    id: 10,
    type: "PHOTO",
    title: "Exclusive Collection",
    thumbnail: "/media/preview/2717994735623288039_1.jpg",
    accessTier: "PREMIUM",
    price: null,
  },
  {
    id: 11,
    type: "PHOTO",
    title: "Beach Goddess",
    thumbnail: "/media/preview/2973048796289522877_1.jpg",
    accessTier: "PREMIUM",
    price: 6.99,
  },
  {
    id: 12,
    type: "PHOTO",
    title: "Natural Beauty",
    thumbnail: "/media/preview/2922304526016789346_1.jpg",
    accessTier: "PREMIUM",
    price: null,
  },
  {
    id: 13,
    type: "PHOTO",
    title: "Intimate Moments",
    thumbnail: "/media/preview/2890417024190085161_1.jpg",
    accessTier: "PREMIUM",
    price: 7.99,
  },
  {
    id: 14,
    type: "PHOTO",
    title: "Exclusive Set",
    thumbnail: "/media/preview/2545446868282112113_2.jpg",
    accessTier: "PREMIUM",
    price: 9.99,
  },
  // VIP Content
  {
    id: 15,
    type: "PHOTO",
    title: "Private Moments",
    thumbnail: "/media/preview/2717994735623288039_2.jpg",
    accessTier: "VIP",
    price: null,
  },
  {
    id: 16,
    type: "PHOTO",
    title: "VIP Collection",
    thumbnail: "/media/preview/2885347102581834996_1.jpg",
    accessTier: "VIP",
    price: null,
  },
  {
    id: 17,
    type: "VIDEO",
    title: "VIP Private Video",
    thumbnail: "/media/preview/2545446868282112113_1.jpg",
    accessTier: "VIP",
    duration: "12:34",
    price: null,
  },
  {
    id: 18,
    type: "PHOTO",
    title: "Behind The Scenes",
    thumbnail: "/media/preview/2872307818983487894_1.jpg",
    accessTier: "VIP",
    price: null,
  },
  {
    id: 19,
    type: "VIDEO",
    title: "Exclusive Video",
    thumbnail: "/media/preview/2833171100456070295_1.jpg",
    accessTier: "VIP",
    duration: "8:45",
    price: null,
  },
  {
    id: 20,
    type: "PHOTO",
    title: "Private Shoot",
    thumbnail: "/media/preview/2860021480380863230_1.jpg",
    accessTier: "VIP",
    price: null,
  },
];

const tierColors: Record<string, string> = {
  FREE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  BASIC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PREMIUM: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  VIP: "bg-[var(--gold)]/20 text-[var(--gold)] border-[var(--gold)]/30",
};

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isGridView, setIsGridView] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null);
  const { formatPrice } = useCurrency();

  const filteredMedia = mediaItems.filter((item) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Photos") return item.type === "PHOTO";
    if (activeCategory === "Videos") return item.type === "VIDEO";
    if (activeCategory === "Exclusive") return item.accessTier === "VIP";
    if (activeCategory === "Free") return item.accessTier === "FREE";
    return true;
  });

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

          {/* Gallery Grid */}
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
            {filteredMedia.map((item, index) => (
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
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                        item.accessTier !== "FREE" && "group-hover:blur-0"
                      )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge variant={item.type === "VIDEO" ? "video" : "photo"}>
                        {item.type === "VIDEO" ? (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            {item.duration}
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

                    {/* Lock for non-free content */}
                    {item.accessTier !== "FREE" && (
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--gold)]/80 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-[var(--background)]" />
                        </div>
                      </div>
                    )}

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
            ))}
          </motion.div>

          {/* Empty state */}
          {filteredMedia.length === 0 && (
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

                const isLocked = item.accessTier !== "FREE";

                return (
                  <Card variant="luxury" className="overflow-hidden p-0">
                    <div className="relative aspect-video">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className={cn(
                          "w-full h-full object-cover",
                          isLocked && "blur-xl"
                        )}
                      />

                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-[var(--gold)] flex items-center justify-center mx-auto mb-4 animate-gold-pulse">
                              <Lock className="w-8 h-8 text-[var(--background)]" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                              {item.accessTier} Content
                            </h3>
                            <p className="text-white/70 mb-6">
                              Subscribe to unlock this content
                            </p>
                            <Button variant="premium" size="lg">
                              <Crown className="w-5 h-5 mr-2" />
                              {item.price ? `Buy for ${formatPrice(item.price)}` : "Subscribe"}
                            </Button>
                          </div>
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
                        {item.price && (
                          <Button variant="premium">
                            Buy {formatPrice(item.price!)}
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

      <Footer />
    </>
  );
}
