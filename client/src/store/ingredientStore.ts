import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IngredientState {
  ingredients: string[];
  addIngredient: (raw: string) => void;
  addMany: (items: string[]) => void;
  removeIngredient: (name: string) => void;
  removeLast: () => void;
  clear: () => void;
  setIngredients: (items: string[]) => void;
}

const normalize = (v: string) => v.trim().toLowerCase().replace(/\s+/g, " ");

// Persisted so a reload doesn't wipe out the ingredients you've already
// typed or spoken in.
export const useIngredientStore = create<IngredientState>()(
  persist(
    (set, get) => ({
      ingredients: [],
      addIngredient: (raw) => {
        const clean = normalize(raw);
        if (!clean) return;
        if (get().ingredients.includes(clean)) return;
        set((s) => ({ ingredients: [...s.ingredients, clean] }));
      },
      addMany: (items) => {
        set((s) => {
          const merged = new Set(s.ingredients);
          items.forEach((i) => merged.add(normalize(i)));
          return { ingredients: Array.from(merged) };
        });
      },
      removeIngredient: (name) =>
        set((s) => ({ ingredients: s.ingredients.filter((i) => i !== name) })),
      removeLast: () => set((s) => ({ ingredients: s.ingredients.slice(0, -1) })),
      clear: () => set({ ingredients: [] }),
      setIngredients: (items) => set({ ingredients: items.map(normalize) }),
    }),
    { name: "ai-recipe-studio-ingredients" }
  )
);
