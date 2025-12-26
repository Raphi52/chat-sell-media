"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Lock, Image as ImageIcon, Crown, Sparkles, ArrowRight, Flame } from "lucide-react";
import { Button, Badge } from "@/components/ui";

const featuredItems = [
  {
    id: 1,
    type: "photo",
    title: "Beach Day",
    thumbnail: "/media/preview/2800579910636666662_1.jpg",
    isPremium: false,
    isNew: true,
  },
  {
    id: 2,
    type: "photo",
    title: "Summer Vibes",
    thumbnail: "/media/preview/3039035234726006678_1.jpg",
    isPremium: false,
  },
  {
    id: 3,
    type: "video",
    title: "Private Moments",
    thumbnail: "/media/preview/2885347102581834996_1.jpg",
    isPremium: true,
    duration: "8:45",
    isHot: true,
  },
  {
    id: 4,
    type: "photo",
    title: "Exclusive Set",
    thumbnail: "/media/preview/2922304526016789346_1.jpg",
    isPremium: true,
  },
  {
    id: 5,
    type: "photo",
    title: "Paradise",
    thumbnail: "/media/preview/3036738115692549406_1.jpg",
    isPremium: false,
    isNew: true,
  },
  {
    id: 6,
    type: "video",
    title: "VIP Access Only",
    thumbnail: "/media/preview/2872307818983487894_1.jpg",
    isPremium: true,
    isVIP: true,
    duration: "24:00",
    isHot: true,
  },
];

interface FeaturedContentProps {
  creatorSlug?: string;
}

export function FeaturedContent({ creatorSlug = "miacosta" }: FeaturedContentProps) {
  const basePath = `/${creatorSlug}`;

  return (
    <section id="featured" className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-64 h-64 bg-[var(--gold)]/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-4 h-4" />
            Featured Collection
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Latest{" "}
            <span className="gradient-gold-text-animated">Exclusives</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            A preview of my most popular and recent exclusive content
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#111] border border-white/10 hover:border-[var(--gold)]/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[var(--gold)]/10 cursor-pointer">
                {/* Image */}
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/0 to-[var(--gold)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Premium blur overlay on hover */}
                {item.isPremium && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center mb-3 mx-auto shadow-lg shadow-[var(--gold)]/40">
                        {item.type === "video" ? (
                          <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
                        ) : (
                          <Lock className="w-6 h-6 text-black" />
                        )}
                      </div>
                      <p className="text-white font-semibold text-lg">
                        {item.isVIP ? "VIP Only" : "Unlock Now"}
                      </p>
                      <p className="text-gray-400 text-sm">Subscribe to access</p>
                    </motion.div>
                  </div>
                )}

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge variant={item.type === "video" ? "video" : "photo"} className="shadow-lg">
                    {item.type === "video" ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        {item.duration}
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5" />
                        Photo
                      </>
                    )}
                  </Badge>
                  {item.isVIP && (
                    <Badge variant="vip" className="shadow-lg">
                      <Crown className="w-3.5 h-3.5" />
                      VIP
                    </Badge>
                  )}
                  {item.isNew && (
                    <Badge variant="new" className="shadow-lg">
                      NEW
                    </Badge>
                  )}
                  {item.isHot && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold shadow-lg">
                      <Flame className="w-3 h-3" />
                      HOT
                    </span>
                  )}
                </div>

                {/* Lock icon for premium */}
                {item.isPremium && (
                  <motion.div
                    className="absolute top-4 right-4"
                    whileHover={{ rotate: 10 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-lg shadow-[var(--gold)]/30">
                      <Lock className="w-5 h-5 text-black" />
                    </div>
                  </motion.div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-semibold text-xl mb-1 group-hover:text-[var(--gold-light)] transition-colors">
                    {item.title}
                  </h3>
                  {item.isPremium && (
                    <p className="text-[var(--gold)] text-sm font-medium">
                      Unlock with membership
                    </p>
                  )}
                </div>

                {/* Animated border on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link href={`${basePath}/gallery`}>
            <Button variant="premium" size="lg" className="gap-2 px-8 group">
              View All Content
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            450+ photos and videos available
          </p>
        </motion.div>
      </div>
    </section>
  );
}
