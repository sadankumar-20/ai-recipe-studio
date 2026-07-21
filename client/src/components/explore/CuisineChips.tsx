import { motion } from "framer-motion";
import type { Cuisine } from "../../data/exploreData";

interface CuisineChipsProps {
  cuisines: Cuisine[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export default function CuisineChips({ cuisines, activeId, onSelect }: CuisineChipsProps) {
  return (
    <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-xs uppercase tracking-wide text-white/30">Explore:</span>
      {cuisines.map((c, i) => (
        <motion.button
          key={c.id}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.05 }}
          whileHover={{ y: -2 }}
          onClick={() => onSelect(c.id)}
          aria-pressed={activeId === c.id}
          className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
            activeId === c.id
              ? "border-accent/60 bg-accent-soft/10 text-white"
              : "border-line bg-surface text-white/70 hover:border-accent/40 hover:text-white"
          }`}
        >
          <span className="mr-1.5">{c.emoji}</span>
          {c.label}
        </motion.button>
      ))}
    </div>
  );
}
