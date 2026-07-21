import { z } from "zod";

/** Incoming request body: either free-form ingredients, or a specific dish name. */
export const generateRequestSchema = z.union([
  z.object({
    ingredients: z
      .array(z.string().trim().min(1))
      .min(1, "Provide at least one ingredient")
      .max(30, "Too many ingredients"),
  }),
  z.object({
    dishName: z.string().trim().min(1).max(120),
    cuisineHint: z.string().trim().max(60).optional(),
  }),
]);

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const feedbackSchema = z.object({
  recipeTitle: z.string().trim().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().default(""),
});

export type FeedbackRequest = z.infer<typeof feedbackSchema>;

export const requestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  otp: z.string().trim().length(6, "Enter the 6-digit code."),
  rememberDevice: z.boolean().optional().default(false),
});

// ---------------------------------------------------------------------------
// The AI model is instructed to return clean numbers, but real-world recipes
// often have non-numeric amounts ("a pinch", "to taste", "5-10 min"). Rather
// than hard-failing the whole recipe when that happens, these helpers coerce
// loosely-numeric strings into numbers and fall back gracefully instead of
// throwing — that's what was silently breaking recipes with garnish-heavy
// ingredient lists (e.g. Pani Puri) before.
// ---------------------------------------------------------------------------

function extractNumber(val: unknown): number | null {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const match = val.match(/-?\d+(\.\d+)?/);
    if (match) return parseFloat(match[0]);
  }
  return null;
}

/** Coerces to a number, defaulting to 0 when nothing numeric is present. */
const flexibleNumber = z.preprocess((val) => extractNumber(val) ?? 0, z.number());

/** Coerces to a number or null (used for optional step durations). */
const flexibleNumberOrNull = z.preprocess((val) => {
  if (val === null || val === undefined) return null;
  return extractNumber(val);
}, z.number().nullable());

/** Coerces servings to an integer clamped between 1 and 12. */
const flexibleServings = z.preprocess((val) => {
  const n = extractNumber(val) ?? 4;
  return Math.min(12, Math.max(1, Math.round(n)));
}, z.number());

/** Coerces cook time to a positive number of minutes, defaulting to 30. */
const flexibleCookTime = z.preprocess((val) => {
  const n = extractNumber(val);
  return n && n > 0 ? n : 30;
}, z.number());

/** Normalizes casing/variants ("easy", "MEDIUM") and falls back to "Medium". */
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

/** Shape we require back from the model. Mirrors the client-side schema. */
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
