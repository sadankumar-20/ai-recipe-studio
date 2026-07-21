import { AxiosError } from "axios";
import { api } from "./api";
import { recipeSchema } from "../schemas/recipe.schema";
import type { Recipe } from "../types/recipe.types";

export class RecipeServiceError extends Error {
  code: "NETWORK" | "TIMEOUT" | "SCHEMA" | "SERVER" | "ABORTED";
  constructor(message: string, code: RecipeServiceError["code"]) {
    super(message);
    this.code = code;
    this.name = "RecipeServiceError";
  }
}

let currentController: AbortController | null = null;

function toServiceError(err: unknown, retry: () => Promise<Recipe>, retries: number): never | Promise<Recipe> {
  if (err instanceof RecipeServiceError) throw err;

  if (err instanceof AxiosError) {
    if (err.code === "ERR_CANCELED") {
      throw new RecipeServiceError("Request cancelled", "ABORTED");
    }
    if (err.code === "ECONNABORTED") {
      throw new RecipeServiceError("The request timed out. Please try again.", "TIMEOUT");
    }
    if (!err.response) {
      if (retries > 0) return retry();
      throw new RecipeServiceError("Could not reach the server. Check your connection.", "NETWORK");
    }
    throw new RecipeServiceError(
      err.response.data?.message ?? "The server couldn't generate a recipe.",
      "SERVER"
    );
  }

  throw new RecipeServiceError("Something unexpected went wrong.", "SERVER");
}

/**
 * Generates a recipe from a list of ingredients.
 * Cancels any in-flight request before starting a new one,
 * so stale responses can never overwrite a newer result.
 */
export async function generateRecipe(ingredients: string[], retries = 1): Promise<Recipe> {
  currentController?.abort();
  const controller = new AbortController();
  currentController = controller;

  try {
    const res = await api.post("/generate", { ingredients }, { signal: controller.signal });

    const parsed = recipeSchema.safeParse(res.data);
    if (!parsed.success) {
      throw new RecipeServiceError(
        "The AI response didn't match the expected recipe format.",
        "SCHEMA"
      );
    }
    return parsed.data;
  } catch (err) {
    return toServiceError(err, () => generateRecipe(ingredients, retries - 1), retries);
  } finally {
    if (currentController === controller) currentController = null;
  }
}

/**
 * Generates a recipe for a specific named dish (used by the cuisine explorer
 * and direct dish-name search), rather than from a free-form ingredient list.
 */
export async function generateRecipeByDish(
  dishName: string,
  cuisineHint?: string,
  retries = 1
): Promise<Recipe> {
  currentController?.abort();
  const controller = new AbortController();
  currentController = controller;

  try {
    const res = await api.post(
      "/generate",
      { dishName, cuisineHint },
      { signal: controller.signal }
    );

    const parsed = recipeSchema.safeParse(res.data);
    if (!parsed.success) {
      throw new RecipeServiceError(
        "The AI response didn't match the expected recipe format.",
        "SCHEMA"
      );
    }
    return parsed.data;
  } catch (err) {
    return toServiceError(
      err,
      () => generateRecipeByDish(dishName, cuisineHint, retries - 1),
      retries
    );
  } finally {
    if (currentController === controller) currentController = null;
  }
}

export interface FeedbackPayload {
  recipeTitle: string;
  rating: number;
  comment?: string;
}

/** Sends "I made this" feedback to the backend. Failures are non-fatal — the UI never blocks on this. */
export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  await api.post("/feedback", payload);
}
