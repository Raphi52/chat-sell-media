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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

const userLinks = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/library", icon: Image, label: "My Library" },
  { href: "/dashboard/messages", icon: MessageCircle, label: "Messages", badge: 3 },
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

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const NavLink = ({
    href,
    icon: Icon,
    label,
    badge,
  }: {
    href: string;
    icon: any;
    label: string;
    badge?: number;
  }) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          isActive
            ? "bg-[var(--gold)]/10 text-[var(--gold)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
        )}
      >
        <Icon className="w-5 h-5" />
        <span className="flex-1">{label}</span>
        {badge && badge > 0 && (
          <Badge variant="premium" className="px-2 py-0.5 text-xs">
            {badge}
          </Badge>
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-[var(--gold)]" />
          <span className="text-xl font-semibold gradient-gold-text">
            Mia Costa
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[var(--gold)]" />
            </div>
          )}
          <div>
            <p className="font-medium text-[var(--foreground)]">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {isAdmin ? "Creator" : "Member"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {userLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Creator Tools
              </p>
            </div>
            {adminLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 border-r border-[var(--border)] bg-[var(--background)]">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 border-b border-[var(--border)] bg-[var(--background)] z-40">
        <Link href="/" className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-[var(--gold)]" />
          <span className="text-lg font-semibold gradient-gold-text">
            Mia Costa
          </span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg hover:bg-[var(--surface)]"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 border-r border-[var(--border)] bg-[var(--background)] z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for content */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
      <div className="lg:hidden h-16" />
    </>
  );
}
