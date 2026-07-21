import { Router } from "express";
import { requestOtpSchema, verifyOtpSchema } from "../validators/recipe.schema.js";
import { requestOtp, verifyOtp, createSession, getSession, destroySession, OtpVerificationError } from "../services/auth.service.js";

export const authRouter = Router();

const isDev = process.env.NODE_ENV !== "production";

authRouter.post("/request-otp", (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid email." });
  }

  const { code, expiresAt } = requestOtp(parsed.data.email);

  // No email provider is configured for this demo project — the OTP is
  // logged to the server console, and (dev only) echoed in the response so
  // the flow is testable without real email infrastructure.
  console.log(`\n📧  OTP for ${parsed.data.email}: ${code}  (expires in 5 min)\n`);

  return res.status(200).json({
    message: "OTP generated. Check the server terminal.",
    expiresAt,
    ...(isDev ? { devOtp: code } : {}),
  });
});

authRouter.post("/verify-otp", (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid request." });
  }

  try {
    verifyOtp(parsed.data.email, parsed.data.otp);
  } catch (err) {
    if (err instanceof OtpVerificationError) {
      return res.status(401).json({ message: err.message });
    }
    return res.status(500).json({ message: "Unexpected server error." });
  }

  const { token, expiresAt } = createSession(parsed.data.email, parsed.data.rememberDevice);
  return res.status(200).json({ token, expiresAt, user: { email: parsed.data.email } });
});

authRouter.get("/me", (req, res) => {
  const authHeader = req.header("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const session = token ? getSession(token) : null;

  if (!session) {
    return res.status(401).json({ message: "Session expired or invalid." });
  }
  return res.status(200).json({ user: { email: session.email } });
});

authRouter.post("/logout", (req, res) => {
  const authHeader = req.header("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (token) destroySession(token);
  return res.status(200).json({ message: "Logged out." });
});
