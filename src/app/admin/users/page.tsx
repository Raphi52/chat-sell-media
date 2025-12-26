"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Crown,
  Mail,
  Calendar,
  ShoppingBag,
  DollarSign,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    expiresAt: string;
  } | null;
  stats: {
    purchases: number;
    tips: number;
  };
}

interface Stats {
  total: number;
  subscribed: number;
  free: number;
}

const filters = [
  { value: "all", label: "Tous" },
  { value: "subscribed", label: "Abonnés" },
  { value: "free", label: "Gratuits" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, subscribed: 0, free: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (filter !== "all") params.set("filter", filter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const getPlanBadge = (subscription: User["subscription"]) => {
    if (!subscription) {
      return <Badge className="bg-gray-500/20 text-gray-400">Free</Badge>;
    }

    const colors: Record<string, string> = {
      Basic: "bg-blue-500/20 text-blue-400",
      BASIC: "bg-blue-500/20 text-blue-400",
      VIP: "bg-[var(--gold)]/20 text-[var(--gold)]",
      Premium: "bg-purple-500/20 text-purple-400",
      PREMIUM: "bg-purple-500/20 text-purple-400",
    };

    return (
      <Badge className={colors[subscription.plan] || colors.Basic}>
        {subscription.plan}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Utilisateurs
            </h1>
            <p className="text-[var(--muted)] mt-1">
              Gérer vos abonnés et utilisateurs
            </p>
          </motion.div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="luxury" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[var(--muted)] text-sm">Total utilisateurs</span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {stats.total}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="luxury" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <span className="text-[var(--muted)] text-sm">Abonnés payants</span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {stats.subscribed}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="luxury" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-[var(--muted)] text-sm">Utilisateurs gratuits</span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {stats.free}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--gold)]"
            />
          </div>

          {/* Filter */}
          <div className="flex bg-[var(--surface)] rounded-xl p-1 border border-[var(--border)]">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filter === f.value
                    ? "bg-[var(--gold)] text-[var(--background)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="luxury" className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="w-12 h-12 text-[var(--muted)] mb-4" />
                <p className="text-[var(--muted)]">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                      <th className="text-left py-4 px-6 text-sm font-medium text-[var(--muted)]">
                        Utilisateur
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[var(--muted)]">
                        Abonnement
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[var(--muted)]">
                        Achats
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[var(--muted)]">
                        Inscrit le
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center">
                                <span className="text-[var(--background)] font-bold">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[var(--foreground)]">
                                {user.name}
                              </p>
                              <p className="text-sm text-[var(--muted)]">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            {getPlanBadge(user.subscription)}
                            {user.subscription && (
                              <span className="text-xs text-[var(--muted)]">
                                Expire le{" "}
                                {new Date(user.subscription.expiresAt).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm text-[var(--muted)]">
                              <ShoppingBag className="w-4 h-4" />
                              <span>{user.stats.purchases}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-[var(--muted)]">
                              <DollarSign className="w-4 h-4" />
                              <span>{user.stats.tips} tips</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
