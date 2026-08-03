// ============================================================================
// groq.service.ts — the only file that talks to the Groq API.
//
// Three exports do the real work:
//   generateRecipeFromRequest → normal completion in JSON mode
//   refineRecipeFromRequest   → same thing, but the prompt carries the
//                               current recipe + one edit instruction
//   streamRecipeText          → token-by-token stream (used by the SSE route)
//
// The first two share completeToRecipe(): call the model, strip any stray
// markdown fences, JSON.parse, validate with Zod, and retry once if the JSON
// was malformed or the shape was off — those failures are usually transient.
// Nothing leaves this file without passing recipeSchema.
// ============================================================================

import Groq from "groq-sdk";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  buildDishPrompt,
  buildRefinePrompt,
} from "../prompts/recipe.prompt.js";
import {
  recipeSchema,
  type RecipeResponse,
  type GenerateRequest,
  type RefineRequest,
} from "../validators/recipe.schema.js";

export class GroqServiceError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "GroqServiceError";
    this.status = status;
  }
}

let client: InstanceType<typeof Groq> | null = null;

function getClient(): InstanceType<typeof Groq> {
  if (!process.env.GROQ_API_KEY) {
    throw new GroqServiceError("Server is missing GROQ_API_KEY configuration.", 500);
  }
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

/** Strips accidental markdown fences in case the model ignores instructions. */
export function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

function promptFor(request: GenerateRequest): string {
  return "dishName" in request
    ? buildDishPrompt(request.dishName, request.cuisineHint)
    : buildUserPrompt(request.ingredients);
}

/**
 * Shared non-streaming core: one completion in JSON mode, parse, validate,
 * retry once on malformed JSON or schema mismatch (often transient).
 */
async function completeToRecipe(userPrompt: string, attempt = 0): Promise<RecipeResponse> {
  const groq = getClient();
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model,
      temperature: 0.6,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Groq API error";
    throw new GroqServiceError(`Groq request failed: ${message}`, 502);
  }

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new GroqServiceError("Groq returned an empty response.", 502);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJson(raw));
  } catch {
    // Malformed/truncated JSON is often transient — retry once before failing.
    if (attempt < 1) return completeToRecipe(userPrompt, attempt + 1);
    throw new GroqServiceError("Groq did not return valid JSON.", 502);
  }

  const result = recipeSchema.safeParse(parsedJson);
  if (!result.success) {
    if (attempt < 1) return completeToRecipe(userPrompt, attempt + 1);
    throw new GroqServiceError(
      `Groq JSON did not match the recipe schema: ${result.error.issues.map((i) => i.message).join(", ")}`,
      502
    );
  }

  return result.data;
}

export async function generateRecipeFromRequest(request: GenerateRequest): Promise<RecipeResponse> {
  return completeToRecipe(promptFor(request));
}

/**
 * Refinement: sends the current recipe plus one edit instruction and asks the
 * model to change only what was requested. Same parse/validate/retry path as
 * a fresh generation — a refined recipe that fails validation never reaches
 * the client.
 */
export async function refineRecipeFromRequest(request: RefineRequest): Promise<RecipeResponse> {
  return completeToRecipe(buildRefinePrompt(request.instruction, request.currentRecipe));
}

/**
 * Streaming variant: yields raw text deltas as the model generates and
 * returns the full accumulated text when done.
 *
 * Note: Groq's JSON mode (response_format: json_object) does not support
 * streaming, so this call relies on the strict system prompt instead —
 * which is why the route validates the assembled text against recipeSchema
 * before ever sending a "complete" event, and why the client falls back to
 * the non-streaming endpoint if anything about the stream fails.
 */
export async function streamRecipeText(
  request: GenerateRequest,
  onDelta: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const groq = getClient();
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  let stream;
  try {
    stream = await groq.chat.completions.create(
      {
        model,
        temperature: 0.6,
        max_tokens: 4096,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: promptFor(request) },
        ],
      },
      { signal }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Groq API error";
    throw new GroqServiceError(`Groq stream failed: ${message}`, 502);
  }

  let full = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    if (delta) {
      full += delta;
      onDelta(delta);
    }
  }
  return full;
}
