"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Home,
  Image,
  MessageCircle,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Star,
  Upload,
  BarChart3,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { getDefaultCreator } from "@/lib/creators";

const baseUserLinks = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/library", icon: Image, label: "My Library" },
  { href: "/dashboard/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/subscription", icon: Star, label: "Subscription" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

const adminLinks = [
  { href: "/admin/media", icon: Upload, label: "Manage Media" },
  { href: "/admin/messages", icon: MessageCircle, label: "All Messages" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const creator = getDefaultCreator();

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const NavLink = ({
    href,
    icon: Icon,
    label,
    badge,
    index = 0,
  }: {
    href: string;
    icon: any;
    label: string;
    badge?: number;
    index?: number;
  }) => {
    const isActive = pathname === href;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link
          href={href}
          onClick={() => setIsMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
            isActive
              ? "bg-gradient-to-r from-[var(--gold)]/20 to-[var(--gold)]/5 text-[var(--gold)] border border-[var(--gold)]/30"
              : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
          )}
        >
          <Icon className={cn("w-5 h-5", isActive && "text-[var(--gold)]")} />
          <span className="flex-1 font-medium">{label}</span>
          {badge && badge > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-[var(--gold)] text-black rounded-full">
              {badge}
            </span>
          )}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
            />
          )}
        </Link>
      </motion.div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-black/95 backdrop-blur-xl">
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />

      {/* Logo & Back */}
      <div className="p-5 border-b border-white/10">
        <Link
          href={`/${creator.slug}`}
          className="flex items-center gap-3 px-3 py-2 -mx-3 rounded-xl hover:bg-white/5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-yellow-600 p-[2px]">
            <img
              src={creator.avatar}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <span className="text-lg font-bold gradient-gold-text">
              {creator.displayName}
            </span>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Back to site
            </p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-11 h-11 rounded-full object-cover border-2 border-[var(--gold)]/50"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--gold)] to-yellow-600 flex items-center justify-center">
              <span className="text-black font-bold text-lg">
                {session?.user?.name?.[0] || "U"}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email}
            </p>
          </div>
          {isAdmin && (
            <span className="px-2 py-1 text-[10px] font-bold bg-[var(--gold)] text-black rounded-md">
              ADMIN
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Menu
        </p>
        {baseUserLinks.map((link, index) => (
          <NavLink key={link.href} {...link} index={index} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-6 pb-2">
              <p className="px-4 text-xs font-semibold text-[var(--gold)] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Creator Tools
              </p>
            </div>
            {adminLinks.map((link, index) => (
              <NavLink key={link.href} {...link} index={index + baseUserLinks.length} />
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 border-r border-white/10 bg-black">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 border-b border-white/10 bg-black/95 backdrop-blur-xl z-40">
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />

        <Link href={`/${creator.slug}`} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-yellow-600 p-[2px]">
            <img
              src={creator.avatar}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <span className="text-lg font-bold gradient-gold-text">
            {creator.displayName}
          </span>
        </Link>
        <motion.button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--gold)]/30 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          {isMobileOpen ? (
            <X className="w-5 h-5 text-[var(--gold)]" />
          ) : (
            <Menu className="w-5 h-5 text-gray-300" />
          )}
        </motion.button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[280px] border-r border-[var(--gold)]/10 bg-black z-50 shadow-2xl shadow-black/50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for content */}
      <div className="hidden lg:block w-72 flex-shrink-0" />
      <div className="lg:hidden h-16" />
    </>
  );
}
