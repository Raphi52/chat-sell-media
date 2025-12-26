"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Lock, Play, Crown, Sparkles, Clock, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui";

interface ExclusivePreviewProps {
  creatorSlug?: string;
}

// Preview items with teasers
const exclusiveItems = [
  {
    id: 1,
    title: "Behind The Scenes",
    description: "Exclusive photoshoot footage",
    src: "/media/preview/3039035234726006678_1.jpg",
    type: "video",
    duration: "12:34",
    isNew: true,
  },
  {
    id: 2,
    title: "Private Collection",
    description: "VIP-only intimate gallery",
    src: "/media/preview/3036738115692549406_1.jpg",
    type: "gallery",
    count: 45,
  },
  {
    id: 3,
    title: "Live Session Recording",
    description: "Last night's exclusive stream",
    src: "/media/preview/2885347102581834996_1.jpg",
    type: "video",
    duration: "45:21",
    isNew: true,
  },
];

// Countdown timer component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 32,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-[var(--gold)]" />
      <span className="text-white font-mono">
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

// Single preview card with peek effect
function PreviewCard({
  item,
  index,
  basePath,
}: {
  item: typeof exclusiveItems[0];
  index: number;
  basePath: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Horizontal parallax - items slide in from sides
  const direction = index % 2 === 0 ? 1 : -1;
  const x = useTransform(scrollYProgress, [0, 0.5], [100 * direction, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const smoothX = useSpring(x, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{ x: smoothX, opacity }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`${basePath}/gallery`}>
        <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden border-2 border-white/10 hover:border-[var(--gold)]/50 transition-all duration-500 cursor-pointer">
          {/* Background image with peek effect */}
          <div className="absolute inset-0">
            <img
              src={item.src}
              alt=""
              className="w-full h-full object-cover transition-all duration-700"
              style={{
                filter: isHovered ? "blur(15px)" : "blur(25px)",
                transform: isHovered ? "scale(1.05)" : "scale(1.1)",
              }}
            />
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />

          {/* Gold shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--gold)]/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: isHovered ? "100%" : "-100%" }}
            transition={{ duration: 0.8 }}
          />

          {/* Content */}
          <div className="absolute inset-0 p-6 lg:p-10 flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {item.isNew && (
                  <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold animate-pulse">
                    NEW
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-[var(--gold)] text-black text-xs font-bold">
                  VIP ONLY
                </span>
              </div>
              {item.type === "video" && item.duration && (
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium flex items-center gap-2">
                  <Play className="w-3 h-3" />
                  {item.duration}
                </span>
              )}
              {item.type === "gallery" && item.count && (
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  {item.count} photos
                </span>
              )}
            </div>

            {/* Center lock icon */}
            <div className="flex items-center justify-center">
              <motion.div
                className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border-2 border-[var(--gold)]/50 flex items-center justify-center"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  borderColor: isHovered
                    ? "rgba(212,175,55,0.8)"
                    : "rgba(212,175,55,0.5)",
                }}
              >
                {item.type === "video" ? (
                  <Play className="w-8 h-8 text-[var(--gold)] fill-[var(--gold)]/30" />
                ) : (
                  <Lock className="w-8 h-8 text-[var(--gold)]" />
                )}
              </motion.div>
            </div>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.description}</p>
              </div>

              <motion.div
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--gold)] text-black font-bold"
                animate={{ x: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0.8 }}
              >
                <Crown className="w-5 h-5" />
                <span>Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ExclusivePreview({ creatorSlug = "miacosta" }: ExclusivePreviewProps) {
  const basePath = `/${creatorSlug}`;

  return (
    <section className="py-24 relative overflow-hidden bg-black">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-1/2 h-96 bg-[var(--gold)]/5 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-1/2 h-96 bg-purple-500/5 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4" />
            Fresh Content
          </motion.span>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Just Released -{" "}
            <span className="gradient-gold-text">Don't Miss Out</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
            Exclusive content uploaded in the last 24 hours. VIP members get
            instant access.
          </p>

          {/* Countdown to next content */}
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10">
            <span className="text-gray-400 text-sm">Next upload in:</span>
            <CountdownTimer />
          </div>
        </motion.div>

        {/* Preview cards */}
        <div className="space-y-8">
          {exclusiveItems.map((item, index) => (
            <PreviewCard
              key={item.id}
              item={item}
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
          className="text-center mt-12"
        >
          <Link href={`${basePath}/membership`}>
            <Button
              variant="premium"
              size="lg"
              className="gap-3 px-10 py-7 text-lg shadow-2xl shadow-[var(--gold)]/30"
            >
              <Crown className="w-6 h-6" />
              Get VIP Access Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            Instant access to all content. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
