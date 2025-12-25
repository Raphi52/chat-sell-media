import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Admin password - in production, use environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Raph-Max69";

// Simple token generation
function generateToken(): string {
  return Buffer.from(Date.now().toString() + Math.random().toString()).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      const token = generateToken();

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  return NextResponse.json({ success: true });
}

export async function GET() {
  // Check if admin is logged in
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");

  return NextResponse.json({ isAdmin: !!token?.value });
}
