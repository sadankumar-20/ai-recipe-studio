import { Router } from "express";
import { z } from "zod";
import { searchFoodImage, PexelsServiceError } from "../services/pexels.service.js";

export const imagesRouter = Router();

const querySchema = z.object({
  query: z.string().trim().min(1).max(120),
});

imagesRouter.get("/search", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "A non-empty 'query' parameter is required." });
  }

  try {
    const url = await searchFoodImage(parsed.data.query);
    return res.status(200).json({ url });
  } catch (err) {
    if (err instanceof PexelsServiceError) {
      return res.status(err.status).json({ message: err.message, url: null });
    }
    return res.status(500).json({ message: "Unexpected server error.", url: null });
  }
});
