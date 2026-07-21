import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

interface UIState {
  isVoiceActive: boolean;
  flippedStepId: string | null;
  isUserDrawerOpen: boolean;
  theme: Theme;
  setVoiceActive: (v: boolean) => void;
  toggleFlippedStep: (id: string) => void;
  setUserDrawerOpen: (v: boolean) => void;
  toggleTheme: () => void;
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", theme === "light");
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isVoiceActive: false,
      flippedStepId: null,
      isUserDrawerOpen: false,
      theme: "dark",
      setVoiceActive: (v) => set({ isVoiceActive: v }),
      toggleFlippedStep: (id) =>
        set((s) => ({ flippedStepId: s.flippedStepId === id ? null : id })),
      setUserDrawerOpen: (v) => set({ isUserDrawerOpen: v }),
      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        applyThemeClass(next);
        set({ theme: next });
      },
    }),
    {
      name: "ai-recipe-studio-ui",
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme);
      },
    }
  )
);
