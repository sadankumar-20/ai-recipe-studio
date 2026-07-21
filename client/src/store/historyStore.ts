import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Recipe } from "../types/recipe.types";
import type { RecipeSourceContext } from "./recipeStore";

export interface HistoryEntry {
  id: string;
  title: string;
  triedAt: string;
  // The full recipe (and where it came from, if the explorer was used) is
  // stored so a past session can be reopened exactly as it was generated —
  // not just remembered by name.
  recipe: Recipe;
  sourceContext: RecipeSourceContext | null;
}

interface HistoryState {
  // Keyed by user email so switching accounts on the same device doesn't
  // mix histories together.
  entriesByUser: Record<string, HistoryEntry[]>;
  logDish: (email: string, recipe: Recipe, sourceContext?: RecipeSourceContext | null) => void;
  getHistory: (email: string) => HistoryEntry[];
}

// A single stable reference for "no history yet". Returning a fresh `[]`
// literal from a Zustand selector on every call breaks reference equality
// and causes React's useSyncExternalStore to re-render in an infinite loop.
export const EMPTY_HISTORY: HistoryEntry[] = [];

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entriesByUser: {},
      logDish: (email, recipe, sourceContext = null) =>
        set((s) => {
          const existing = s.entriesByUser[email] ?? EMPTY_HISTORY;
          const entry: HistoryEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: recipe.title,
            triedAt: new Date().toISOString(),
            recipe,
            sourceContext,
          };
          return {
            entriesByUser: { ...s.entriesByUser, [email]: [entry, ...existing].slice(0, 100) },
          };
        }),
      getHistory: (email) => get().entriesByUser[email] ?? EMPTY_HISTORY,
    }),
    { name: "ai-recipe-studio-history" }
  )
);
