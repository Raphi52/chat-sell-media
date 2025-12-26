"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Users,
  MousePointer,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui";

interface AnalyticsData {
  summary: {
    totalViews: number;
    uniqueVisitors: number;
    uniqueSessions: number;
    avgViewsPerVisitor: string | number;
  };
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; views: number }[];
  deviceStats: Record<string, number>;
  browserStats: Record<string, number>;
  chartData: { date: string; views: number; visitors: number }[];
  recentViews: {
    id: string;
    path: string;
    device: string;
    browser: string;
    referrer: string | null;
    createdAt: string;
  }[];
}

const periods = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics/stats?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Erreur lors du chargement des analytics");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const formatPath = (path: string) => {
    if (path === "/") return "Accueil";
    return path.replace(/^\//, "").replace(/-/g, " ").replace(/\//g, " > ");
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Analytics</h1>
            <p className="text-[var(--muted)] mt-1">Statistiques de visites</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex bg-[var(--surface)] rounded-lg p-1">
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
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-[var(--muted)] text-sm">Vues totales</span>
                </div>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {data.summary.totalViews.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-[var(--muted)] text-sm">Visiteurs uniques</span>
                </div>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {data.summary.uniqueVisitors.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <MousePointer className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-[var(--muted)] text-sm">Sessions</span>
                </div>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {data.summary.uniqueSessions.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[var(--gold)]" />
                  </div>
                  <span className="text-[var(--muted)] text-sm">Vues/Visiteur</span>
                </div>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {data.summary.avgViewsPerVisitor}
                </p>
              </motion.div>
            </div>

            {/* Chart */}
            {data.chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mb-8"
              >
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6">
                  Évolution des visites
                </h2>
                <div className="h-64 flex items-end gap-1">
                  {data.chartData.map((day, index) => {
                    const maxViews = Math.max(...data.chartData.map((d) => d.views));
                    const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div className="w-full flex flex-col items-center">
                          <span className="text-xs text-[var(--muted)] mb-1">
                            {day.views}
                          </span>
                          <div
                            className="w-full bg-[var(--gold)]/80 rounded-t-sm transition-all hover:bg-[var(--gold)]"
                            style={{ height: `${Math.max(height, 4)}%` }}
                            title={`${day.views} vues, ${day.visitors} visiteurs`}
                          />
                        </div>
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
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Pages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Pages les plus visitées
                </h2>
                <div className="space-y-3">
                  {data.topPages.length > 0 ? (
                    data.topPages.map((page, index) => (
                      <div
                        key={page.path}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <span className="text-[var(--foreground)] text-sm truncate max-w-[200px]">
                            {formatPath(page.path)}
                          </span>
                        </div>
                        <span className="text-[var(--muted)] text-sm">
                          {page.views} vues
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--muted)] text-sm">Aucune donnée</p>
                  )}
                </div>
              </motion.div>

              {/* Top Referrers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Sources de trafic
                </h2>
                <div className="space-y-3">
                  {data.topReferrers.length > 0 ? (
                    data.topReferrers.map((ref, index) => (
                      <div
                        key={ref.source}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-[var(--muted)]" />
                          <span className="text-[var(--foreground)] text-sm truncate max-w-[200px]">
                            {ref.source}
                          </span>
                        </div>
                        <span className="text-[var(--muted)] text-sm">
                          {ref.views} visites
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--muted)] text-sm">Aucune donnée</p>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Device Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Appareils
                </h2>
                <div className="space-y-4">
                  {Object.entries(data.deviceStats).map(([device, count]) => {
                    const total = Object.values(data.deviceStats).reduce(
                      (a, b) => a + b,
                      0
                    );
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={device}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(device)}
                            <span className="text-[var(--foreground)] text-sm capitalize">
                              {device}
                            </span>
                          </div>
                          <span className="text-[var(--muted)] text-sm">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--gold)] rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Browser Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Navigateurs
                </h2>
                <div className="space-y-4">
                  {Object.entries(data.browserStats).map(([browser, count]) => {
                    const total = Object.values(data.browserStats).reduce(
                      (a, b) => a + b,
                      0
                    );
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={browser}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[var(--foreground)] text-sm">
                            {browser}
                          </span>
                          <span className="text-[var(--muted)] text-sm">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Recent Views */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Visites récentes
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted)]">
                        Page
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted)]">
                        Appareil
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted)]">
                        Navigateur
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted)]">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentViews.map((view) => (
                      <tr
                        key={view.id}
                        className="border-b border-[var(--border)]/50 last:border-0"
                      >
                        <td className="py-3 px-2 text-sm text-[var(--foreground)]">
                          {formatPath(view.path)}
                        </td>
                        <td className="py-3 px-2 text-sm text-[var(--muted)] capitalize">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(view.device)}
                            {view.device}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-[var(--muted)]">
                          {view.browser}
                        </td>
                        <td className="py-3 px-2 text-sm text-[var(--muted)]">
                          {new Date(view.createdAt).toLocaleString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
