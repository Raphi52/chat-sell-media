import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Parse user agent for device/browser info
function parseUserAgent(ua: string | null) {
  if (!ua) return { device: "unknown", browser: "unknown", os: "unknown" };

  // Device detection
  let device = "desktop";
  if (/mobile/i.test(ua)) device = "mobile";
  else if (/tablet|ipad/i.test(ua)) device = "tablet";

  // Browser detection
  let browser = "unknown";
  if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edge|edg/i.test(ua)) browser = "Edge";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  // OS detection
  let os = "unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

// Generate a random visitor ID
function generateVisitorId() {
  return `v_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Generate a session ID
function generateSessionId() {
  return `s_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// POST /api/analytics/track - Track a page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer } = body;

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    // Get or create visitor ID from cookies
    const cookieStore = await cookies();
    let visitorId = cookieStore.get("visitor_id")?.value;
    let sessionId = cookieStore.get("session_id")?.value;

    const response = NextResponse.json({ success: true });

    if (!visitorId) {
      visitorId = generateVisitorId();
      response.cookies.set("visitor_id", visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    if (!sessionId) {
      sessionId = generateSessionId();
      response.cookies.set("session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 60, // 30 minutes
      });
    }

    // Get user ID if logged in
    const session = await auth();
    const userId = session?.user?.id || null;

    // Parse user agent
    const userAgent = request.headers.get("user-agent");
    const { device, browser, os } = parseUserAgent(userAgent);

    // Create page view record
    await prisma.pageView.create({
      data: {
        path,
        referrer: referrer || null,
        visitorId,
        userId,
        userAgent,
        device,
        browser,
        os,
        sessionId,
      },
    });

    return response;
  } catch (error) {
    console.error("Error tracking page view:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
