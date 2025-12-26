"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Lock, Play, Crown, Sparkles, Eye, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui";

interface ContentShowcaseProps {
  creatorSlug?: string;
}

// Sample preview images - in production, fetch from API
const previewImages = [
  { id: 1, src: "/media/preview/3039035234726006678_1.jpg", type: "photo", badge: "VIP", hot: true },
  { id: 2, src: "/media/preview/3036738115692549406_1.jpg", type: "video", duration: "2:34", badge: "NEW" },
  { id: 3, src: "/media/preview/2885347102581834996_1.jpg", type: "photo", badge: "VIP" },
  { id: 4, src: "/media/preview/2872307818983487894_1.jpg", type: "photo", hot: true },
  { id: 5, src: "/media/preview/3039035234726006678_1.jpg", type: "video", duration: "5:12", badge: "VIP" },
  { id: 6, src: "/media/preview/3036738115692549406_1.jpg", type: "photo", badge: "NEW", hot: true },
  { id: 7, src: "/media/preview/2885347102581834996_1.jpg", type: "photo" },
  { id: 8, src: "/media/preview/2872307818983487894_1.jpg", type: "video", duration: "3:45", badge: "VIP" },
  { id: 9, src: "/media/preview/3039035234726006678_1.jpg", type: "photo", badge: "NEW" },
  { id: 10, src: "/media/preview/3036738115692549406_1.jpg", type: "photo", hot: true },
  { id: 11, src: "/media/preview/2885347102581834996_1.jpg", type: "video", duration: "1:58", badge: "VIP" },
  { id: 12, src: "/media/preview/2872307818983487894_1.jpg", type: "photo", badge: "VIP" },
];

// Individual parallax image component
function ParallaxImage({
  image,
  index,
  basePath,
}: {
  image: typeof previewImages[0];
  index: number;
  basePath: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Different parallax speeds based on position
  const speeds = [0.15, 0.25, 0.35, 0.2, 0.3, 0.15, 0.25, 0.35, 0.2, 0.3, 0.15, 0.25];
  const speed = speeds[index % speeds.length];

  const y = useTransform(scrollYProgress, [0, 1], [-50 * speed, 50 * speed]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  // Different sizes for masonry effect
  const sizes = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/3]", "aspect-square"];
  const size = sizes[index % sizes.length];

  return (
    <motion.div
      ref={ref}
      style={{ y: smoothY }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className="group relative"
    >
      <Link href={`${basePath}/gallery`}>
        <div className={`relative ${size} rounded-2xl overflow-hidden border border-white/10 hover:border-[var(--gold)]/50 transition-all duration-500 cursor-pointer`}>
          {/* Image with blur */}
          <img
            src={image.src}
            alt=""
            className="w-full h-full object-cover blur-xl group-hover:blur-lg transition-all duration-500 scale-110 group-hover:scale-105"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

          {/* Gold gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--gold)]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Lock icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm border border-[var(--gold)]/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--gold)]/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              {image.type === "video" ? (
                <Play className="w-6 h-6 text-[var(--gold)] fill-[var(--gold)]/50" />
              ) : (
                <Lock className="w-6 h-6 text-[var(--gold)]" />
              )}
            </motion.div>
          </div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-2">
              {image.badge && (
                <span
                  className={`px-2 py-1 rounded-md text-xs font-bold ${
                    image.badge === "VIP"
                      ? "bg-gradient-to-r from-[var(--gold)] to-yellow-500 text-black"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {image.badge}
                </span>
              )}
              {image.hot && (
                <span className="px-2 py-1 rounded-md text-xs font-bold bg-red-500/90 text-white flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  HOT
                </span>
              )}
            </div>
            {image.type === "video" && image.duration && (
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-black/60 backdrop-blur-sm text-white">
                {image.duration}
              </span>
            )}
          </div>

          {/* Bottom unlock text - appears on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-[var(--gold)]" />
              <span className="text-sm text-white font-medium">Unlock with VIP</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ContentShowcase({ creatorSlug = "miacosta" }: ContentShowcaseProps) {
  const containerRef = useRef<HTMLElement>(null);
  const basePath = `/${creatorSlug}`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const headerY = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden bg-black">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--gold)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Premium Content
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Discover{" "}
            <span className="gradient-gold-text">500+ Exclusive</span>
            <br />Photos & Videos
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-8"
          >
            Get instant access to my private collection. New content added daily.
            VIP members see everything unblurred.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-8 text-sm"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">450+</span> Photos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">25+</span> Videos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-gray-400">
                <span className="text-white font-semibold">Daily</span> Updates
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Masonry grid with parallax */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {previewImages.map((image, index) => (
            <ParallaxImage
              key={image.id}
              image={image}
              index={index}
              basePath={basePath}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-left">
              <p className="text-white font-semibold text-lg mb-1">
                Want to see more?
              </p>
              <p className="text-gray-400 text-sm">
                Unlock all content with VIP membership
              </p>
            </div>
            <Link href={`${basePath}/membership`}>
              <Button
                variant="premium"
                size="lg"
                className="gap-2 px-8 shadow-lg shadow-[var(--gold)]/20"
              >
                <Crown className="w-5 h-5" />
                Unlock Everything
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
