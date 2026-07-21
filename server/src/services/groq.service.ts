import Groq from "groq-sdk";
import { SYSTEM_PROMPT, buildUserPrompt, buildDishPrompt } from "../prompts/recipe.prompt.js";
import { recipeSchema, type RecipeResponse, type GenerateRequest } from "../validators/recipe.schema.js";

export class GroqServiceError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "GroqServiceError";
    this.status = status;
  }
}

let client: any = null;

function getClient():  {
  if (!process.env.GROQ_API_KEY) {
    throw new GroqServiceError("Server is missing GROQ_API_KEY configuration.", 500);
  }
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

/** Strips accidental markdown fences in case the model ignores instructions. */
function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

export async function generateRecipeFromRequest(
  request: GenerateRequest,
  attempt = 0
): Promise<RecipeResponse> {
  const groq = getClient();
  const model = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

  const userPrompt =
    "dishName" in request
      ? buildDishPrompt(request.dishName, request.cuisineHint)
      : buildUserPrompt(request.ingredients);

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
    if (attempt < 1) return generateRecipeFromRequest(request, attempt + 1);
    throw new GroqServiceError("Groq did not return valid JSON.", 502);
  }

  const result = recipeSchema.safeParse(parsedJson);
  if (!result.success) {
    if (attempt < 1) return generateRecipeFromRequest(request, attempt + 1);
    throw new GroqServiceError(
      `Groq JSON did not match the recipe schema: ${result.error.issues.map((i) => i.message).join(", ")}`,
      502
    );
  }

  return result.data;
}
