"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Badge } from "@/components/ui";
import {
  Play,
  Image as ImageIcon,
  Music,
  Package,
  Download,
  Eye,
  Crown,
  X,
  Search,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  thumbnail: string;
  contentUrl: string;
  accessTier: string;
  purchasedAt?: string;
  source: "purchased" | "subscription";
}

const typeIcons: Record<string, any> = {
  photo: ImageIcon,
  video: Play,
  audio: Music,
  pack: Package,
};

const tierColors: Record<string, string> = {
  FREE: "bg-emerald-500/20 text-emerald-400",
  BASIC: "bg-blue-500/20 text-blue-400",
  PREMIUM: "bg-purple-500/20 text-purple-400",
  VIP: "bg-[var(--gold)]/20 text-[var(--gold)]",
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<"purchased" | "subscription">("purchased");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [purchasedContent, setPurchasedContent] = useState<ContentItem[]>([]);
  const [subscriptionContent, setSubscriptionContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLibrary = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/user/library?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPurchasedContent(data.purchasedContent || []);
        setSubscriptionContent(data.subscriptionContent || []);
      }
    } catch (error) {
      console.error("Error fetching library:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [searchQuery]);

  const content = activeTab === "purchased" ? purchasedContent : subscriptionContent;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            My Library
          </h1>
          <p className="text-[var(--muted)]">
            Access all your purchased and subscription content
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchLibrary}>
          <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4 mb-6"
      >
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("purchased")}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all",
              activeTab === "purchased"
                ? "bg-[var(--gold)] text-[var(--background)]"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            )}
          >
            Purchased ({purchasedContent.length})
          </button>
          <button
            onClick={() => setActiveTab("subscription")}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all",
              activeTab === "subscription"
                ? "bg-[var(--gold)] text-[var(--background)]"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            )}
          >
            Subscription ({subscriptionContent.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--gold)]"
          />
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
        </div>
      ) : content.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-[var(--gold)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {searchQuery ? "No results found" : "No content yet"}
          </h3>
          <p className="text-[var(--muted)] mb-6">
            {searchQuery
              ? "Try a different search term"
              : activeTab === "purchased"
              ? "Purchase content to see it here"
              : "Subscribe to access exclusive content"}
          </p>
          <Button variant="premium" onClick={() => (window.location.href = "/gallery")}>
            Browse Gallery
          </Button>
        </motion.div>
      ) : (
        /* Content Grid */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {content.map((item, index) => {
            const Icon = typeIcons[item.type] || ImageIcon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => setSelectedContent(item)}
              >
                <Card variant="luxury" hover className="overflow-hidden p-0">
                  <div className="relative aspect-[4/5]">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Type & Tier badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge
                        variant={item.type === "video" ? "video" : "photo"}
                        className="text-xs"
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {item.type.toUpperCase()}
                      </Badge>
                      <Badge className={tierColors[item.accessTier]}>
                        {item.accessTier === "VIP" && <Crown className="w-3 h-3 mr-1" />}
                        {item.accessTier}
                      </Badge>
                    </div>

                    {/* Play/View button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-[var(--gold)] flex items-center justify-center">
                        {item.type === "video" ? (
                          <Play className="w-6 h-6 text-[var(--background)] ml-1" fill="currentColor" />
                        ) : (
                          <Eye className="w-6 h-6 text-[var(--background)]" />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-medium text-lg mb-1">
                        {item.title}
                      </h3>
                      {item.purchasedAt && (
                        <p className="text-white/60 text-sm">
                          Purchased {formatDate(item.purchasedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 flex items-center gap-2">
                    <Button variant="premium" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <a
                      href={item.contentUrl}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Content Modal */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedContent(null)}
          >
            <button
              className="absolute top-6 right-6 p-2 text-white/60 hover:text-white z-10"
              onClick={() => setSelectedContent(null)}
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full"
            >
              <Card variant="luxury" className="overflow-hidden p-0">
                {selectedContent.type === "video" ? (
                  <video
                    src={selectedContent.contentUrl}
                    controls
                    autoPlay
                    className="w-full aspect-video bg-black"
                  />
                ) : selectedContent.type === "audio" ? (
                  <div className="p-8 bg-[var(--surface)]">
                    <div className="w-32 h-32 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-6">
                      <Music className="w-16 h-16 text-[var(--gold)]" />
                    </div>
                    <audio
                      src={selectedContent.contentUrl}
                      controls
                      autoPlay
                      className="w-full"
                    />
                  </div>
                ) : (
                  <img
                    src={selectedContent.contentUrl}
                    alt={selectedContent.title}
                    className="w-full max-h-[70vh] object-contain bg-black"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--foreground)]">
                        {selectedContent.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={tierColors[selectedContent.accessTier]}>
                          {selectedContent.accessTier}
                        </Badge>
                        <Badge variant={selectedContent.type === "video" ? "video" : "photo"}>
                          {selectedContent.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <a href={selectedContent.contentUrl} download>
                      <Button variant="premium">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
