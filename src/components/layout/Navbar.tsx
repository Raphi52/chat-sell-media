"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Settings, Crown, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { getCreator } from "@/lib/creators";

interface NavbarProps {
  creatorSlug?: string;
}

export function Navbar({ creatorSlug = "miacosta" }: NavbarProps) {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const creator = getCreator(creatorSlug);
  const basePath = `/${creatorSlug}`;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: `${basePath}/gallery`, label: "Gallery", icon: Sparkles },
    { href: `${basePath}/membership`, label: "VIP Access", icon: Crown },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-[var(--gold)]/10 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with avatar */}
          <Link href={basePath}>
            <motion.div
              className="flex items-center gap-3 px-3 py-2 -ml-3 rounded-2xl border border-transparent hover:border-[var(--gold)]/30 hover:bg-white/5 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {/* Creator avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--gold)] to-yellow-600 p-[2px]">
                  <img
                    src={creator?.avatar || "/placeholder-avatar.jpg"}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
              </div>

              {/* Name with gradient */}
              <div className="hidden sm:block">
                <span className="text-xl font-bold gradient-gold-text font-serif tracking-wide">
                  {creator?.displayName || "Creator"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Online now
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-gray-300 border border-transparent hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all duration-300"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
            ) : session ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-full border border-white/10 hover:border-[var(--gold)]/30 bg-white/5 hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="w-8 h-8 rounded-full border border-[var(--gold)]/50 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-yellow-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-black" />
                    </div>
                  )}
                  <span className="text-sm text-gray-300 max-w-[100px] truncate">
                    {session.user?.name?.split(" ")[0] || "User"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute right-0 mt-3 w-64 bg-black/95 backdrop-blur-xl border border-[var(--gold)]/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                      >
                        {/* Gold accent */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />

                        <div className="px-5 py-4 border-b border-white/10">
                          <p className="text-sm font-semibold text-white">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        <div className="py-2">
                          {[
                            { href: `${basePath}/dashboard`, icon: Crown, label: "Dashboard", color: "text-[var(--gold)]" },
                            { href: `${basePath}/dashboard/messages`, icon: MessageCircle, label: "Messages", color: "text-blue-400" },
                            { href: `${basePath}/dashboard/settings`, icon: Settings, label: "Settings", color: "text-gray-400" },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <item.icon className={`w-4 h-4 ${item.color}`} />
                              {item.label}
                            </Link>
                          ))}
                          <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href={`${basePath}/auth/login`}>
                  <motion.button
                    className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in
                  </motion.button>
                </Link>
                <Link href={`${basePath}/auth/register`}>
                  <motion.button
                    className="relative group px-6 py-2.5 rounded-full overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Gradient background */}
                    <span className="absolute inset-0 bg-gradient-to-r from-[var(--gold)] via-yellow-500 to-[var(--gold)] bg-[length:200%_100%] animate-shimmer" />

                    {/* Glow effect */}
                    <span className="absolute inset-0 bg-[var(--gold)] opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />

                    <span className="relative flex items-center gap-2 text-sm font-bold text-black">
                      <Crown className="w-4 h-4" />
                      Join VIP
                    </span>
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--gold)]/30 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[var(--gold)]" />
            ) : (
              <Menu className="w-5 h-5 text-gray-300" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/90 backdrop-blur-xl z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-x-0 top-20 bottom-0 z-50 overflow-y-auto"
            >
              <div className="min-h-full px-6 py-8 flex flex-col">
                {/* Creator Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8 p-4 rounded-2xl bg-white/5 border border-[var(--gold)]/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--gold)] to-yellow-600 p-[2px]">
                      <img
                        src={creator?.avatar || "/placeholder-avatar.jpg"}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{creator?.displayName || "Creator"}</p>
                      <p className="text-sm text-gray-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Online now
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation Links */}
                <div className="space-y-3 mb-8">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:border-[var(--gold)]/30 hover:bg-[var(--gold)]/5 transition-all active:scale-[0.98]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
                          <link.icon className="w-5 h-5 text-[var(--gold)]" />
                        </div>
                        <span className="text-lg font-medium">{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Auth Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-auto space-y-3"
                >
                  {session ? (
                    <>
                      <Link href={`${basePath}/dashboard`} onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.button
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--gold)] to-yellow-600 text-black font-bold text-lg shadow-lg shadow-[var(--gold)]/20"
                          whileTap={{ scale: 0.98 }}
                        >
                          <Crown className="w-6 h-6" />
                          My Dashboard
                        </motion.button>
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href={`${basePath}/auth/register`} onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.button
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--gold)] to-yellow-600 text-black font-bold text-lg shadow-lg shadow-[var(--gold)]/20"
                          whileTap={{ scale: 0.98 }}
                        >
                          <Crown className="w-6 h-6" />
                          Join VIP
                        </motion.button>
                      </Link>
                      <Link href={`${basePath}/auth/login`} onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.button
                          className="w-full px-6 py-4 rounded-2xl border border-white/10 text-gray-300 hover:border-[var(--gold)]/30 hover:text-white transition-all text-lg"
                          whileTap={{ scale: 0.98 }}
                        >
                          Already a member? Sign in
                        </motion.button>
                      </Link>
                    </>
                  )}
                </motion.div>

                {/* Bottom Spacing */}
                <div className="h-8" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
