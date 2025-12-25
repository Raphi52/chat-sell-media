import { NextRequest, NextResponse } from "next/server";
import { getCurrencyForCountry, currencies } from "@/lib/currency";

export async function GET(request: NextRequest) {
  try {
    // Get IP from headers (works with proxies/Cloudflare)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");

    const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";

    // Cloudflare provides country directly
    const cfCountry = request.headers.get("cf-ipcountry");

    let countryCode = cfCountry || "US";

    // If no Cloudflare, use free IP geolocation API
    if (!cfCountry && ip !== "unknown" && ip !== "127.0.0.1" && !ip.startsWith("192.168.")) {
      try {
        // Use ip-api.com (free, no API key needed, 45 requests/minute)
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
          next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.countryCode) {
            countryCode = geoData.countryCode;
          }
        }
      } catch (error) {
        console.error("Geo lookup failed:", error);
        // Fall back to USD
      }
    }

    const currency = getCurrencyForCountry(countryCode);

    return NextResponse.json({
      country: countryCode,
      currency: currency,
      ip: process.env.NODE_ENV === "development" ? ip : undefined,
    });
  } catch (error) {
    console.error("Geo API error:", error);
    return NextResponse.json({
      country: "US",
      currency: currencies.USD,
    });
  }
}
