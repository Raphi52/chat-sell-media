"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Lock, Heart, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

const gridImages = [
  { id: 1, src: "/media/preview/3036738115692549406_1.jpg", likes: "1.2K", views: "5.4K", isVideo: false, isLocked: false },
  { id: 2, src: "/media/preview/2978828947044579726_1.jpg", likes: "2.1K", views: "8.2K", isVideo: false, isLocked: false },
  { id: 3, src: "/media/preview/2975918725330176846_1.jpg", likes: "3.5K", views: "12K", isVideo: true, isLocked: true },
  { id: 4, src: "/media/preview/2973048796289522877_1.jpg", likes: "1.8K", views: "6.7K", isVideo: false, isLocked: false },
  { id: 5, src: "/media/preview/2971578964451427120_1.jpg", likes: "4.2K", views: "15K", isVideo: false, isLocked: true },
  { id: 6, src: "/media/preview/2922304526016789346_1.jpg", likes: "2.9K", views: "9.8K", isVideo: false, isLocked: false },
  { id: 7, src: "/media/preview/2917247876436254898_1.jpg", likes: "1.5K", views: "4.3K", isVideo: true, isLocked: true },
  { id: 8, src: "/media/preview/2890417024190085161_1.jpg", likes: "3.1K", views: "11K", isVideo: false, isLocked: false },
  { id: 9, src: "/media/preview/2885347102581834996_1.jpg", likes: "5.6K", views: "18K", isVideo: true, isLocked: true },
];

interface InstagramGridProps {
  creatorSlug?: string;
}

export function InstagramGrid({ creatorSlug = "miacosta" }: InstagramGridProps) {
  const basePath = `/${creatorSlug}`;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400 text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            Fresh Content Daily
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Preview My{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
              Gallery
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Get a glimpse of my exclusive content. Subscribe to unlock everything.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {gridImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <img
                src={image.src}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Lock overlay for premium */}
              {image.isLocked && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--gold)]/90 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-black" />
                  </div>
                </div>
              )}

              {/* Video indicator */}
              {image.isVideo && !image.isLocked && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              )}

              {/* Stats on hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 text-white">
                  <Heart className="w-5 h-5 fill-white" />
                  <span className="font-semibold">{image.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Eye className="w-5 h-5" />
                  <span className="font-semibold">{image.views}</span>
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href={`${basePath}/gallery`}>
            <Button
              variant="gold-outline"
              size="lg"
              className="gap-2 group"
            >
              View Full Gallery
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </section>
  );
}
