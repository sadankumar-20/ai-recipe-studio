import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Region } from "../../data/exploreData";
import FoodImage from "../common/FoodImage";

interface RegionBoxProps {
  region: Region;
  index: number;
  onSelect: () => void;
}

export default function RegionBox({ region, index, onSelect }: RegionBoxProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="focus-ring flex flex-col items-start overflow-hidden rounded-3xl border border-line bg-surface text-left transition-colors hover:border-accent/40"
    >
      <FoodImage
        query={`${region.name} food`}
        alt={region.name}
        fallbackEmoji={region.emoji}
        className="h-32 w-full"
      />
      <div className="p-6">
        <h3 className="text-[15px] font-semibold text-white">{region.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/50">{region.description}</p>
        <span className="mt-4 flex items-center gap-1 text-xs font-medium text-accent">
          Explore <ChevronRight size={13} />
        </span>
      </div>
    </motion.button>
  );
}
