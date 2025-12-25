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
  | "vip";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--surface)] text-[var(--foreground-secondary)] border border-[var(--border)]",
  success:
    "bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success)]/30",
  warning:
    "bg-[var(--warning-muted)] text-[var(--warning)] border border-[var(--warning)]/30",
  error:
    "bg-[var(--error-muted)] text-[var(--error)] border border-[var(--error)]/30",
  info:
    "bg-[var(--info-muted)] text-[var(--info)] border border-[var(--info)]/30",
  premium:
    "badge-premium",
  photo:
    "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  video:
    "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  audio:
    "bg-green-500/20 text-green-400 border border-green-500/30",
  new:
    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  vip:
    "bg-gradient-to-r from-[var(--gold-dark)]/30 to-[var(--gold)]/30 text-[var(--gold-light)] border border-[var(--gold)]/50",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
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
