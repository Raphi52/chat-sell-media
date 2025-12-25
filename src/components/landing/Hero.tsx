"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--gold)]/5 via-transparent to-transparent" />

      {/* Radial gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-2 h-2 bg-[var(--gold)] rounded-full animate-float opacity-50" />
      <div className="absolute top-1/3 right-20 w-3 h-3 bg-[var(--gold-light)] rounded-full animate-float opacity-30" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-[var(--gold)] rounded-full animate-float opacity-40" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="text-overline inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Private Content
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-display text-[var(--foreground)] mb-6"
        >
          Hey, I'm <span className="gradient-gold-text-animated">Mia Costa</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-subtitle text-[var(--muted)] max-w-2xl mx-auto mb-10"
        >
          Welcome to my private world. Subscribe to unlock exclusive photos,
          videos, and chat with me directly. VIP members get access to my most intimate content.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/membership">
            <Button variant="premium" size="lg" className="gap-2">
              <Crown className="w-5 h-5" />
              Join Now
            </Button>
          </Link>
          <Link href="/gallery">
            <Button variant="gold-outline" size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Explore Gallery
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex items-center justify-center gap-12"
        >
          <div className="text-center">
            <p className="text-3xl font-bold gradient-gold-text">450+</p>
            <p className="text-sm text-[var(--muted)]">Photos & Videos</p>
          </div>
          <div className="w-px h-12 bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-3xl font-bold gradient-gold-text">6</p>
            <p className="text-sm text-[var(--muted)]">Private Videos</p>
          </div>
          <div className="w-px h-12 bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-3xl font-bold gradient-gold-text">24/7</p>
            <p className="text-sm text-[var(--muted)]">Chat Available</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
    </section>
  );
}
