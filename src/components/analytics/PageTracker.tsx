"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Don't track the same page twice in a row
    if (pathname === lastTrackedPath.current) return;

    // Don't track API routes or admin pages (optional)
    if (pathname.startsWith("/api")) return;

    const trackPageView = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
          }),
        });
        lastTrackedPath.current = pathname;
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug("Failed to track page view:", error);
      }
    };

    trackPageView();
  }, [pathname]);

  return null;
}
