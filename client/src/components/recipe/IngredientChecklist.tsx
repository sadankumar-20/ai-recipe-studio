import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Recipe } from "../../types/recipe.types";
import { useRecipeStore } from "../../store/recipeStore";
import { scaleQuantity } from "../../utils/scale";

/** Avoids awkward renders like "0 to taste" for non-measurable ingredients. */
function formatAmount(quantity: number | string, unit: string, servings: number, targetServings: number): string {
  const scaled = scaleQuantity(quantity, servings, targetServings);
  if (typeof quantity === "number" && quantity === 0) {
    return unit || "to taste";
  }
  return unit ? `${scaled} ${unit}` : scaled;
}

export default function IngredientChecklist({ recipe }: { recipe: Recipe }) {
  const { servings, checkedIngredients, toggleIngredientChecked } = useRecipeStore();
  const total = recipe.ingredients.length;
  const done = recipe.ingredients.filter((i) => checkedIngredients[i.name]).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-white">Ingredients</h2>
        <span className="text-xs text-white/40">{done}/{total} ready</span>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full bg-accent"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>

      <ul className="space-y-1">
        {recipe.ingredients.map((ing) => {
          const checked = !!checkedIngredients[ing.name];
          return (
            <li key={ing.name}>
              <button
                type="button"
                onClick={() => toggleIngredientChecked(ing.name)}
                className="focus-ring flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    checked ? "border-accent bg-accent text-black" : "border-white/20"
                  }`}
                >
                  {checked && <Check size={13} strokeWidth={3} />}
                </span>
                <span className={`flex-1 text-sm ${checked ? "text-white/35 line-through" : "text-white/85"}`}>
                  {ing.name}
                  {ing.optional && <span className="ml-1.5 text-xs text-white/30">(optional)</span>}
                </span>
                <span className="shrink-0 text-xs text-white/40">
                  {formatAmount(ing.quantity, ing.unit, recipe.servings, servings)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
