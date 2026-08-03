import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { IngredientSwap } from "../../types/recipe.types";

export default function IngredientSwaps({ swaps }: { swaps: IngredientSwap[] }) {
  if (swaps.length === 0) return null;

  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-white">Ingredient Swaps</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {swaps.map((swap, i) => (
          <motion.div
            key={`${swap.original}-${swap.substitute}`}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl bg-surface-2 p-4"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/50">No {swap.original}?</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[15px] font-medium text-white">
              <ArrowRight size={14} className="text-accent" />
              Use {swap.substitute}
            </div>
            {swap.reason && <p className="mt-2 text-xs text-white/40">{swap.reason}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
