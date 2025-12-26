"use client";

import { motion } from "framer-motion";

interface DateSeparatorProps {
  date: Date;
}

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) {
    return "Today";
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else if (now.getTime() - messageDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // Within last 7 days - show day name
    return date.toLocaleDateString(undefined, { weekday: "long" });
  } else if (now.getFullYear() === date.getFullYear()) {
    // Same year - show month and day
    return date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  } else {
    // Different year - show full date
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center py-4"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="px-4 py-1.5 rounded-full bg-[#1a1a1a] border border-white/10 text-xs font-medium text-gray-400 shadow-lg"
        >
          {formatDateLabel(date)}
        </motion.span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </motion.div>
  );
}
