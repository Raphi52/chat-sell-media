"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Camera, Save, Loader2, User, Mail, Crown } from "lucide-react";
import { Button } from "@/components/ui";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
    if (session?.user?.image) {
      setPreviewImage(session.user.image);
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage({ type: "error", text: "Format invalide. Utilisez JPEG, PNG ou WebP." });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Fichier trop volumineux. Maximum 5MB." });
      return;
    }

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();

      if (name && name !== session?.user?.name) {
        formData.append("name", name);
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la sauvegarde");
      }

      const updatedUser = await response.json();

      // Update session
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          image: updatedUser.image,
        },
      });

      setSelectedFile(null);
      setMessage({ type: "success", text: "Profil mis à jour avec succès!" });
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erreur lors de la sauvegarde" });
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Paramètres</h1>
          <p className="text-[var(--muted)] mt-1">Gérez votre profil et vos préférences</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--gold)]" />
            Profil
          </h2>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--gold)]/30">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--gold)]/20 flex items-center justify-center">
                    <Crown className="w-12 h-12 text-[var(--gold)]" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-[var(--muted)] mt-3">
              Cliquez pour changer votre photo de profil
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50"
                placeholder="Votre nom"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <Mail className="w-5 h-5 text-[var(--muted)]" />
                <span className="text-[var(--muted)]">{session?.user?.email}</span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            {/* Role */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Rôle
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30">
                  <Crown className="w-5 h-5 text-[var(--gold)]" />
                  <span className="text-[var(--gold)] font-medium">Créateur</span>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 px-4 py-3 rounded-xl ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                  : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {/* Save Button */}
          <div className="mt-8">
            <Button
              variant="premium"
              onClick={handleSave}
              disabled={isSaving || (!selectedFile && name === session?.user?.name)}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
