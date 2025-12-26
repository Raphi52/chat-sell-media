"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Image,
  Gift,
  Lock,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";

interface Payment {
  id: string;
  type: "SUBSCRIPTION" | "MEDIA_PURCHASE" | "PPV_UNLOCK" | "TIP";
  amount: number;
  currency: string;
  status: string;
  user: string;
  description: string;
  createdAt: string;
}

interface Stats {
  totalRevenue: number;
  subscriptionRevenue: number;
  mediaRevenue: number;
  tipsRevenue: number;
  ppvRevenue: number;
  totalTransactions: number;
}

interface ChartData {
  date: string;
  amount: number;
}

const periods = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "all", label: "Tout" },
];

const types = [
  { value: "all", label: "Tous" },
  { value: "SUBSCRIPTION", label: "Abonnements" },
  { value: "MEDIA_PURCHASE", label: "Médias" },
  { value: "TIP", label: "Tips" },
  { value: "PPV_UNLOCK", label: "PPV" },
];

const typeIcons: Record<string, React.ReactNode> = {
  SUBSCRIPTION: <CreditCard className="w-4 h-4" />,
  MEDIA_PURCHASE: <Image className="w-4 h-4" />,
  TIP: <Gift className="w-4 h-4" />,
  PPV_UNLOCK: <Lock className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  SUBSCRIPTION: "bg-green-500/20 text-green-400",
  MEDIA_PURCHASE: "bg-blue-500/20 text-blue-400",
  TIP: "bg-purple-500/20 text-purple-400",
  PPV_UNLOCK: "bg-[var(--gold)]/20 text-[var(--gold)]",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    subscriptionRevenue: 0,
    mediaRevenue: 0,
    tipsRevenue: 0,
    ppvRevenue: 0,
    totalTransactions: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [type, setType] = useState("all");

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("period", period);
      params.set("type", type);

      const res = await fetch(`/api/admin/payments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
        setStats(data.stats);
        setChartData(data.chartData);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [period, type]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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
              Paiements
            </h1>
            <p className="text-[var(--muted)] mt-1">
              Historique des revenus et transactions
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    period === p.value
                      ? "bg-[var(--gold)] text-[var(--background)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={fetchPayments}
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="luxury" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[var(--muted)] text-sm">Revenu total</span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-sm text-[var(--muted)] mt-1">
                {stats.totalTransactions} transactions
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
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-[var(--muted)] text-sm">Abonnements</span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {formatCurrency(stats.subscriptionRevenue)}
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
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-[var(--muted)] text-sm">Tips</span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {formatCurrency(stats.tipsRevenue)}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="luxury" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <span className="text-[var(--muted)] text-sm">PPV + Médias</span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {formatCurrency(stats.ppvRevenue + stats.mediaRevenue)}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card variant="luxury" className="p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6">
                Évolution des revenus
              </h2>
              <div className="h-48 flex items-end gap-1">
                {chartData.map((day) => {
                  const maxAmount = Math.max(...chartData.map((d) => d.amount));
                  const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <span className="text-xs text-[var(--muted)]">
                        ${day.amount.toFixed(0)}
                      </span>
                      <div
                        className="w-full bg-emerald-500/80 rounded-t-sm transition-all hover:bg-emerald-500"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`$${day.amount.toFixed(2)}`}
                      />
                      <span className="text-xs text-[var(--muted)] -rotate-45 origin-left whitespace-nowrap">
                        {new Date(day.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Type Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-4 py-2 text-sm rounded-xl transition-colors ${
                  type === t.value
                    ? "bg-[var(--gold)] text-[var(--background)]"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card variant="luxury" className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <DollarSign className="w-12 h-12 text-[var(--muted)] mb-4" />
                <p className="text-[var(--muted)]">Aucune transaction trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                      <th className="text-left py-4 px-6 text-sm font-medium text-[var(--muted)]">
                        Type
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[var(--muted)]">
                        Utilisateur
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[var(--muted)]">
                        Description
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[var(--muted)]">
                        Montant
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[var(--muted)]">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <td className="py-4 px-6">
                          <Badge className={typeColors[payment.type]}>
                            <span className="flex items-center gap-1.5">
                              {typeIcons[payment.type]}
                              {payment.type === "SUBSCRIPTION" && "Abo"}
                              {payment.type === "MEDIA_PURCHASE" && "Média"}
                              {payment.type === "TIP" && "Tip"}
                              {payment.type === "PPV_UNLOCK" && "PPV"}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[var(--foreground)]">
                            {payment.user}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[var(--muted)] text-sm">
                            {payment.description}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <ArrowUpRight className="w-4 h-4" />
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[var(--muted)] text-sm">
                            {new Date(payment.createdAt).toLocaleString("fr-FR")}
                          </span>
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
