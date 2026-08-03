import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import type { Recipe } from "../../types/recipe.types";
import Badge from "../ui/Badge";
import FoodImage from "../common/FoodImage";

const difficultyTone: Record<Recipe["difficulty"], "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

export default function RecipeHeader({ recipe }: { recipe: Recipe }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-3xl border border-line bg-surface"
    >
      <FoodImage query={recipe.title} alt={recipe.title} fallbackEmoji="🍽️" className="h-40 w-full sm:h-56" />

      <div className="p-6 sm:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={difficultyTone[recipe.difficulty]}>{recipe.difficulty}</Badge>
          <Badge>
            <Clock size={12} /> {recipe.cookTime} min
          </Badge>
          <Badge>
            <Users size={12} /> {recipe.servings} servings
          </Badge>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {recipe.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/55">
          {recipe.description}
        </p>
      </div>
    </motion.div>
  );
}
