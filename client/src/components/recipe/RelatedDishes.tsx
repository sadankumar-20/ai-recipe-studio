import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface RelatedDishesProps {
  dishes: string[];
  currentDishName: string;
  onSelect: (dishName: string) => void;
}

export default function RelatedDishes({ dishes, currentDishName, onSelect }: RelatedDishesProps) {
  if (dishes.length === 0) return null;

  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-white">
        <Sparkles size={15} className="text-accent" /> Because you liked {currentDishName}
      </h2>
      <p className="mb-4 text-sm text-white/40">Try one of these next.</p>
      <div className="flex flex-wrap gap-2">
        {dishes.map((dish, i) => (
          <motion.button
            key={dish}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(dish)}
            className="focus-ring rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-white/75 transition-colors hover:border-accent/40 hover:text-white"
          >
            {dish}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
