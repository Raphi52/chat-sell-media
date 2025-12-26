import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// Check admin auth
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

// GET /api/admin/settings?creator=slug - Get settings for a creator
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const creatorSlug = searchParams.get("creator");

    if (!creatorSlug) {
      return NextResponse.json({ error: "Creator slug required" }, { status: 400 });
    }

    // Get creator info
    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Get or create settings for this creator
    let settings = await prisma.siteSettings.findUnique({
      where: { creatorSlug },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          creatorSlug,
          siteName: creator.displayName,
        },
      });
    }

    // Combine creator info with settings
    const response = {
      // From Creator model
      creatorName: creator.displayName,
      creatorImage: creator.avatar,
      creatorBio: creator.bio,
      instagram: JSON.parse(creator.socialLinks || "{}").instagram || null,
      twitter: JSON.parse(creator.socialLinks || "{}").twitter || null,
      tiktok: JSON.parse(creator.socialLinks || "{}").tiktok || null,
      // From SiteSettings model
      ...settings,
      pricing: JSON.parse(settings.pricing || "{}"),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update settings for a creator
export async function PUT(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      creatorSlug,
      // Creator fields
      creatorName,
      creatorImage,
      creatorBio,
      instagram,
      twitter,
      tiktok,
      // Site settings fields
      siteName,
      siteDescription,
      welcomeMessage,
      primaryColor,
      accentColor,
      pricing,
      chatEnabled,
      tipsEnabled,
      ppvEnabled,
    } = body;

    if (!creatorSlug) {
      return NextResponse.json({ error: "Creator slug required" }, { status: 400 });
    }

    // Update creator info
    const socialLinks = JSON.stringify({
      instagram: instagram || null,
      twitter: twitter || null,
      tiktok: tiktok || null,
    });

    await prisma.creator.update({
      where: { slug: creatorSlug },
      data: {
        displayName: creatorName,
        name: creatorName,
        avatar: creatorImage,
        bio: creatorBio,
        socialLinks,
      },
    });

    // Update or create site settings
    const settings = await prisma.siteSettings.upsert({
      where: { creatorSlug },
      update: {
        siteName,
        siteDescription,
        welcomeMessage,
        primaryColor,
        accentColor,
        pricing: pricing ? JSON.stringify(pricing) : undefined,
        chatEnabled,
        tipsEnabled,
        ppvEnabled,
      },
      create: {
        creatorSlug,
        siteName,
        siteDescription,
        welcomeMessage,
        primaryColor,
        accentColor,
        pricing: pricing ? JSON.stringify(pricing) : "{}",
        chatEnabled: chatEnabled ?? true,
        tipsEnabled: tipsEnabled ?? true,
        ppvEnabled: ppvEnabled ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        pricing: JSON.parse(settings.pricing || "{}"),
      },
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
