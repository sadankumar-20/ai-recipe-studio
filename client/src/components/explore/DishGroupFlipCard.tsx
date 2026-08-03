import { motion } from "framer-motion";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { DishGroup } from "../../data/exploreData";
import FoodImage from "../common/FoodImage";

interface DishGroupFlipCardProps {
  group: DishGroup;
  onSelectVariety: (varietyName: string) => void;
}

export default function DishGroupFlipCard({ group, onSelectVariety }: DishGroupFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="[perspective:1400px]">
      <motion.div
        className="relative h-64 w-full [transform-style:preserve-3d]"
        animate={{ rotateX: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front */}
        <button
          type="button"
          onClick={() => setIsFlipped(true)}
          aria-label={`${group.name}. Click to see varieties.`}
          className="focus-ring absolute inset-0 overflow-hidden rounded-3xl border border-line bg-surface [backface-visibility:hidden]"
        >
          <FoodImage
            query={group.imageQuery ?? `${group.name} food`}
            alt={group.name}
            fallbackEmoji={group.emoji}
            className="h-full w-full"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 text-left">
            <h3 className="text-[15px] font-semibold text-white">{group.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/70">{group.description}</p>
            <span className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent">
              <RotateCcw size={12} /> Tap to see varieties
            </span>
          </div>
        </button>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col rounded-3xl border border-accent/40 bg-accent-soft/5 p-5 [backface-visibility:hidden] [transform:rotateX(180deg)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-accent">
              {group.name}
            </span>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              aria-label="Flip back"
              className="focus-ring rounded-full p-1 text-white/40 hover:text-white"
            >
              <RotateCcw size={13} />
            </button>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {group.varieties.map((v) => (
              <button
                key={v.name}
                type="button"
                onClick={() => onSelectVariety(v.name)}
                className="focus-ring block w-full rounded-xl px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
