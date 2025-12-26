"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Heart, DollarSign, Lock, Send, Sparkles, Check, Zap } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Creator } from "@/lib/creators";

interface ChatPreviewProps {
  creator?: Creator;
}

export function ChatPreview({ creator }: ChatPreviewProps) {
  const creatorSlug = creator?.slug || "miacosta";
  const basePath = `/${creatorSlug}`;
  const creatorName = creator?.displayName || "Mia";

  const features = [
    {
      icon: MessageCircle,
      title: "Private Messages",
      description: "Direct conversation, just between us",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Lock,
      title: "PPV Content",
      description: "Unlock exclusive media sent in chat",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Heart,
      title: "Send Tips",
      description: "Show appreciation with instant tips",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: Zap,
      title: "Priority Response",
      description: "VIP members get faster replies",
      color: "from-[var(--gold)] to-yellow-500",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#080808] to-black" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <MessageCircle className="w-4 h-4" />
              Direct Connection
            </motion.span>

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Chat with{" "}
              <span className="gradient-gold-text">Me Directly</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              VIP members get exclusive access to direct messaging.
              Receive personalized content, respond to messages, and unlock
              exclusive pay-per-view media sent just for you.
            </p>

            {/* Features grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href={`${basePath}/membership`}>
              <Button variant="premium" size="lg" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                Start Chatting
              </Button>
            </Link>
          </motion.div>

          {/* Chat Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl rounded-full" />

            <div className="relative bg-[#111] rounded-3xl border border-white/10 p-6 shadow-2xl max-w-md mx-auto">
              {/* Chat header */}
              <div className="flex items-center gap-4 pb-5 border-b border-white/10">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] overflow-hidden">
                    <img
                      src="/media/preview/3039035234726006678_1.jpg"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{creatorName}</h4>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Online now
                  </p>
                </div>
                <Badge variant="vip">VIP</Badge>
              </div>

              {/* Messages */}
              <div className="py-6 space-y-4 min-h-[280px]">
                {/* Received message */}
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex-shrink-0 overflow-hidden">
                    <img
                      src="/media/preview/3039035234726006678_1.jpg"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/10 max-w-[240px]">
                      <p className="text-sm text-white">Hey! Thanks for subscribing! Here's something special for you</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">2:34 PM</p>
                  </div>
                </motion.div>

                {/* PPV Message */}
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex-shrink-0 overflow-hidden">
                    <img
                      src="/media/preview/3039035234726006678_1.jpg"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="relative rounded-2xl rounded-tl-sm overflow-hidden max-w-[200px] border border-white/10">
                      <div className="aspect-[4/3] bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <img
                          src="/media/preview/2885347102581834996_1.jpg"
                          alt=""
                          className="w-full h-full object-cover blur-lg scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center mb-2 shadow-lg">
                            <Lock className="w-5 h-5 text-black" />
                          </div>
                          <p className="text-white font-bold text-lg">$9.99</p>
                          <p className="text-xs text-gray-300">Tap to unlock</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">2:35 PM</p>
                  </div>
                </motion.div>

                {/* Sent message */}
                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="text-right">
                    <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] max-w-[240px]">
                      <p className="text-sm text-black font-medium">Thank you so much!</p>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1.5 mr-1">
                      <p className="text-xs text-gray-500">2:36 PM</p>
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  </div>
                </motion.div>

                {/* Tip notification */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">You sent a $5 tip!</span>
                    <Sparkles className="w-4 h-4 text-green-400" />
                  </div>
                </motion.div>
              </div>

              {/* Input */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-gray-500 text-sm">
                  Type a message...
                </div>
                <button className="w-11 h-11 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-lg shadow-[var(--gold)]/30 hover:scale-105 transition-transform">
                  <Send className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>

            {/* Floating notification */}
            <motion.div
              className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-[#111] border border-white/10 shadow-xl"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.1 }}
              animate={{ y: [0, -5, 0] }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-white font-medium">New message!</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
