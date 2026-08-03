import { z } from "zod";

// ---------------------------------------------------------------------------
// Mirrors server/src/validators/recipe.schema.ts. The AI is instructed to
// return clean numbers, but real recipes often have non-numeric amounts
// ("a pinch", "to taste", "5-10 min") — these helpers coerce loosely-numeric
// values instead of hard-failing the whole recipe when that happens.
// ---------------------------------------------------------------------------

function extractNumber(val: unknown): number | null {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const match = val.match(/-?\d+(\.\d+)?/);
    if (match) return parseFloat(match[0]);
  }
  return null;
}

const flexibleNumber = z.preprocess((val) => extractNumber(val) ?? 0, z.number());

const flexibleNumberOrNull = z.preprocess((val) => {
  if (val === null || val === undefined) return null;
  return extractNumber(val);
}, z.number().nullable());

const flexibleServings = z.preprocess((val) => {
  const n = extractNumber(val) ?? 4;
  return Math.min(12, Math.max(1, Math.round(n)));
}, z.number());

const flexibleCookTime = z.preprocess((val) => {
  const n = extractNumber(val);
  return n && n > 0 ? n : 30;
}, z.number());

const flexibleDifficulty = z
  .preprocess((val) => {
    if (typeof val === "string") {
      const v = val.trim().toLowerCase();
      if (v.startsWith("easy")) return "Easy";
      if (v.startsWith("medium")) return "Medium";
      if (v.startsWith("hard")) return "Hard";
    }
    return val;
  }, z.enum(["Easy", "Medium", "Hard"]))
  .catch("Medium");

export const ingredientSchema = z.object({
  name: z.string(),
  // Quantities like "a pinch" or "to taste" are valid and kept as text;
  // only genuinely numeric amounts get scaled by the serving slider.
  quantity: z.union([z.number(), z.string()]),
  unit: z.string().optional().default(""),
  optional: z.boolean().optional().default(false),
});

export const stepSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  order: flexibleNumber,
  instruction: z.string(),
  tip: z.string().optional().default(""),
  durationMinutes: flexibleNumberOrNull.optional().default(null),
});

export const nutritionSchema = z.object({
  calories: flexibleNumber,
  protein: flexibleNumber,
  carbs: flexibleNumber,
  fat: flexibleNumber,
});

export const ingredientSwapSchema = z.object({
  original: z.string(),
  substitute: z.string(),
  reason: z.string().optional().default(""),
});

export const recipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  servings: flexibleServings,
  cookTime: flexibleCookTime,
  difficulty: flexibleDifficulty,
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(stepSchema).min(1),
  nutrition: nutritionSchema,
  tips: z.array(z.string()).default([]),
  ingredientSwaps: z.array(ingredientSwapSchema).default([]),
});

export type RecipeResponse = z.infer<typeof recipeSchema>;

export const generateRequestSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1, "Add at least one ingredient"),
});
