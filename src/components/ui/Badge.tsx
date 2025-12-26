"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "premium"
  | "photo"
  | "video"
  | "audio"
  | "new"
  | "vip"
  | "price"
  | "duration"
  | "free"
  | "basic"
  | "purchased";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-black/70 text-white border border-white/20 backdrop-blur-sm shadow-lg",
  success:
    "bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/30",
  warning:
    "bg-amber-500 text-black border-0 shadow-lg shadow-amber-500/30",
  error:
    "bg-red-500 text-white border-0 shadow-lg shadow-red-500/30",
  info:
    "bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/30",
  premium:
    "bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-semibold border-0 shadow-lg shadow-[#D4AF37]/40",
  photo:
    "bg-blue-600 text-white border-0 shadow-lg shadow-blue-600/30",
  video:
    "bg-purple-600 text-white border-0 shadow-lg shadow-purple-600/30",
  audio:
    "bg-green-600 text-white border-0 shadow-lg shadow-green-600/30",
  new:
    "bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/30 animate-pulse",
  vip:
    "bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-semibold border-0 shadow-lg shadow-[#D4AF37]/40",
  price:
    "bg-emerald-500 text-white font-bold border-0 shadow-lg shadow-emerald-500/30",
  duration:
    "bg-black/80 text-white border border-white/10 backdrop-blur-sm shadow-lg",
  free:
    "bg-emerald-500 text-white font-semibold border-0 shadow-lg shadow-emerald-500/30",
  basic:
    "bg-blue-500 text-white font-semibold border-0 shadow-lg shadow-blue-500/30",
  purchased:
    "bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/30",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
