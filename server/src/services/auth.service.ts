import crypto from "node:crypto";

interface SessionEntry {
  email: string;
  expiresAt: number;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minute windows
const SESSION_TTL_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_TTL_DEFAULT_MS = 24 * 60 * 60 * 1000; // 1 day

// Stateless auth: serverless instances don't share memory, so OTPs and
// sessions are HMAC-signed instead of stored. AUTH_SECRET must be set in
// production; all instances share it, so all can verify.
const SECRET = process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";

function hmac(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function otpForWindow(email: string, windowIndex: number): string {
  const digest = hmac(`otp:${email.toLowerCase()}:${windowIndex}`);
  const num = parseInt(digest.slice(0, 8), 16) % 1_000_000;
  return String(num).padStart(6, "0");
}

export function requestOtp(email: string): { code: string; expiresAt: number } {
  const windowIndex = Math.floor(Date.now() / OTP_TTL_MS);
  return { code: otpForWindow(email, windowIndex), expiresAt: (windowIndex + 1) * OTP_TTL_MS };
}

export class OtpVerificationError extends Error {}

export function verifyOtp(email: string, code: string): void {
  const w = Math.floor(Date.now() / OTP_TTL_MS);
  // Accept the current and previous window so a code stays valid 5-10 min.
  const valid = [w, w - 1].some((i) => safeEqual(otpForWindow(email, i), code));
  if (!valid) {
    throw new OtpVerificationError("Incorrect or expired code. Please try again.");
  }
}

export function createSession(email: string, rememberDevice: boolean): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + (rememberDevice ? SESSION_TTL_REMEMBER_MS : SESSION_TTL_DEFAULT_MS);
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), expiresAt })).toString("base64url");
  return { token: `${payload}.${hmac(`session:${payload}`)}`, expiresAt };
}

export function getSession(token: string): SessionEntry | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (!safeEqual(sig, hmac(`session:${payload}`))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.email !== "string" || typeof data.expiresAt !== "number") return null;
    if (Date.now() > data.expiresAt) return null;
    return { email: data.email, expiresAt: data.expiresAt };
  } catch {
    return null;
  }
}

export function destroySession(_token: string): void {
  // Stateless tokens can't be revoked server-side; logout means the client
  // discards its token. Fine for this demo.
}
