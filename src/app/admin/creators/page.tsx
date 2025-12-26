"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Input, Badge } from "@/components/ui";
import {
  Plus,
  X,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Users,
  Camera,
  Film,
  Instagram,
  Twitter,
  Upload,
  AlertTriangle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Creator {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  stats: {
    photos: number;
    videos: number;
    subscribers: number;
  };
  isActive: boolean;
  createdAt: string;
}

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
  const [deletingCreator, setDeletingCreator] = useState<Creator | null>(null);
  const [deleteWithMedia, setDeleteWithMedia] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formInstagram, setFormInstagram] = useState("");
  const [formTwitter, setFormTwitter] = useState("");
  const [formTiktok, setFormTiktok] = useState("");
  const [formAvatar, setFormAvatar] = useState<File | null>(null);
  const [formCover, setFormCover] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/creators");
      if (res.ok) {
        const data = await res.json();
        setCreators(data.creators || []);
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormDisplayName("");
    setFormSlug("");
    setFormBio("");
    setFormInstagram("");
    setFormTwitter("");
    setFormTiktok("");
    setFormAvatar(null);
    setFormCover(null);
    setAvatarPreview(null);
    setCoverPreview(null);
    setEditingCreator(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (creator: Creator) => {
    setEditingCreator(creator);
    setFormName(creator.name);
    setFormDisplayName(creator.displayName);
    setFormSlug(creator.slug);
    setFormBio(creator.bio || "");
    setFormInstagram(creator.socialLinks?.instagram || "");
    setFormTwitter(creator.socialLinks?.twitter || "");
    setFormTiktok(creator.socialLinks?.tiktok || "");
    setAvatarPreview(creator.avatar);
    setCoverPreview(creator.coverImage);
    setShowModal(true);
  };

  const openDeleteModal = (creator: Creator) => {
    setDeletingCreator(creator);
    setDeleteWithMedia(false);
    setShowDeleteModal(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formName) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", formName);
      formData.append("displayName", formDisplayName || formName);
      formData.append("slug", formSlug || formName.toLowerCase().replace(/\s+/g, ""));
      formData.append("bio", formBio);
      formData.append("instagram", formInstagram);
      formData.append("twitter", formTwitter);
      formData.append("tiktok", formTiktok);

      if (formAvatar) {
        formData.append("avatar", formAvatar);
      }
      if (formCover) {
        formData.append("coverImage", formCover);
      }

      if (editingCreator) {
        formData.append("id", editingCreator.id);
      }

      const res = await fetch("/api/admin/creators", {
        method: editingCreator ? "PATCH" : "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchCreators();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save creator");
      }
    } catch (error) {
      console.error("Error saving creator:", error);
      alert("Failed to save creator");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCreator) return;

    setIsDeleting(true);
    try {
      const params = new URLSearchParams({
        id: deletingCreator.id,
        deleteMedia: deleteWithMedia.toString(),
      });

      const res = await fetch(`/api/admin/creators?${params}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchCreators();
        setShowDeleteModal(false);
        setDeletingCreator(null);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete creator");
      }
    } catch (error) {
      console.error("Error deleting creator:", error);
      alert("Failed to delete creator");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Creators
          </h1>
          <p className="text-[var(--muted)]">
            Manage your creators and their profiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={fetchCreators}>
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button variant="premium" onClick={openCreateModal}>
            <Plus className="w-5 h-5 mr-2" />
            Add Creator
          </Button>
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
        </div>
      ) : creators.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center py-20"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--gold)]/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-[var(--gold)]" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
            Welcome to your Admin Panel
          </h2>
          <p className="text-[var(--muted)] mb-8 text-lg">
            Create your first creator profile to start managing content, messages, and subscriptions.
          </p>
          <Button variant="premium" size="lg" onClick={openCreateModal}>
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Creator
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator, index) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="luxury" className="overflow-hidden p-0">
                {/* Cover Image */}
                <div className="relative h-32">
                  {creator.coverImage ? (
                    <img
                      src={creator.coverImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--gold)]/30 to-purple-500/30" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={
                        creator.isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }
                    >
                      {creator.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Avatar & Info */}
                <div className="relative px-6 pb-6">
                  <div className="absolute -top-10 left-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-[var(--background)] bg-[var(--surface)]">
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center">
                          <span className="text-2xl font-bold text-[var(--background)]">
                            {creator.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-12">
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">
                      {creator.displayName}
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-3">
                      @{creator.slug}
                    </p>

                    {creator.bio && (
                      <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">
                        {creator.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1.5 text-[var(--muted)]">
                        <Camera className="w-4 h-4" />
                        <span>{creator.stats?.photos || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--muted)]">
                        <Film className="w-4 h-4" />
                        <span>{creator.stats?.videos || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--muted)]">
                        <Users className="w-4 h-4" />
                        <span>{creator.stats?.subscribers || 0}</span>
                      </div>
                    </div>

                    {/* Social Links */}
                    {(creator.socialLinks?.instagram ||
                      creator.socialLinks?.twitter) && (
                      <div className="flex items-center gap-2 mb-4">
                        {creator.socialLinks.instagram && (
                          <a
                            href={creator.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--gold)]/20 text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {creator.socialLinks.twitter && (
                          <a
                            href={creator.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--gold)]/20 text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditModal(creator)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <button
                        onClick={() => openDeleteModal(creator)}
                        className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
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
                    {editingCreator ? "Edit Creator" : "Add New Creator"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Cover Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Cover Image
                  </label>
                  <div className="relative h-32 rounded-xl overflow-hidden bg-[var(--surface)] border-2 border-dashed border-[var(--border)] hover:border-[var(--gold)]/50 transition-colors">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-[var(--muted)]" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Avatar Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Avatar
                  </label>
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[var(--surface)] border-2 border-dashed border-[var(--border)] hover:border-[var(--gold)]/50 transition-colors">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-[var(--muted)]" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Emma Rose"
                    />
                    <Input
                      label="Display Name"
                      value={formDisplayName}
                      onChange={(e) => setFormDisplayName(e.target.value)}
                      placeholder="Emma Rose"
                    />
                  </div>

                  <Input
                    label="Slug (URL)"
                    value={formSlug}
                    onChange={(e) =>
                      setFormSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
                      )
                    }
                    placeholder="emmarose"
                    disabled={!!editingCreator}
                  />

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      placeholder="Tell us about this creator..."
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--gold)] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Instagram"
                      value={formInstagram}
                      onChange={(e) => setFormInstagram(e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                    <Input
                      label="Twitter"
                      value={formTwitter}
                      onChange={(e) => setFormTwitter(e.target.value)}
                      placeholder="https://twitter.com/..."
                    />
                    <Input
                      label="TikTok"
                      value={formTiktok}
                      onChange={(e) => setFormTiktok(e.target.value)}
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="premium"
                    onClick={handleSave}
                    disabled={!formName || isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        {editingCreator ? "Save Changes" : "Create Creator"}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deletingCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card variant="luxury" className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
                    Delete Creator
                  </h2>
                  <p className="text-[var(--muted)]">
                    Are you sure you want to delete{" "}
                    <span className="text-[var(--foreground)] font-medium">
                      {deletingCreator.displayName}
                    </span>
                    ?
                  </p>
                </div>

                {/* Delete Options */}
                <div className="mb-6 p-4 bg-[var(--surface)] rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deleteWithMedia}
                      onChange={(e) => setDeleteWithMedia(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-[var(--border)] bg-[var(--background)] text-[var(--gold)] focus:ring-[var(--gold)]"
                    />
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        Delete all associated data
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        This will permanently delete all media, conversations,
                        payments, and subscriptions associated with this creator.
                      </p>
                    </div>
                  </label>
                </div>

                {deleteWithMedia && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-sm text-red-400">
                      <strong>Warning:</strong> This action cannot be undone. All
                      data will be permanently deleted.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
