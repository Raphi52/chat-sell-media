import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const creators = [
  {
    slug: "miacosta",
    name: "Mia Costa",
    displayName: "Mia Costa",
    avatar: "/media/preview/3039035234726006678_1.jpg",
    coverImage: "/media/preview/3036738115692549406_1.jpg",
    bio: "Welcome to my exclusive content. Join my VIP for the full experience.",
    socialLinks: JSON.stringify({
      instagram: "https://instagram.com/miacosta",
      twitter: "https://twitter.com/miacosta",
    }),
    photoCount: 450,
    videoCount: 25,
    subscriberCount: 2500,
  },
  {
    slug: "emmarose",
    name: "Emma Rose",
    displayName: "Emma Rose",
    avatar: "/media/preview/2885347102581834996_1.jpg",
    coverImage: "/media/preview/2872307818983487894_1.jpg",
    bio: "Hey loves! I'm Emma, your favorite girl next door. Subscribe for daily exclusive content and personal chats.",
    socialLinks: JSON.stringify({
      instagram: "https://instagram.com/emmarose",
      twitter: "https://twitter.com/emmarose",
      tiktok: "https://tiktok.com/@emmarose",
    }),
    photoCount: 320,
    videoCount: 18,
    subscriberCount: 1800,
  },
];

async function main() {
  console.log("Seeding creators...");

  for (const creator of creators) {
    const existing = await prisma.creator.findUnique({
      where: { slug: creator.slug },
    });

    if (existing) {
      console.log(`Creator ${creator.slug} already exists, updating...`);
      await prisma.creator.update({
        where: { slug: creator.slug },
        data: creator,
      });
    } else {
      console.log(`Creating creator ${creator.slug}...`);
      await prisma.creator.create({
        data: creator,
      });
    }
  }

  console.log("Done seeding creators!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
