import { motion } from "framer-motion";
import { POPULAR_SEARCHES } from "../../constants";
import { useIngredientStore } from "../../store/ingredientStore";

interface PopularSearchesProps {
  onPick?: () => void;
}

export default function PopularSearches({ onPick }: PopularSearchesProps) {
  const addMany = useIngredientStore((s) => s.addMany);

  return (
    <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-xs uppercase tracking-wide text-white/30">Try:</span>
      {POPULAR_SEARCHES.map((item, i) => (
        <motion.button
          key={item.label}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.05 }}
          whileHover={{ y: -2 }}
          onClick={() => {
            addMany(item.ingredients);
            onPick?.();
          }}
          className="focus-ring rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-white/70 transition-colors hover:border-accent/40 hover:text-white"
        >
          {item.label}
        </motion.button>
      ))}
    </div>
  );
}
