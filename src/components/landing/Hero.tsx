"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import Link from "next/link";
import { Play, Crown, Sparkles, ChevronDown, Lock, Heart, Users, Camera, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui";
import { Creator } from "@/lib/creators";

interface HeroProps {
  creator?: Creator;
}

// Animated counter component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Floating particle with glow
function GlowParticle({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: x,
        bottom: "10%",
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(212,175,55,0.8) 0%, rgba(212,175,55,0) 70%)`,
        boxShadow: `0 0 ${size * 2}px rgba(212,175,55,0.5)`,
      }}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        y: [0, -400, -600],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

export function Hero({ creator }: HeroProps) {
  const creatorSlug = creator?.slug || "miacosta";
  const basePath = `/${creatorSlug}`;
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Smooth spring animations
  const smoothY = useSpring(imageY, { stiffness: 100, damping: 30 });
  const smoothScale = useSpring(imageScale, { stiffness: 100, damping: 30 });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section ref={containerRef} className="relative min-h-[100vh] overflow-hidden bg-black">
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: smoothY, scale: smoothScale }}
      >
        <div className="absolute inset-0">
          <img
            src={creator?.coverImage || "/media/preview/3036738115692549406_1.jpg"}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_70%)]" />
      </motion.div>

      {/* Animated gold particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <GlowParticle delay={0} x="5%" size={8} />
          <GlowParticle delay={1} x="15%" size={6} />
          <GlowParticle delay={2} x="25%" size={10} />
          <GlowParticle delay={0.5} x="35%" size={5} />
          <GlowParticle delay={1.5} x="45%" size={7} />
          <GlowParticle delay={2.5} x="55%" size={9} />
          <GlowParticle delay={0.8} x="65%" size={6} />
          <GlowParticle delay={1.8} x="75%" size={8} />
          <GlowParticle delay={2.8} x="85%" size={5} />
          <GlowParticle delay={3.2} x="95%" size={7} />
        </div>
      )}

      {/* Decorative gold lines */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-px h-full"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.2), transparent)",
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-px h-full"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.2), transparent)",
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, delay: 0.7 }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-20 min-h-screen flex flex-col justify-center px-6"
        style={{ y: textY, opacity }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left - Text content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  LIVE NOW
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Exclusive Creator
                </span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-[0.95]"
              >
                <span className="block">Welcome to</span>
                <span className="relative inline-block mt-2">
                  <span className="gradient-gold-text-animated">{creator?.displayName || "Mia Costa"}'s</span>
                </span>
                <span className="block mt-2 text-4xl sm:text-5xl lg:text-6xl text-gray-300">
                  Private World
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Get exclusive access to my most intimate content, private messages,
                and VIP-only photos & videos. Join{" "}
                <span className="text-[var(--gold)] font-semibold">2,500+ members</span>{" "}
                who already unlocked everything.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
              >
                <Link href={`${basePath}/membership`}>
                  <Button
                    variant="premium"
                    size="lg"
                    className="gap-3 text-lg px-10 py-7 shadow-2xl shadow-[var(--gold)]/30 hover:shadow-[var(--gold)]/50 transition-shadow relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Crown className="w-6 h-6" />
                    <span>Join VIP Now</span>
                    <span className="text-sm opacity-80">$29.99/mo</span>
                  </Button>
                </Link>
                <Link href={`${basePath}/gallery`}>
                  <Button
                    variant="gold-outline"
                    size="lg"
                    className="gap-2 text-lg px-8 py-7 backdrop-blur-sm"
                  >
                    <Eye className="w-5 h-5" />
                    Preview Gallery
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--gold)]" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[var(--gold)]" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[var(--gold)]" />
                  <span>Cancel Anytime</span>
                </div>
              </motion.div>
            </div>

            {/* Right - Profile card with parallax */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="order-1 lg:order-2 relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-10 blur-3xl opacity-30 bg-gradient-to-tr from-[var(--gold)] via-purple-500 to-[var(--gold)]" />

              {/* Main profile card */}
              <div className="relative max-w-sm mx-auto">
                {/* Rotating ring */}
                <motion.div
                  className="absolute -inset-6 rounded-3xl border border-dashed border-[var(--gold)]/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />

                {/* Card */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-[var(--gold)]/40 shadow-2xl shadow-[var(--gold)]/20">
                  <div className="aspect-[3/4] relative">
                    <img
                      src={creator?.avatar || "/media/preview/3039035234726006678_1.jpg"}
                      alt={creator?.displayName || "Creator"}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between">
                      <motion.div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-green-500/30"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-white font-medium">Online</span>
                      </motion.div>
                      <motion.div
                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--gold)] to-yellow-500 text-black text-sm font-bold"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        VIP
                      </motion.div>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-end justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">
                            {creator?.displayName || "Mia Costa"}
                          </h3>
                          <p className="text-gray-400 text-sm">@{creatorSlug}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 text-[var(--gold)] fill-[var(--gold)]" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-yellow-600 flex items-center justify-center shadow-lg shadow-[var(--gold)]/30"
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown className="w-8 h-8 text-black" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-2 -right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                >
                  500+ Exclusive
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 lg:mt-24"
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4 lg:gap-8">
              {[
                { icon: Camera, value: 450, suffix: "+", label: "Exclusive Photos" },
                { icon: Play, value: 25, suffix: "+", label: "HD Videos" },
                { icon: Users, value: 2500, suffix: "+", label: "VIP Members" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.15 }}
                  className="text-center p-4 lg:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[var(--gold)]/30 transition-all group hover:bg-white/10"
                >
                  <stat.icon className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--gold)] mx-auto mb-2 lg:mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl lg:text-4xl font-bold gradient-gold-text mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500 group-hover:text-[var(--gold)] transition-colors">
            Explore More
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-gray-600 group-hover:border-[var(--gold)] transition-colors flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
              animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent z-30" />
    </section>
  );
}
