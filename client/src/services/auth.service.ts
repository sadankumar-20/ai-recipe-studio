import { AxiosError } from "axios";
import { api } from "./api";

export class AuthServiceError extends Error {}

export interface RequestOtpResult {
  expiresAt: number;
  devOtp?: string;
}

export async function requestOtp(email: string): Promise<RequestOtpResult> {
  try {
    const res = await api.post("/auth/request-otp", { email });
    return res.data;
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new AuthServiceError(err.response.data?.message ?? "Could not send OTP.");
    }
    throw new AuthServiceError("Could not reach the server.");
  }
}

export interface VerifyOtpResult {
  token: string;
  expiresAt: number;
  user: { email: string };
}

export async function verifyOtp(
  email: string,
  otp: string,
  rememberDevice: boolean
): Promise<VerifyOtpResult> {
  try {
    const res = await api.post("/auth/verify-otp", { email, otp, rememberDevice });
    return res.data;
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      throw new AuthServiceError(err.response.data?.message ?? "Invalid code.");
    }
    throw new AuthServiceError("Could not reach the server.");
  }
}

export async function fetchCurrentUser(token: string): Promise<{ email: string } | null> {
  try {
    const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    return res.data.user;
  } catch {
    return null;
  }
}

export async function logoutRequest(token: string): Promise<void> {
  try {
    await api.post("/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    // Best-effort — local session is cleared regardless.
  }
}
