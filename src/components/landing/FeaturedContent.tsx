"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Lock, Image as ImageIcon, Crown } from "lucide-react";
import { Button, Badge } from "@/components/ui";

const featuredItems = [
  {
    id: 1,
    type: "photo",
    title: "Beach Day",
    thumbnail: "/media/preview/2800579910636666662_1.jpg",
    isPremium: false,
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
  },
  {
    id: 6,
    type: "video",
    title: "VIP Access Only",
    thumbnail: "/media/preview/2872307818983487894_1.jpg",
    isPremium: true,
    isVIP: true,
    duration: "24:00",
  },
];

export function FeaturedContent() {
  return (
    <section id="featured" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-overline mb-4 block">Featured</span>
          <h2 className="text-headline text-[var(--foreground)] mb-4">
            Latest <span className="gradient-gold-text">Exclusives</span>
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
            A preview of our most popular and recent exclusive content.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden luxury-card hover-lift cursor-pointer">
                {/* Image */}
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Premium blur overlay */}
                {item.isPremium && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center mb-3 mx-auto animate-gold-pulse">
                        {item.type === "video" ? (
                          <Play className="w-6 h-6 text-[var(--background)] ml-1" fill="currentColor" />
                        ) : (
                          <Lock className="w-6 h-6 text-[var(--background)]" />
                        )}
                      </div>
                      <p className="text-sm text-white font-medium">
                        {item.isVIP ? "VIP Only" : "Premium"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={item.type === "video" ? "video" : "photo"}>
                    {item.type === "video" ? (
                      <>
                        <Play className="w-3 h-3" />
                        {item.duration}
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3" />
                        Photo
                      </>
                    )}
                  </Badge>
                  {item.isVIP && (
                    <Badge variant="vip">
                      <Crown className="w-3 h-3" />
                      VIP
                    </Badge>
                  )}
                </div>

                {/* Lock icon for premium */}
                {item.isPremium && (
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--gold)]/80 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-[var(--background)]" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-medium text-lg mb-1">
                    {item.title}
                  </h3>
                  {item.isPremium && (
                    <p className="text-[var(--gold-light)] text-sm">
                      Unlock with membership
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/gallery">
            <Button variant="gold-outline" size="lg">
              View All Content
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
