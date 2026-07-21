import { Router } from "express";
import { generateRequestSchema } from "../validators/recipe.schema.js";
import { generateRecipeFromRequest, GroqServiceError } from "../services/groq.service.js";

export const generateRouter = Router();

generateRouter.post("/", async (req, res) => {
  const parsed = generateRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? "Invalid request body.",
    });
  }

  try {
    const recipe = await generateRecipeFromRequest(parsed.data);
    return res.status(200).json(recipe);
  } catch (err) {
    if (err instanceof GroqServiceError) {
      return res.status(err.status).json({ message: err.message });
    }
    return res.status(500).json({ message: "Unexpected server error." });
  }
});
