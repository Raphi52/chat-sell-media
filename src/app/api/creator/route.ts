import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/creator - Get public creator profile (for chat and display)
// Optionally accepts ?slug=xxx to get specific creator
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // If specific slug provided, get that creator
    if (slug) {
      const creator = await prisma.creator.findUnique({
        where: { slug },
      });

      if (!creator) {
        return NextResponse.json(
          { error: "Creator not found" },
          { status: 404 }
        );
      }

      const socialLinks = JSON.parse(creator.socialLinks || "{}");

      return NextResponse.json({
        name: creator.displayName,
        image: creator.avatar,
        bio: creator.bio,
        instagram: socialLinks.instagram || null,
        twitter: socialLinks.twitter || null,
        tiktok: socialLinks.tiktok || null,
      });
    }

    // Otherwise, get the first/default creator
    const creator = await prisma.creator.findFirst({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (!creator) {
      // Return empty profile if no creator exists yet
      return NextResponse.json({
        name: "Creator",
        image: null,
        bio: null,
        instagram: null,
        twitter: null,
        tiktok: null,
      });
    }

    const socialLinks = JSON.parse(creator.socialLinks || "{}");

    return NextResponse.json({
      name: creator.displayName,
      image: creator.avatar,
      bio: creator.bio,
      instagram: socialLinks.instagram || null,
      twitter: socialLinks.twitter || null,
      tiktok: socialLinks.tiktok || null,
    });
  } catch (error) {
    console.error("Error fetching creator profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch creator profile" },
      { status: 500 }
    );
  }
}
