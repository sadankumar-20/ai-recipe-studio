// ============================================================================
// generate.route.ts — the AI gateway. Three endpoints, one contract:
//
//   POST /generate         → classic request/response
//   POST /generate/refine  → edit the recipe on screen instead of redoing it
//   POST /generate/stream  → same generation, but over Server-Sent Events
//
// Every endpoint validates the incoming body with Zod BEFORE touching Groq,
// and only ever returns a recipe that passed the recipe schema. The stream
// endpoint sends raw deltas for preview purposes, but the recipe the client
// is allowed to render only travels in the final, validated "complete" event.
// ============================================================================

import { Router } from "express";
import {
  generateRequestSchema,
  refineRequestSchema,
  recipeSchema,
} from "../validators/recipe.schema.js";
import {
  generateRecipeFromRequest,
  refineRecipeFromRequest,
  streamRecipeText,
  extractJson,
  GroqServiceError,
} from "../services/groq.service.js";

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

/**
 * Refinement loop: applies one edit instruction to the recipe currently on
 * screen ("make it spicier", "swap out the paneer") instead of regenerating
 * from scratch. Same response shape and validation as POST /generate.
 */
generateRouter.post("/refine", async (req, res) => {
  const parsed = refineRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? "Invalid refinement request.",
    });
  }

  try {
    const recipe = await refineRecipeFromRequest(parsed.data);
    return res.status(200).json(recipe);
  } catch (err) {
    if (err instanceof GroqServiceError) {
      return res.status(err.status).json({ message: err.message });
    }
    return res.status(500).json({ message: "Unexpected server error." });
  }
});

/**
 * Streaming generation over Server-Sent Events. Emits:
 *   data: {"type":"delta","text":"..."}     — raw model text as it arrives
 *   data: {"type":"complete","recipe":{..}} — the full, schema-VALIDATED recipe
 *   data: {"type":"error","message":"..."}  — anything went wrong
 *
 * The validated recipe is only ever sent in the terminal "complete" event —
 * deltas are for progressive preview, never rendered as the source of truth.
 * If the client disconnects mid-stream, the upstream Groq request is aborted.
 */
generateRouter.post("/stream", async (req, res) => {
  const parsed = generateRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? "Invalid request body.",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event: object) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const upstream = new AbortController();
  res.on("close", () => { if (!res.writableEnded) upstream.abort(); });

  try {
    const fullText = await streamRecipeText(
      parsed.data,
      (text) => send({ type: "delta", text }),
      upstream.signal
    );

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(extractJson(fullText));
    } catch {
      send({ type: "error", message: "The model did not return valid JSON." });
      return res.end();
    }

    const result = recipeSchema.safeParse(parsedJson);
    if (!result.success) {
      send({ type: "error", message: "The model's JSON did not match the recipe schema." });
      return res.end();
    }

    send({ type: "complete", recipe: result.data });
    return res.end();
  } catch (err) {
    if (!upstream.signal.aborted) {
      send({
        type: "error",
        message: err instanceof GroqServiceError ? err.message : "Streaming failed.",
      });
    }
    return res.end();
  }
});
