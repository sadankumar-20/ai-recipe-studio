import { Moon, Sun } from "lucide-react";
import { useUIStore } from "../../store/uiStore";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line text-white/70 transition-colors hover:border-white/30 hover:text-white"
    >
      {isLight ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}
