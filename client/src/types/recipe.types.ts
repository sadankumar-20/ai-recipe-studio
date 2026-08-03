import type { RecipeResponse } from "../schemas/recipe.schema";

export type Recipe = RecipeResponse;
export type RecipeIngredient = Recipe["ingredients"][number];
export type RecipeStep = Recipe["steps"][number];
export type Nutrition = Recipe["nutrition"];
export type IngredientSwap = Recipe["ingredientSwaps"][number];

export type RequestStatus = "idle" | "loading" | "success" | "error";
