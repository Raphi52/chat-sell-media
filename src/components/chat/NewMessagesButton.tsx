"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface NewMessagesButtonProps {
  show: boolean;
  count?: number;
  onClick: () => void;
}

export function NewMessagesButton({ show, count, onClick }: NewMessagesButtonProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)] text-black font-medium text-sm shadow-lg shadow-[var(--gold)]/30"
        >
          <ChevronDown className="w-4 h-4" />
          <span>
            {count && count > 0
              ? `${count} new message${count > 1 ? "s" : ""}`
              : "New messages"}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
