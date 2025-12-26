"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Crown, Users, Star, Shield, Clock, Heart, Zap } from "lucide-react";

// Animated counter component
function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
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
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function SocialProof() {
  const stats = [
    {
      icon: Users,
      value: 2547,
      label: "Active Members",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Star,
      value: 4.9,
      label: "Average Rating",
      suffix: "/5",
      gradient: "from-[var(--gold)] to-yellow-500",
    },
    {
      icon: Heart,
      value: 98,
      label: "Satisfaction",
      suffix: "%",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Zap,
      value: 24,
      label: "New Today",
      suffix: "+",
      gradient: "from-purple-500 to-violet-500",
    },
  ];

  const trustBadges = [
    { icon: Shield, text: "Secure Payments", subtext: "256-bit SSL" },
    { icon: Clock, text: "Instant Access", subtext: "No waiting" },
    { icon: Heart, text: "Cancel Anytime", subtext: "No commitment" },
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-black via-[#050505] to-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
              <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--gold)]/30 transition-all text-center">
                <div
                  className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.gradient} p-0.5 mb-4`}
                >
                  <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  {typeof stat.value === "number" && stat.value > 10 ? (
                    <AnimatedNumber value={stat.value} />
                  ) : (
                    stat.value
                  )}
                  {stat.suffix && (
                    <span className="text-[var(--gold)]">{stat.suffix}</span>
                  )}
                </p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 lg:gap-12"
        >
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{badge.text}</p>
                <p className="text-gray-500 text-xs">{badge.subtext}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
