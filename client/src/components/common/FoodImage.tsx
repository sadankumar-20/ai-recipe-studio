import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchFoodImage } from "../../services/image.service";
import { findDishImageOverride } from "../../data/dishImageOverrides";

interface FoodImageProps {
  query: string;
  alt: string;
  className?: string;
  fallbackEmoji?: string;
}

/**
 * Shows a real food photo for the given dish/region. Checks a curated local
 * override first (for dishes where stock-photo search is unreliable, e.g.
 * "Pongal" pulling festival photos instead of the food), then falls back to
 * the backend's Pexels proxy. Falls back to an emoji-on-gradient tile if
 * both are unavailable, so layout never jumps or breaks.
 */
export default function FoodImage({ query, alt, className = "", fallbackEmoji = "🍽️" }: FoodImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setUrl(null);

    const override = findDishImageOverride(alt) ?? findDishImageOverride(query);
    if (override) {
      setUrl(override);
      setStatus("ready");
      return;
    }

    fetchFoodImage(query).then((result) => {
      if (cancelled) return;
      if (result) {
        setUrl(result);
        setStatus("ready");
      } else {
        setStatus("empty");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [query, alt]);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-accent/25 via-surface-2 to-surface-2 ${className}`}>
      {status !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {fallbackEmoji}
        </div>
      )}
      {url && (
        <motion.img
          key={url}
          src={url}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: status === "ready" ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
}
