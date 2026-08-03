import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Recipe, RequestStatus } from "../types/recipe.types";

export interface RecipeSourceContext {
  cuisineId: string;
  regionId: string;
  groupId: string;
  cuisineLabel: string;
  varietyName: string;
}

interface RecipeState {
  recipe: Recipe | null;
  status: RequestStatus;
  error: string | null;
  servings: number;
  checkedIngredients: Record<string, boolean>;
  sourceContext: RecipeSourceContext | null;
  isPrepared: boolean;
  setRecipe: (recipe: Recipe, sourceContext?: RecipeSourceContext | null) => void;
  setStatus: (status: RequestStatus) => void;
  setError: (error: string | null) => void;
  setServings: (n: number) => void;
  toggleIngredientChecked: (name: string) => void;
  markPrepared: () => void;
  reset: () => void;
}

// Persisted so the current recipe (and your progress checking off
// ingredients) survives a page reload — the Workspace re-hydrates straight
// from localStorage instead of showing an empty state after a refresh.
export const useRecipeStore = create<RecipeState>()(
  persist(
    (set) => ({
      recipe: null,
      status: "idle",
      error: null,
      servings: 4,
      checkedIngredients: {},
      sourceContext: null,
      isPrepared: false,
      setRecipe: (recipe, sourceContext = null) =>
        set({
          recipe,
          status: "success",
          error: null,
          servings: recipe.servings,
          checkedIngredients: {},
          sourceContext,
          isPrepared: false,
        }),
      setStatus: (status) => set({ status }),
      setError: (error) => set({ error, status: "error" }),
      setServings: (n) => set({ servings: Math.min(8, Math.max(1, n)) }),
      toggleIngredientChecked: (name) =>
        set((s) => ({
          checkedIngredients: { ...s.checkedIngredients, [name]: !s.checkedIngredients[name] },
        })),
      markPrepared: () => set({ isPrepared: true }),
      reset: () =>
        set({
          recipe: null,
          status: "idle",
          error: null,
          checkedIngredients: {},
          sourceContext: null,
          isPrepared: false,
        }),
    }),
    { name: "ai-recipe-studio-current-recipe" }
  )
);
