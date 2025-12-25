"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Heart, DollarSign, Lock, Send } from "lucide-react";
import { Button, Badge } from "@/components/ui";

export function ChatPreview() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-overline mb-4 block">Direct Connection</span>
            <h2 className="text-headline text-[var(--foreground)] mb-6">
              Chat with <span className="gradient-gold-text">Me Directly</span>
            </h2>
            <p className="text-[var(--muted)] text-lg mb-8">
              Premium members get exclusive access to direct messaging.
              Receive personalized content, respond to messages, and unlock
              exclusive pay-per-view media sent just for you.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--foreground)]">Private Messages</h4>
                  <p className="text-sm text-[var(--muted)]">Direct conversation, just between us</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--foreground)]">PPV Content</h4>
                  <p className="text-sm text-[var(--muted)]">Unlock exclusive media sent in chat</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--foreground)]">Send Tips</h4>
                  <p className="text-sm text-[var(--muted)]">Show appreciation with instant tips</p>
                </div>
              </div>
            </div>

            <Link href="/membership">
              <Button variant="premium" size="lg">
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
            <div className="luxury-card p-6 max-w-md mx-auto">
              {/* Chat header */}
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)]" />
                <div>
                  <h4 className="font-medium text-[var(--foreground)]">Creator</h4>
                  <p className="text-xs text-[var(--success)]">Online</p>
                </div>
                <Badge variant="vip" className="ml-auto">VIP</Badge>
              </div>

              {/* Messages */}
              <div className="py-6 space-y-4">
                {/* Received message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex-shrink-0" />
                  <div>
                    <div className="chat-bubble-received px-4 py-2 max-w-[240px]">
                      <p className="text-sm">Hey! Thanks for subscribing! Here&apos;s something special for you 💕</p>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">2:34 PM</p>
                  </div>
                </div>

                {/* PPV Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex-shrink-0" />
                  <div>
                    <div className="relative rounded-xl overflow-hidden max-w-[240px]">
                      <div className="aspect-[4/3] bg-[var(--surface)]">
                        <div className="absolute inset-0 ppv-lock-overlay">
                          <div className="text-center">
                            <Lock className="w-8 h-8 text-[var(--gold)] mx-auto mb-2" />
                            <p className="text-white font-medium">$9.99</p>
                            <p className="text-xs text-white/70">to unlock</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">2:35 PM</p>
                  </div>
                </div>

                {/* Sent message */}
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="chat-bubble-sent px-4 py-2 max-w-[240px]">
                      <p className="text-sm">Omg thank you! 😍</p>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">2:36 PM</p>
                  </div>
                </div>

                {/* Tip notification */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30">
                    <DollarSign className="w-4 h-4 text-[var(--gold)]" />
                    <span className="text-sm text-[var(--gold)]">You sent a $5 tip!</span>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="chat-input flex-1"
                  disabled
                />
                <button className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center">
                  <Send className="w-5 h-5 text-[var(--background)]" />
                </button>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-10 bg-[var(--gold)]/5 blur-3xl rounded-full -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
