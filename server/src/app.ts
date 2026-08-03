import express from "express";
import cors from "cors";
import { generateRouter } from "./routes/generate.route.js";
import { feedbackRouter } from "./routes/feedback.route.js";
import { authRouter } from "./routes/auth.route.js";
import { imagesRouter } from "./routes/images.route.js";

export function createApp() {
  const app = express();

  const origin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  app.use(cors({ origin }));
  app.use(express.json({ limit: "50kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/generate", generateRouter);
  app.use("/feedback", feedbackRouter);
  app.use("/auth", authRouter);
  app.use("/images", imagesRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: "Not found." });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error." });
  });

  return app;
}
