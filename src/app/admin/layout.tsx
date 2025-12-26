"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Image,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  Crown,
  LogOut,
  Loader2,
  ChevronDown,
  Check,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminCreatorProvider, useAdminCreator } from "@/components/providers/AdminCreatorContext";

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/media", icon: Image, label: "Media" },
  { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/payments", icon: DollarSign, label: "Payments" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

function CreatorSelector() {
  const { selectedCreator, setSelectedCreator, creators } = useAdminCreator();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if no creators
  if (creators.length === 0) {
    return (
      <Link
        href="/admin/creators"
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 hover:bg-[var(--gold)]/20 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-[var(--gold)]" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-[var(--gold)] text-sm">Add Creator</p>
          <p className="text-xs text-gray-500">Get started</p>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--gold)]/30 transition-all"
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[var(--gold)]/30 bg-[var(--gold)]/20 flex items-center justify-center">
          {selectedCreator.avatar ? (
            <img
              src={selectedCreator.avatar}
              alt={selectedCreator.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[var(--gold)] font-bold">
              {selectedCreator.name?.charAt(0) || "?"}
            </span>
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-white text-sm">{selectedCreator.displayName}</p>
          <p className="text-xs text-gray-500">@{selectedCreator.slug}</p>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-gray-500 px-3 py-2 uppercase tracking-wider">
                  Select Creator
                </p>
                {creators.map((creator) => (
                  <button
                    key={creator.slug}
                    onClick={() => {
                      setSelectedCreator(creator);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                      selectedCreator.slug === creator.slug
                        ? "bg-[var(--gold)]/10 text-white"
                        : "hover:bg-white/5 text-gray-400"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 bg-[var(--gold)]/10 flex items-center justify-center">
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[var(--gold)] font-bold text-sm">
                          {creator.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{creator.displayName}</p>
                      <p className="text-xs text-gray-500">
                        {creator.stats?.photos || 0} photos, {creator.stats?.videos || 0} videos
                      </p>
                    </div>
                    {selectedCreator.slug === creator.slug && (
                      <Check className="w-4 h-4 text-[var(--gold)]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10 p-2">
                <Link
                  href="/admin/creators"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-[var(--gold)] transition-colors rounded-lg hover:bg-[var(--gold)]/10"
                >
                  <UserPlus className="w-4 h-4" />
                  Manage Creators
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCreator, creators, isLoading: isLoadingCreators } = useAdminCreator();

  const isLoginPage = pathname === "/admin/login";
  const isCreatorsPage = pathname === "/admin/creators";

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth");
        const data = await res.json();

        if (data.isAdmin) {
          setIsAuthenticated(true);
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isLoginPage, router]);

  // Redirect to creators page if no creators exist (onboarding)
  useEffect(() => {
    if (!isLoading && !isLoadingCreators && isAuthenticated && !isCreatorsPage && !isLoginPage) {
      if (creators.length === 0) {
        router.push("/admin/creators");
      }
    }
  }, [isLoading, isLoadingCreators, isAuthenticated, creators, isCreatorsPage, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[var(--gold)] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 bg-[#0a0a0a] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center shadow-lg shadow-[var(--gold)]/20">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-gray-500">Content Management</p>
            </div>
          </Link>

          {/* Creator Selector */}
          <CreatorSelector />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive
                        ? "bg-gradient-to-r from-[var(--gold)]/20 to-transparent text-[var(--gold)] border-l-2 border-[var(--gold)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="admin-nav-indicator"
                        className="ml-auto w-2 h-2 rounded-full bg-[var(--gold)]"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            href={`/${selectedCreator.slug}/dashboard`}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>User Dashboard</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 transition-colors rounded-xl hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-black">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminCreatorProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminCreatorProvider>
  );
}
