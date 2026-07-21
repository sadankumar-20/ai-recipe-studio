import { AnimatePresence, motion } from "framer-motion";
import { X, LogOut, Clock, ChefHat, RotateCcw } from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { useHistoryStore, EMPTY_HISTORY, type HistoryEntry } from "../../store/historyStore";
import { useRecipeStore } from "../../store/recipeStore";
import { logoutRequest } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function UserDrawer() {
  const { isUserDrawerOpen, setUserDrawerOpen } = useUIStore();
  const { user, token, logout } = useAuthStore();
  const history = useHistoryStore((s) => (user ? s.getHistory(user.email) : EMPTY_HISTORY));
  const setRecipe = useRecipeStore((s) => s.setRecipe);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (token) await logoutRequest(token);
    logout();
    setUserDrawerOpen(false);
    navigate("/login", { replace: true });
  };

  const handleReopen = (entry: HistoryEntry) => {
    setRecipe(entry.recipe, entry.sourceContext);
    setUserDrawerOpen(false);
    navigate("/workspace");
  };

  if (!user) return null;

  const initial = user.email.charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {isUserDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUserDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col border-l border-line bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Your account</span>
              <button
                type="button"
                onClick={() => setUserDrawerOpen(false)}
                aria-label="Close"
                className="focus-ring rounded-full p-1.5 text-white/50 hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-black">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-white/40">Signed in</p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Clock size={15} className="text-accent" /> History
            </div>
            <p className="mb-4 text-xs text-white/40">
              You've tried <span className="font-semibold text-white/70">{history.length}</span>{" "}
              {history.length === 1 ? "dish" : "dishes"} so far. Tap any to reopen it.
            </p>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {history.length === 0 && (
                <p className="text-sm text-white/35">No dishes generated yet — go cook something!</p>
              )}
              {history.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleReopen(entry)}
                  className="focus-ring group flex w-full items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5 text-left transition-colors hover:bg-white/10"
                >
                  <ChefHat size={14} className="shrink-0 text-white/30" />
                  <span className="flex-1 truncate text-sm text-white/75">{entry.title}</span>
                  <span className="shrink-0 text-xs text-white/30">{formatRelativeTime(entry.triedAt)}</span>
                  <RotateCcw size={12} className="shrink-0 text-white/0 transition-colors group-hover:text-accent" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="focus-ring mt-6 flex items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm text-white/70 transition-colors hover:border-rose-500/40 hover:text-rose-300"
            >
              <LogOut size={14} /> Log out
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
