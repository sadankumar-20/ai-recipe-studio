import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import FeatureCards from "../components/landing/FeatureCards";
import SearchBar from "../components/search/SearchBar";
import CuisineExplorer from "../components/explore/CuisineExplorer";
import { useIngredientStore } from "../store/ingredientStore";
import { useRecipeStore } from "../store/recipeStore";
import { useAuthStore } from "../store/authStore";
import { useHistoryStore } from "../store/historyStore";
import type { RecipeSourceContext } from "../store/recipeStore";
import type { Recipe } from "../types/recipe.types";
import {
  generateRecipe,
  generateRecipeByDish,
  RecipeServiceError,
} from "../services/recipe.service";

export default function Landing() {
  const navigate = useNavigate();
  const { ingredients } = useIngredientStore();
  const { setRecipe, setStatus, setError } = useRecipeStore();
  const user = useAuthStore((s) => s.user);
  const logDish = useHistoryStore((s) => s.logDish);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const recordHistory = (recipe: Recipe, sourceContext?: RecipeSourceContext | null) => {
    if (user) logDish(user.email, recipe, sourceContext);
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setIsLoading(true);
    setLocalError(null);
    setStatus("loading");

    try {
      const recipe = await generateRecipe(ingredients);
      setRecipe(recipe);
      recordHistory(recipe);
      navigate("/workspace");
    } catch (err) {
      if (err instanceof RecipeServiceError && err.code === "ABORTED") return;
      const message = err instanceof RecipeServiceError ? err.message : "Something went wrong.";
      setLocalError(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDish = async (params: {
    dishName: string;
    cuisineId: string;
    cuisineLabel: string;
    regionId: string;
    groupId: string;
  }) => {
    setIsLoading(true);
    setLocalError(null);
    setStatus("loading");

    try {
      const recipe = await generateRecipeByDish(params.dishName, params.cuisineLabel);
      setRecipe(recipe, {
        cuisineId: params.cuisineId,
        regionId: params.regionId,
        groupId: params.groupId,
        cuisineLabel: params.cuisineLabel,
        varietyName: params.dishName,
      });
      recordHistory(recipe, {
        cuisineId: params.cuisineId,
        regionId: params.regionId,
        groupId: params.groupId,
        cuisineLabel: params.cuisineLabel,
        varietyName: params.dishName,
      });
      navigate("/workspace");
    } catch (err) {
      if (err instanceof RecipeServiceError && err.code === "ABORTED") return;
      const message = err instanceof RecipeServiceError ? err.message : "Something went wrong.";
      setLocalError(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Living background collage — fades in once, then sits as a soft
          ambient backdrop behind the hero. */}
      <motion.div
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 0.14, scale: 1 }}
        transition={{ duration: 2.4, ease: "easeOut" }}
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-cover bg-center"
        style={{ backgroundImage: "url(/images/food-collage.jpg)" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-gradient-to-b from-transparent via-ink/60 to-ink" />

      <Navbar />

      <main className="flex-1">
        <Hero />

        <section className="mx-auto -mt-4 max-w-2xl px-4 sm:px-6">
          <SearchBar onGenerate={handleGenerate} isLoading={isLoading} autoFocus />

          <AnimatePresence>
            {localError && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-300"
                role="alert"
              >
                {localError}
              </motion.p>
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm text-white/40"
            >
              Cooking up your recipe...
            </motion.p>
          )}
        </section>

        <section className="px-4 sm:px-6">
          <CuisineExplorer onSelectDish={handleSelectDish} />
        </section>

        <FeatureCards />
      </main>

      <Footer />
    </div>
  );
}
