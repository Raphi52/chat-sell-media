"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";

interface MediaItem {
  id: string;
  type: "PHOTO" | "VIDEO" | "AUDIO";
  url: string;
  previewUrl?: string;
}

interface MediaLightboxProps {
  isOpen: boolean;
  media: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
}

export function MediaLightbox({
  isOpen,
  media,
  initialIndex = 0,
  onClose,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef<number>(0);

  const currentMedia = media[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSwipeDirection("right");
      setCurrentIndex((prev) => prev - 1);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setSwipeDirection("left");
      setCurrentIndex((prev) => prev + 1);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentIndex, media.length]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  // Handle double tap to zoom
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap detected
      if (zoom > 1) {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      } else {
        setZoom(2);
      }
    }
    lastTap.current = now;
  }, [zoom]);

  // Handle swipe
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (zoom > 1) {
      // When zoomed, use drag for panning
      return;
    }

    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset > threshold || velocity > 500) {
      handlePrev();
    } else if (offset < -threshold || velocity < -500) {
      handleNext();
    }
  }, [zoom, handlePrev, handleNext]);

  // Handle vertical swipe to close
  const handleVerticalDragEnd = useCallback((_: any, info: PanInfo) => {
    if (zoom > 1) return;

    const threshold = 150;
    if (Math.abs(info.offset.y) > threshold) {
      onClose();
    }
  }, [zoom, onClose]);

  const handleDownload = async () => {
    if (!currentMedia) return;

    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `media-${currentMedia.id}.${currentMedia.type === "VIDEO" ? "mp4" : "jpg"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Reset index when media changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, media]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!currentMedia) return null;

  const slideVariants = {
    enter: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? 300 : direction === "right" ? -300 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? -300 : direction === "right" ? 300 : 0,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex flex-col touch-none"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between px-4 py-3 border-b border-white/10 safe-top"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 active:bg-white/10 text-white transition-colors touch-manipulation"
              >
                <X className="w-6 h-6" />
              </button>
              <span className="text-white/60 text-sm">
                {currentIndex + 1} / {media.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentMedia.type === "PHOTO" && (
                <>
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    className="p-2 rounded-full hover:bg-white/10 active:bg-white/10 text-white transition-colors disabled:opacity-50 touch-manipulation"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-white/60 text-sm min-w-[3rem] text-center hidden md:block">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-2 rounded-full hover:bg-white/10 active:bg-white/10 text-white transition-colors disabled:opacity-50 touch-manipulation"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={handleDownload}
                className="p-2 rounded-full hover:bg-white/10 active:bg-white/10 text-white transition-colors touch-manipulation"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {/* Navigation arrows (desktop) */}
            {media.length > 1 && (
              <>
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: currentIndex > 0 ? 1 : 0.3 }}
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="absolute left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors hidden md:block disabled:opacity-30"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: currentIndex < media.length - 1 ? 1 : 0.3 }}
                  onClick={handleNext}
                  disabled={currentIndex === media.length - 1}
                  className="absolute right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors hidden md:block disabled:opacity-30"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </>
            )}

            {/* Media content with swipe support */}
            <AnimatePresence mode="wait" custom={swipeDirection}>
              <motion.div
                key={currentMedia.id}
                custom={swipeDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={zoom === 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                onClick={handleDoubleTap}
                className="w-full h-full flex items-center justify-center px-4"
              >
                <motion.div
                  className="relative max-w-[90vw] max-h-[70vh] md:max-h-[80vh]"
                  style={{
                    scale: zoom,
                    x: position.x,
                    y: position.y,
                  }}
                  drag={zoom > 1}
                  dragConstraints={containerRef}
                  dragElastic={0}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                >
                  {currentMedia.type === "VIDEO" ? (
                    <video
                      src={currentMedia.url}
                      controls
                      autoPlay
                      playsInline
                      className="max-w-full max-h-[70vh] md:max-h-[80vh] rounded-lg"
                    />
                  ) : (
                    <img
                      src={currentMedia.url}
                      alt=""
                      className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain rounded-lg select-none"
                      draggable={false}
                    />
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Swipe hint (mobile) */}
            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/40 text-xs md:hidden">
                <ChevronLeft className="w-4 h-4" />
                <span>Swipe to navigate</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {media.length > 1 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center justify-center gap-2 px-4 py-3 border-t border-white/10 safe-bottom overflow-x-auto scrollbar-hide"
            >
              {media.map((item, index) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSwipeDirection(index > currentIndex ? "left" : "right");
                    setCurrentIndex(index);
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 transition-colors touch-manipulation ${
                    index === currentIndex
                      ? "border-[var(--gold)]"
                      : "border-transparent hover:border-white/30"
                  }`}
                >
                  <img
                    src={item.previewUrl || item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
