"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Upload,
  User,
  Globe,
  Instagram,
  Twitter,
  Loader2,
  Check,
  Camera,
  MessageSquare,
  Palette,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useAdminCreator } from "@/components/providers/AdminCreatorContext";

interface Settings {
  creatorName: string;
  creatorImage: string | null;
  creatorBio: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  siteName: string | null;
  siteDescription: string | null;
  welcomeMessage: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  chatEnabled: boolean;
  tipsEnabled: boolean;
  ppvEnabled: boolean;
}

export default function AdminSettingsPage() {
  const { selectedCreator, refreshCreators } = useAdminCreator();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [creatorName, setCreatorName] = useState("");
  const [creatorImage, setCreatorImage] = useState<string | null>(null);
  const [creatorBio, setCreatorBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [chatEnabled, setChatEnabled] = useState(true);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [ppvEnabled, setPpvEnabled] = useState(true);

  // Fetch settings for the selected creator
  const fetchSettings = useCallback(async () => {
    if (!selectedCreator.slug) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/settings?creator=${selectedCreator.slug}`);
      if (res.ok) {
        const data = await res.json();
        setCreatorName(data.creatorName || "");
        setCreatorImage(data.creatorImage);
        setCreatorBio(data.creatorBio || "");
        setInstagram(data.instagram || "");
        setTwitter(data.twitter || "");
        setTiktok(data.tiktok || "");
        setSiteName(data.siteName || "");
        setSiteDescription(data.siteDescription || "");
        setWelcomeMessage(data.welcomeMessage || "");
        setChatEnabled(data.chatEnabled ?? true);
        setTipsEnabled(data.tipsEnabled ?? true);
        setPpvEnabled(data.ppvEnabled ?? true);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCreator.slug]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("type", "profile");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedFile = data.files?.[0] || data;
        setCreatorImage(uploadedFile.url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorSlug: selectedCreator.slug,
          creatorName,
          creatorImage,
          creatorBio,
          instagram,
          twitter,
          tiktok,
          siteName,
          siteDescription,
          welcomeMessage,
          chatEnabled,
          tipsEnabled,
          ppvEnabled,
        }),
      });

      if (res.ok) {
        setSaved(true);
        // Refresh creators to update the sidebar
        await refreshCreators();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Settings
          </h1>
          <p className="text-[var(--muted)] mt-1">
            Settings for <span className="text-[var(--gold)]">{selectedCreator.displayName}</span>
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="luxury" className="p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--gold)]" />
                Creator Profile
              </h2>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-[var(--surface)] border-4 border-[var(--gold)]/30">
                      {creatorImage ? (
                        <img
                          src={creatorImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)]">
                          <User className="w-12 h-12 text-[var(--background)]" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[var(--gold)] hover:bg-[var(--gold-light)] flex items-center justify-center transition-colors shadow-lg"
                    >
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 text-[var(--background)] animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5 text-[var(--background)]" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    Profile photo for chat
                  </p>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Creator Name
                    </label>
                    <input
                      type="text"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]"
                      placeholder="Enter creator name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Bio
                    </label>
                    <textarea
                      value={creatorBio}
                      onChange={(e) => setCreatorBio(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)] resize-none"
                      placeholder="Your bio..."
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="luxury" className="p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--gold)]" />
                Social Links
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter / X
                  </label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    TikTok
                  </label>
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]"
                    placeholder="@username"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Site Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="luxury" className="p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--gold)]" />
                Site Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]"
                    placeholder="Enter site name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Site Description (SEO)
                  </label>
                  <textarea
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)] resize-none"
                    placeholder="Description for search engines..."
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Chat Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="luxury" className="p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[var(--gold)]" />
                Chat & Messages
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)] resize-none"
                    placeholder="Automatic message sent to new subscribers..."
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="luxury" className="p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <ToggleRight className="w-5 h-5 text-[var(--gold)]" />
                Features
              </h2>

              <div className="space-y-4">
                {/* Chat Toggle */}
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Chat</p>
                    <p className="text-sm text-[var(--muted)]">Allow subscribers to message this creator</p>
                  </div>
                  <button
                    onClick={() => setChatEnabled(!chatEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      chatEnabled ? "bg-[var(--gold)]" : "bg-[var(--border)]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
                        chatEnabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Tips Toggle */}
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Tips</p>
                    <p className="text-sm text-[var(--muted)]">Allow subscribers to send tips</p>
                  </div>
                  <button
                    onClick={() => setTipsEnabled(!tipsEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      tipsEnabled ? "bg-[var(--gold)]" : "bg-[var(--border)]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
                        tipsEnabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* PPV Toggle */}
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Pay-Per-View Messages</p>
                    <p className="text-sm text-[var(--muted)]">Allow sending paid content in chat</p>
                  </div>
                  <button
                    onClick={() => setPpvEnabled(!ppvEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      ppvEnabled ? "bg-[var(--gold)]" : "bg-[var(--border)]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
                        ppvEnabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end"
          >
            <Button
              variant="premium"
              size="lg"
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[200px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
