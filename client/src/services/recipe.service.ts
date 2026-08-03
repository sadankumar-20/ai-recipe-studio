import { AxiosError } from "axios";
import { api, BASE_URL } from "./api";
import { recipeSchema } from "../schemas/recipe.schema";
import type { Recipe } from "../types/recipe.types";

// ============================================================================
// recipe.service.ts — everything that talks to the backend about recipes.
//
// The mental model:
//   1. generateRecipe / generateRecipeByDish  → plain POST, wait, validate.
//   2. generateRecipeStreaming                → SSE stream with a live
//      title/description preview; falls back to (1) if anything breaks.
//   3. refineRecipe                           → "edit this recipe in place"
//      instead of regenerating from scratch.
//
// Two rules every path follows:
//   - Never trust the response: everything is validated against the Zod
//     schema before it can reach the UI, even though the server already
//     validated it once.
//   - Never let a stale response win: starting any new request aborts the
//     one still in flight (the shared `currentController` below).
// ============================================================================

// ----------------------------------------------------------------------------
// Error plumbing: one error class with a machine-readable code, so the UI can
// show different copy for a timeout vs a schema failure vs a dead network.
// toServiceError translates whatever axios throws into that shape (and gets
// one free retry when the server was simply unreachable).
// ----------------------------------------------------------------------------

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
// ----------------------------------------------------------------------------
// Plain (non-streaming) generation. These are also what the streaming path
// falls back to when a stream dies, so they stay the reliable workhorses.
// ----------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Refinement loop
// ---------------------------------------------------------------------------

/**
 * Applies a single edit instruction ("make it spicier", "swap the paneer")
 * to the recipe currently on screen, instead of regenerating from scratch.
 * Same abort/stale-response protection and schema validation as generation.
 */
export async function refineRecipe(
  instruction: string,
  currentRecipe: Recipe,
  retries = 1
): Promise<Recipe> {
  currentController?.abort();
  const controller = new AbortController();
  currentController = controller;

  try {
    const res = await api.post(
      "/generate/refine",
      { instruction, currentRecipe },
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
    return toServiceError(err, () => refineRecipe(instruction, currentRecipe, retries - 1), retries);
  } finally {
    if (currentController === controller) currentController = null;
  }
}

// ---------------------------------------------------------------------------
// Streaming generation
// ---------------------------------------------------------------------------

export type GeneratePayload =
  | { ingredients: string[] }
  | { dishName: string; cuisineHint?: string };

export interface StreamProgress {
  /** Extracted as soon as the model finishes writing the "title" field. */
  title: string | null;
  /** Extracted as soon as the model finishes the "description" field. */
  description: string | null;
  /** Total characters streamed so far (drives a subtle progress feel). */
  charCount: number;
}

/**
 * Reads the SSE stream from POST /generate/stream. Deltas are used only for
 * a progressive preview (title/description surfaced as they arrive) — the
 * recipe that gets rendered is exclusively the schema-validated one from the
 * terminal "complete" event, re-validated here on the client as well.
 */
async function streamOnce(
  payload: GeneratePayload,
  signal: AbortSignal,
  onProgress?: (p: StreamProgress) => void
): Promise<Recipe> {
  const res = await fetch(`${BASE_URL}/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream unavailable (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let modelText = "";
  let completeRecipe: unknown = null;
  let streamError: string | null = null;

  const report = () => {
    if (!onProgress) return;
    const title = modelText.match(/"title"\s*:\s*"([^"]{1,120})"/);
    const description = modelText.match(/"description"\s*:\s*"([^"]{1,400})"/);
    onProgress({
      title: title?.[1] ?? null,
      description: description?.[1] ?? null,
      charCount: modelText.length,
    });
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line.
    let sep;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const dataLine = rawEvent.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;

      let event: { type: string; text?: string; recipe?: unknown; message?: string };
      try {
        event = JSON.parse(dataLine.slice(5).trim());
      } catch {
        continue; // ignore malformed frames; the terminal event decides the outcome
      }

      if (event.type === "delta" && event.text) {
        modelText += event.text;
        report();
      } else if (event.type === "complete") {
        completeRecipe = event.recipe;
      } else if (event.type === "error") {
        streamError = event.message ?? "Streaming failed.";
      }
    }
  }

  if (streamError) throw new Error(streamError);

  const parsed = recipeSchema.safeParse(completeRecipe);
  if (!parsed.success) {
    throw new Error("Streamed recipe failed client-side schema validation.");
  }
  return parsed.data;
}

/**
 * Streaming generation with graceful degradation: if the stream errors,
 * disconnects partway, or produces an invalid recipe, it falls back to the
 * plain (non-streaming) endpoint — which has its own retry — so the user
 * still gets a recipe. A deliberate user abort is the only non-recoverable
 * outcome. Shares the module-level AbortController, so starting any new
 * generation cancels an in-flight stream (stale-response protection).
 */
export async function generateRecipeStreaming(
  payload: GeneratePayload,
  onProgress?: (p: StreamProgress) => void
): Promise<Recipe> {
  currentController?.abort();
  const controller = new AbortController();
  currentController = controller;

  try {
    return await streamOnce(payload, controller.signal, onProgress);
  } catch (err) {
    if (controller.signal.aborted) {
      throw new RecipeServiceError("Request cancelled", "ABORTED");
    }
    // Fall back to the reliable non-streaming path.
    if ("dishName" in payload) {
      return generateRecipeByDish(payload.dishName, payload.cuisineHint);
    }
    return generateRecipe(payload.ingredients);
  } finally {
    if (currentController === controller) currentController = null;
  }
}
