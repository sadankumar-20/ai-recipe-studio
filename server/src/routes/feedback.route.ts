import { Router } from "express";
import { feedbackSchema } from "../validators/recipe.schema.js";
import { storeFeedback } from "../services/feedback.service.js";

export const feedbackRouter = Router();

feedbackRouter.post("/", async (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? "Invalid feedback payload.",
    });
  }

  try {
    await storeFeedback(parsed.data);
    return res.status(201).json({ message: "Feedback saved. Thank you!" });
  } catch {
    return res.status(500).json({ message: "Could not save feedback." });
  }
});
