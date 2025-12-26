// Creators configuration
export interface Creator {
  slug: string;
  name: string;
  displayName: string;
  avatar: string;
  coverImage: string;
  bio: string;
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
}

// For now, hardcoded creators - later can be moved to database
export const creators: Record<string, Creator> = {
  miacosta: {
    slug: "miacosta",
    name: "Mia Costa",
    displayName: "Mia Costa",
    avatar: "/media/preview/3039035234726006678_1.jpg",
    coverImage: "/media/preview/3036738115692549406_1.jpg",
    bio: "Welcome to my exclusive content. Join my VIP for the full experience.",
    socialLinks: {
      instagram: "https://instagram.com/miacosta",
      twitter: "https://twitter.com/miacosta",
    },
    stats: {
      photos: 450,
      videos: 25,
      subscribers: 2500,
    },
  },
  emmarose: {
    slug: "emmarose",
    name: "Emma Rose",
    displayName: "Emma Rose",
    avatar: "/media/preview/2885347102581834996_1.jpg",
    coverImage: "/media/preview/2872307818983487894_1.jpg",
    bio: "Hey loves! I'm Emma, your favorite girl next door. Subscribe for daily exclusive content and personal chats.",
    socialLinks: {
      instagram: "https://instagram.com/emmarose",
      twitter: "https://twitter.com/emmarose",
      tiktok: "https://tiktok.com/@emmarose",
    },
    stats: {
      photos: 320,
      videos: 18,
      subscribers: 1800,
    },
  },
};

export function getCreator(slug: string): Creator | undefined {
  return creators[slug.toLowerCase()];
}

export function getAllCreators(): Creator[] {
  return Object.values(creators);
}

export function getAllCreatorSlugs(): string[] {
  return Object.keys(creators);
}

export function getDefaultCreator(): Creator {
  return creators.miacosta;
}
