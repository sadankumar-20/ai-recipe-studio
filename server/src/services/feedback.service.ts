import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import type { FeedbackRequest } from "../validators/recipe.schema.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.jsonl");

/**
 * Appends a feedback entry to a local JSON-lines file. This is intentionally
 * not a database — just durable local storage for a no-backend-complexity
 * project, per the assignment's "no database" constraint.
 */
export async function storeFeedback(feedback: FeedbackRequest): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const entry = {
    ...feedback,
    receivedAt: new Date().toISOString(),
  };
  await appendFile(FEEDBACK_FILE, JSON.stringify(entry) + "\n", "utf-8");
}
