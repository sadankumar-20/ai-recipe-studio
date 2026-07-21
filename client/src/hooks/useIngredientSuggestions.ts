import { useMemo } from "react";
import { INGREDIENT_SUGGESTIONS } from "../constants";
import { useDebounce } from "./useDebounce";

export function useIngredientSuggestions(query: string, exclude: string[]) {
  const debounced = useDebounce(query, 200);

  return useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return [];
    return INGREDIENT_SUGGESTIONS.filter(
      (i) => i.includes(q) && !exclude.includes(i)
    ).slice(0, 6);
  }, [debounced, exclude]);
}
