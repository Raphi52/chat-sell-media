"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Image,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/media", icon: Image, label: "Media" },
  { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/payments", icon: DollarSign, label: "Payments" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // In production, check for admin role
  // if (status === "loading") return null;
  // if (!session || session.user.role !== "ADMIN") {
  //   redirect("/");
  // }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
        <div className="p-6 border-b border-[var(--border)]">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center">
              <Crown className="w-6 h-6 text-[var(--background)]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--foreground)]">
                Admin Panel
              </h1>
              <p className="text-xs text-[var(--muted)]">ExclusiveHub</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
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
                        ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="admin-nav-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
