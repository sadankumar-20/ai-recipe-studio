import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface SuggestionsDropdownProps {
  suggestions: string[];
  activeIndex: number;
  onSelect: (item: string) => void;
}

export default function SuggestionsDropdown({
  suggestions,
  activeIndex,
  onSelect,
}: SuggestionsDropdownProps) {
  return (
    <AnimatePresence>
      {suggestions.length > 0 && (
        <motion.ul
          role="listbox"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        >
          {suggestions.map((item, i) => (
            <li key={item} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(item)}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm capitalize transition-colors ${
                  i === activeIndex ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                }`}
              >
                <Plus size={14} className="text-accent" />
                {item}
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
