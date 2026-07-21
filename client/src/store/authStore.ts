import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  email: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  rememberDevice: boolean;
  setSession: (token: string, user: AuthUser, rememberDevice: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      rememberDevice: false,
      setSession: (token, user, rememberDevice) => set({ token, user, rememberDevice }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      // "Remember this device" controls the server-side session lifetime
      // (30 days vs 1 day, see server/src/services/auth.service.ts). The
      // token itself is always kept in localStorage so a page refresh
      // doesn't force a re-login mid-session.
      name: "ai-recipe-studio-auth",
    }
  )
);
