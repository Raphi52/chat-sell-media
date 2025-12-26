"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Input, Badge } from "@/components/ui";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Music,
  Package,
  X,
  Plus,
  Eye,
  EyeOff,
  DollarSign,
  Crown,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  Loader2,
  RefreshCw,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminCreator } from "@/components/providers/AdminCreatorContext";

interface MediaItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: "PHOTO" | "VIDEO" | "AUDIO" | "PACK";
  accessTier: "FREE" | "BASIC" | "VIP";
  thumbnailUrl: string | null;
  contentUrl: string;
  isPurchaseable: boolean;
  price: number | null;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
}

const mediaTypes = [
  { id: "PHOTO", label: "Photo", icon: ImageIcon },
  { id: "VIDEO", label: "Video", icon: Video },
  { id: "AUDIO", label: "Audio", icon: Music },
  { id: "PACK", label: "Pack", icon: Package },
];

const accessTiers = [
  { id: "FREE", label: "Free", color: "bg-emerald-500/20 text-emerald-400" },
  { id: "BASIC", label: "Basic", color: "bg-blue-500/20 text-blue-400" },
  { id: "VIP", label: "VIP", color: "bg-[var(--gold)]/20 text-[var(--gold)]" },
];

export default function AdminMediaPage() {
  const { selectedCreator } = useAdminCreator();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState("PHOTO");
  const [selectedTier, setSelectedTier] = useState("FREE");
  const [isPurchaseable, setIsPurchaseable] = useState(false);
  const [price, setPrice] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [uploadError, setUploadError] = useState("");
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAccessTier, setEditAccessTier] = useState("FREE");
  const [editIsPurchaseable, setEditIsPurchaseable] = useState(false);
  const [editPrice, setEditPrice] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch media from API
  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("creator", selectedCreator.slug);
      if (filterType !== "all") params.set("type", filterType);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/media?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, searchQuery, selectedCreator.slug]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!title || files.length === 0) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", selectedType);
      formData.append("accessTier", selectedTier);
      formData.append("isPurchaseable", isPurchaseable.toString());
      formData.append("creatorSlug", selectedCreator.slug);
      if (isPurchaseable && price) {
        formData.append("price", price);
      }
      formData.append("isPublished", "true");

      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMedia((prev) => [data.media, ...prev]);
        setShowUploadModal(false);
        // Reset form
        setTitle("");
        setDescription("");
        setFiles([]);
        setSelectedType("PHOTO");
        setSelectedTier("FREE");
        setIsPurchaseable(false);
        setPrice("");
      } else {
        const error = await res.json();
        setUploadError(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleTogglePublish = async (item: MediaItem) => {
    try {
      const res = await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          isPublished: !item.isPublished,
        }),
      });

      if (res.ok) {
        setMedia((prev) =>
          prev.map((m) =>
            m.id === item.id ? { ...m, isPublished: !m.isPublished } : m
          )
        );
      }
    } catch (error) {
      console.error("Toggle publish error:", error);
    }
  };

  const filteredMedia = media.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  // Open edit modal
  const openEditModal = (item: MediaItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditAccessTier(item.accessTier);
    setEditIsPurchaseable(item.isPurchaseable);
    setEditPrice(item.price ? String(item.price) : "");
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (!editItem) return;

    setIsEditing(true);
    try {
      const res = await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editItem.id,
          title: editTitle,
          description: editDescription || null,
          accessTier: editAccessTier,
          isPurchaseable: editIsPurchaseable,
          price: editIsPurchaseable && editPrice ? parseFloat(editPrice) : null,
        }),
      });

      if (res.ok) {
        const { media: updatedMedia } = await res.json();
        setMedia((prev) =>
          prev.map((m) => (m.id === editItem.id ? { ...m, ...updatedMedia } : m))
        );
        setEditItem(null);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update media");
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("Failed to update media");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Media Library
          </h1>
          <p className="text-[var(--muted)]">
            Manage your photos, videos, and exclusive content.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={fetchMedia}>
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button variant="premium" onClick={() => setShowUploadModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Upload Media
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--gold)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filterType === "all"
                ? "bg-[var(--gold)] text-[var(--background)]"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            All
          </button>
          {mediaTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                filterType === type.id
                  ? "bg-[var(--gold)] text-[var(--background)]"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-[var(--gold)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            No media found
          </h3>
          <p className="text-[var(--muted)] mb-6">
            Upload your first media to get started
          </p>
          <Button variant="premium" onClick={() => setShowUploadModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Upload Media
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredMedia.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="luxury" hover className="overflow-hidden p-0">
                <div
                  className="relative aspect-[4/5] cursor-pointer group"
                  onClick={() => setPreviewItem(item)}
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--surface)] flex items-center justify-center">
                      {item.type === "VIDEO" ? (
                        <Video className="w-16 h-16 text-[var(--muted)]" />
                      ) : item.type === "AUDIO" ? (
                        <Music className="w-16 h-16 text-[var(--muted)]" />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-[var(--muted)]" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Play overlay for videos */}
                  {item.type === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center">
                        <Play className="w-8 h-8 text-[var(--background)] ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Status badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge
                      className={
                        accessTiers.find((t) => t.id === item.accessTier)?.color
                      }
                    >
                      {item.accessTier === "VIP" && (
                        <Crown className="w-3 h-3 mr-1" />
                      )}
                      {item.accessTier}
                    </Badge>
                    {item.isPurchaseable && item.price && (
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        <DollarSign className="w-3 h-3 mr-1" />$
                        {Number(item.price).toFixed(2)}
                      </Badge>
                    )}
                  </div>

                  {/* Published status */}
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className="absolute top-3 right-3"
                    title={item.isPublished ? "Published" : "Draft"}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        item.isPublished
                          ? "bg-emerald-500/80 hover:bg-emerald-500"
                          : "bg-[var(--muted)]/80 hover:bg-[var(--muted)]"
                      )}
                    >
                      {item.isPublished ? (
                        <Eye className="w-4 h-4 text-white" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>

                  {/* Type icon */}
                  {item.type === "VIDEO" && (
                    <div className="absolute bottom-16 right-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--gold)]/80 flex items-center justify-center">
                        <Video className="w-5 h-5 text-[var(--background)]" />
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-medium text-lg mb-1 truncate">
                      {item.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {item.viewCount.toLocaleString()} views
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card variant="luxury" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    Upload New Media
                  </h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {uploadError && (
                  <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                    {uploadError}
                  </div>
                )}

                {/* Media Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
                    Media Type
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {mediaTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                          selectedType === type.id
                            ? "border-[var(--gold)] bg-[var(--gold)]/10"
                            : "border-[var(--border)] hover:border-[var(--gold)]/50"
                        )}
                      >
                        <type.icon
                          className={cn(
                            "w-6 h-6",
                            selectedType === type.id
                              ? "text-[var(--gold)]"
                              : "text-[var(--muted)]"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            selectedType === type.id
                              ? "text-[var(--gold)]"
                              : "text-[var(--muted)]"
                          )}
                        >
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
                    Upload Files
                  </label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                      files.length > 0
                        ? "border-[var(--gold)] bg-[var(--gold)]/5"
                        : "border-[var(--border)] hover:border-[var(--gold)]/50"
                    )}
                  >
                    <input
                      type="file"
                      multiple
                      accept={
                        selectedType === "PHOTO"
                          ? "image/*"
                          : selectedType === "VIDEO"
                          ? "video/*"
                          : selectedType === "AUDIO"
                          ? "audio/*"
                          : "*/*"
                      }
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                      {files.length > 0 ? (
                        <div className="space-y-2">
                          {files.map((file, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-center gap-2 text-[var(--gold)]"
                            >
                              <Check className="w-4 h-4" />
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <p className="text-[var(--foreground)] font-medium mb-1">
                            Drop files here or click to upload
                          </p>
                          <p className="text-[var(--muted)] text-sm">
                            Supports JPG, PNG, MP4, MP3
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-4 mb-6">
                  <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter media title"
                  />
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description (optional)"
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--gold)] resize-none"
                    />
                  </div>
                </div>

                {/* Access Tier */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
                    Access Tier
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {accessTiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          selectedTier === tier.id
                            ? "border-[var(--gold)] bg-[var(--gold)]/10"
                            : "border-[var(--border)] hover:border-[var(--gold)]/50"
                        )}
                      >
                        <Badge className={tier.color}>{tier.label}</Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Purchase */}
                <div className="mb-6 p-4 bg-[var(--surface)] rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">
                        Allow Individual Purchase
                      </h4>
                      <p className="text-sm text-[var(--muted)]">
                        Users can buy this content without subscribing
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPurchaseable(!isPurchaseable)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors",
                        isPurchaseable ? "bg-[var(--gold)]" : "bg-[var(--border)]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full bg-white shadow transition-transform",
                          isPurchaseable ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                  {isPurchaseable && (
                    <Input
                      label="Price (USD)"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="4.99"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="premium"
                    onClick={handleUpload}
                    disabled={!title || files.length === 0 || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setEditItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <Card variant="luxury" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    Edit Media
                  </h2>
                  <button
                    onClick={() => setEditItem(null)}
                    className="p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Preview */}
                <div className="mb-6 rounded-xl overflow-hidden aspect-video bg-[var(--surface)]">
                  {editItem.thumbnailUrl ? (
                    <img
                      src={editItem.thumbnailUrl}
                      alt={editItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-[var(--muted)]" />
                    </div>
                  )}
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Enter title"
                  />

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Enter description (optional)"
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--gold)] resize-none"
                    />
                  </div>

                  {/* Access Tier */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
                      Access Tier
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {accessTiers.map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() => setEditAccessTier(tier.id)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-center",
                            editAccessTier === tier.id
                              ? "border-[var(--gold)] bg-[var(--gold)]/10"
                              : "border-[var(--border)] hover:border-[var(--gold)]/50"
                          )}
                        >
                          <Badge className={tier.color}>{tier.label}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Purchaseable */}
                  <div className="p-4 bg-[var(--surface)] rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-[var(--foreground)]">
                          Individual Purchase
                        </h4>
                        <p className="text-sm text-[var(--muted)]">
                          Allow buying without subscription
                        </p>
                      </div>
                      <button
                        onClick={() => setEditIsPurchaseable(!editIsPurchaseable)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors",
                          editIsPurchaseable ? "bg-[var(--gold)]" : "bg-[var(--border)]"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full bg-white shadow transition-transform",
                            editIsPurchaseable ? "translate-x-6" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>
                    {editIsPurchaseable && (
                      <Input
                        label="Price (USD)"
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="4.99"
                        leftIcon={<DollarSign className="w-4 h-4" />}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setEditItem(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="premium"
                      onClick={handleEditSave}
                      disabled={!editTitle || isEditing}
                      className="flex-1"
                    >
                      {isEditing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="relative">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {previewItem.type === "VIDEO" ? (
                  <video
                    src={previewItem.contentUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[80vh] bg-black rounded-xl"
                  />
                ) : previewItem.type === "AUDIO" ? (
                  <div className="bg-[var(--surface)] rounded-xl p-8">
                    <div className="w-32 h-32 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-6">
                      <Music className="w-16 h-16 text-[var(--gold)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] text-center mb-4">
                      {previewItem.title}
                    </h3>
                    <audio
                      src={previewItem.contentUrl}
                      controls
                      autoPlay
                      className="w-full"
                    />
                  </div>
                ) : (
                  <img
                    src={previewItem.contentUrl}
                    alt={previewItem.title}
                    className="w-full max-h-[80vh] object-contain rounded-xl"
                  />
                )}

                <div className="mt-4 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {previewItem.title}
                  </h3>
                  {previewItem.description && (
                    <p className="text-white/60">{previewItem.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
