"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  position?: "top" | "bottom";
  align?: "left" | "right" | "center";
}

export function EmojiPicker({
  isOpen,
  onClose,
  onSelect,
  position = "top",
  align = "right"
}: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll on mobile when open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  const getPositionClasses = () => {
    if (isMobile) return "";

    const positionClass = position === "top" ? "bottom-full mb-2" : "top-full mt-2";
    const alignClass =
      align === "left" ? "left-0" :
      align === "right" ? "right-0" :
      "left-1/2 -translate-x-1/2";

    return `absolute ${positionClass} ${alignClass}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile: Full screen backdrop */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={onClose}
            />
          )}

          <motion.div
            ref={pickerRef}
            initial={isMobile
              ? { y: "100%", opacity: 1 }
              : { opacity: 0, scale: 0.9, y: position === "top" ? 10 : -10 }
            }
            animate={isMobile
              ? { y: 0, opacity: 1 }
              : { opacity: 1, scale: 1, y: 0 }
            }
            exit={isMobile
              ? { y: "100%", opacity: 1 }
              : { opacity: 0, scale: 0.9, y: position === "top" ? 10 : -10 }
            }
            transition={isMobile
              ? { type: "spring", damping: 25, stiffness: 300 }
              : { duration: 0.2 }
            }
            className={isMobile
              ? "fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl overflow-hidden pb-safe"
              : `${getPositionClasses()} z-50`
            }
          >
            {/* Mobile handle */}
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
            )}

            <div className={`${isMobile ? "" : "rounded-xl"} overflow-hidden shadow-2xl border border-white/10`}>
              <Picker
                data={data}
                onEmojiSelect={(emoji: { native: string }) => {
                  onSelect(emoji.native);
                  onClose();
                }}
                theme="dark"
                previewPosition="none"
                skinTonePosition="none"
                navPosition="bottom"
                perLine={isMobile ? 8 : 9}
                maxFrequentRows={2}
                emojiButtonSize={isMobile ? 44 : 36}
                emojiSize={isMobile ? 28 : 22}
                set="native"
                dynamicWidth={isMobile}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
