"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface Creator {
  id?: string;
  slug: string;
  name: string;
  displayName: string;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  theme?: {
    primaryColor?: string;
    accentColor?: string;
  };
  stats?: {
    photos: number;
    videos: number;
    subscribers: number;
  };
  isActive?: boolean;
}

interface AdminCreatorContextType {
  selectedCreator: Creator;
  setSelectedCreator: (creator: Creator) => void;
  creators: Creator[];
  isLoading: boolean;
  refreshCreators: () => Promise<void>;
}

const AdminCreatorContext = createContext<AdminCreatorContextType | undefined>(undefined);

export function AdminCreatorProvider({ children }: { children: ReactNode }) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreatorState] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch creators from API
  const fetchCreators = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/creators");
      if (res.ok) {
        const data = await res.json();
        const fetchedCreators = data.creators || [];
        setCreators(fetchedCreators);
        return fetchedCreators as Creator[];
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
    }

    // Return empty array if API fails - no fallback to hardcoded
    setCreators([]);
    return [] as Creator[];
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const fetchedCreators = await fetchCreators();

      // Restore selected creator from localStorage
      const saved = localStorage.getItem("admin-selected-creator");
      if (saved && fetchedCreators.length > 0) {
        const creator = fetchedCreators.find((c) => c.slug === saved);
        if (creator) {
          setSelectedCreatorState(creator);
        } else {
          setSelectedCreatorState(fetchedCreators[0]);
        }
      } else if (fetchedCreators.length > 0) {
        setSelectedCreatorState(fetchedCreators[0]);
      }
      // If no creators, selectedCreator stays null - will redirect to /admin/creators

      setIsLoading(false);
    };

    init();
  }, [fetchCreators]);

  const handleSetCreator = useCallback((creator: Creator) => {
    setSelectedCreatorState(creator);
    localStorage.setItem("admin-selected-creator", creator.slug);
  }, []);

  const refreshCreators = useCallback(async () => {
    const fetchedCreators = await fetchCreators();

    // Update selected creator if it still exists
    if (selectedCreator) {
      const updated = fetchedCreators.find((c) => c.slug === selectedCreator.slug);
      if (updated) {
        setSelectedCreatorState(updated);
      } else if (fetchedCreators.length > 0) {
        setSelectedCreatorState(fetchedCreators[0]);
        localStorage.setItem("admin-selected-creator", fetchedCreators[0].slug);
      }
    }
  }, [fetchCreators, selectedCreator]);

  // Placeholder creator when none exists (for UI stability)
  const placeholderCreator: Creator = {
    slug: "",
    name: "No Creator",
    displayName: "No Creator Selected",
    avatar: null,
    coverImage: null,
    bio: null,
    stats: { photos: 0, videos: 0, subscribers: 0 },
  };

  // Use selected creator, or placeholder if none
  const effectiveCreator = selectedCreator || placeholderCreator;

  return (
    <AdminCreatorContext.Provider
      value={{
        selectedCreator: effectiveCreator,
        setSelectedCreator: handleSetCreator,
        creators,
        isLoading,
        refreshCreators,
      }}
    >
      {children}
    </AdminCreatorContext.Provider>
  );
}

export function useAdminCreator() {
  const context = useContext(AdminCreatorContext);
  if (!context) {
    throw new Error("useAdminCreator must be used within AdminCreatorProvider");
  }
  return context;
}
