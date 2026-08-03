import crypto from "node:crypto";

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

interface SessionEntry {
  email: string;
  expiresAt: number;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_TTL_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_TTL_DEFAULT_MS = 24 * 60 * 60 * 1000; // 1 day
const MAX_OTP_ATTEMPTS = 5;

// In-memory stores. This is a demo/portfolio project with "no database" by
// design — sessions and OTPs reset whenever the server restarts.
const otpStore = new Map<string, OtpEntry>();
const sessionStore = new Map<string, SessionEntry>();

function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function requestOtp(email: string): { code: string; expiresAt: number } {
  const code = generateCode();
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpStore.set(email.toLowerCase(), { code, expiresAt, attempts: 0 });
  return { code, expiresAt };
}

export class OtpVerificationError extends Error {}

export function verifyOtp(email: string, code: string): void {
  const key = email.toLowerCase();
  const entry = otpStore.get(key);

  if (!entry) {
    throw new OtpVerificationError("No OTP was requested for this email, or it already expired.");
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    throw new OtpVerificationError("This OTP has expired. Request a new one.");
  }
  if (entry.attempts >= MAX_OTP_ATTEMPTS) {
    otpStore.delete(key);
    throw new OtpVerificationError("Too many incorrect attempts. Request a new OTP.");
  }
  if (entry.code !== code) {
    entry.attempts += 1;
    throw new OtpVerificationError("Incorrect code. Please try again.");
  }

  otpStore.delete(key);
}

export function createSession(email: string, rememberDevice: boolean): { token: string; expiresAt: number } {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + (rememberDevice ? SESSION_TTL_REMEMBER_MS : SESSION_TTL_DEFAULT_MS);
  sessionStore.set(token, { email: email.toLowerCase(), expiresAt });
  return { token, expiresAt };
}

export function getSession(token: string): SessionEntry | null {
  const entry = sessionStore.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    sessionStore.delete(token);
    return null;
  }
  return entry;
}

export function destroySession(token: string): void {
  sessionStore.delete(token);
}
