import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SearchBar from "../components/search/SearchBar";
import RecipeLoading from "../components/loading/RecipeLoading";
import RecipeHeader from "../components/recipe/RecipeHeader";
import IngredientChecklist from "../components/recipe/IngredientChecklist";
import ServingSlider from "../components/recipe/ServingSlider";
import CookingSteps from "../components/recipe/CookingSteps";
import NutritionCards from "../components/recipe/NutritionCards";
import IngredientSwaps from "../components/recipe/IngredientSwaps";
import CookingTips from "../components/recipe/CookingTips";
import RelatedDishes from "../components/recipe/RelatedDishes";
import PreparedFeedback from "../components/recipe/PreparedFeedback";
import { useIngredientStore } from "../store/ingredientStore";
import { useRecipeStore } from "../store/recipeStore";
import { useAuthStore } from "../store/authStore";
import { useHistoryStore } from "../store/historyStore";
import type { Recipe } from "../types/recipe.types";
import {
  generateRecipe,
  generateRecipeByDish,
  RecipeServiceError,
} from "../services/recipe.service";
import { getSiblingVarieties } from "../data/exploreData";

export default function Workspace() {
  const { ingredients } = useIngredientStore();
  const { recipe, setRecipe, setError, sourceContext } = useRecipeStore();
  const user = useAuthStore((s) => s.user);
  const logDish = useHistoryStore((s) => s.logDish);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const recordHistory = (recipe: Recipe, ctx = sourceContext) => {
    if (user) logDish(user.email, recipe, ctx);
  };

  const handleRegenerate = async () => {
    if (ingredients.length === 0) return;
    setIsLoading(true);
    setLocalError(null);

    try {
      const next = await generateRecipe(ingredients);
      setRecipe(next);
      recordHistory(next, null);
    } catch (err) {
      if (err instanceof RecipeServiceError && err.code === "ABORTED") return;
      const message = err instanceof RecipeServiceError ? err.message : "Something went wrong.";
      setLocalError(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRelated = async (dishName: string) => {
    if (!sourceContext) return;
    setIsLoading(true);
    setLocalError(null);

    try {
      const next = await generateRecipeByDish(dishName, sourceContext.cuisineLabel);
      const nextContext = { ...sourceContext, varietyName: dishName };
      setRecipe(next, nextContext);
      recordHistory(next, nextContext);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof RecipeServiceError && err.code === "ABORTED") return;
      const message = err instanceof RecipeServiceError ? err.message : "Something went wrong.";
      setLocalError(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const relatedDishes = sourceContext
    ? getSiblingVarieties(
        sourceContext.cuisineId,
        sourceContext.regionId,
        sourceContext.groupId,
        sourceContext.varietyName
      ).slice(0, 6)
    : [];

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <div className="sticky top-[65px] z-30 border-b border-line/60 bg-ink/80 px-4 py-3 backdrop-blur-lg sm:px-6 sm:py-4">
        <div className="mx-auto max-w-3xl">
          <SearchBar onGenerate={handleRegenerate} isLoading={isLoading} />
          <AnimatePresence>
            {localError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-center text-sm text-rose-300"
                role="alert"
              >
                {localError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <main className="flex-1">
        {isLoading && !recipe && <RecipeLoading />}

        {!isLoading && !recipe && (
          <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
            <p className="text-lg text-white/60">No recipe yet — add some ingredients to get started.</p>
            <Link
              to="/"
              className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white"
            >
              <ArrowLeft size={14} /> Back to search
            </Link>
          </div>
        )}

        {recipe && (
          <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
            {isLoading && <RecipeLoading />}

            {!isLoading && (
              <>
                <RecipeHeader recipe={recipe} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <IngredientChecklist recipe={recipe} />
                  <ServingSlider />
                </div>
                <CookingSteps steps={recipe.steps} />
                <NutritionCards nutrition={recipe.nutrition} />
                <IngredientSwaps swaps={recipe.ingredientSwaps} />
                <CookingTips tips={recipe.tips} />

                {sourceContext && (
                  <RelatedDishes
                    dishes={relatedDishes}
                    currentDishName={sourceContext.varietyName}
                    onSelect={handleSelectRelated}
                  />
                )}

                <PreparedFeedback recipeTitle={recipe.title} />
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
