import { motion } from "framer-motion";
import type { Nutrition } from "../../types/recipe.types";

const ITEMS: { key: keyof Nutrition; label: string; unit: string; color: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal", color: "text-accent" },
  { key: "protein", label: "Protein", unit: "g", color: "text-emerald-400" },
  { key: "carbs", label: "Carbs", unit: "g", color: "text-sky-400" },
  { key: "fat", label: "Fat", unit: "g", color: "text-amber-400" },
];

export default function NutritionCards({ nutrition }: { nutrition: Nutrition }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-white">Nutrition (per serving)</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-surface-2 p-4 text-center"
          >
            <p className={`text-xl font-semibold ${item.color}`}>{nutrition[item.key]}</p>
            <p className="mt-0.5 text-[11px] text-white/40">{item.unit}</p>
            <p className="mt-1 text-xs text-white/60">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
