"use client";

import { motion } from "framer-motion";

interface TypingIndicatorProps {
  userName?: string;
  userAvatar?: string;
}

export function TypingIndicator({ userName, userAvatar }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-end gap-2"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--gold)]/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-black font-bold text-sm">
            {userName?.charAt(0) || "?"}
          </div>
        )}
      </div>

      {/* Typing bubble */}
      <motion.div
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{
              y: [0, -6, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Optional name label */}
      {userName && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500 ml-1"
        >
          {userName} is typing...
        </motion.span>
      )}
    </motion.div>
  );
}
