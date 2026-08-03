import { motion } from "framer-motion";
import Logo from "../common/Logo";
import ThemeToggle from "./ThemeToggle";
import UserDrawer from "./UserDrawer";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const setUserDrawerOpen = useUIStore((s) => s.setUserDrawerOpen);
  const initial = user?.email.charAt(0).toUpperCase();

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-line/60 bg-ink/70 backdrop-blur-lg"
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <button
                type="button"
                onClick={() => setUserDrawerOpen(true)}
                aria-label="Open account menu"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                {initial}
              </button>
            )}
          </div>
        </nav>
      </motion.header>
      <UserDrawer />
    </>
  );
}
