import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { LOADING_MESSAGES, COOKING_TIPS } from "../../constants";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-surface-2 ${className}`}>
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </div>
  );
}

export default function RecipeLoading() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length), 1600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % COOKING_TIPS.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <motion.span
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-black"
        >
          <ChefHat size={22} />
        </motion.span>

        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-[15px] font-medium text-white/80"
          >
            {LOADING_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-6">
        <div className="mb-6 flex items-center gap-4">
          <Shimmer className="h-20 w-20 shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-5 w-2/3" />
            <Shimmer className="h-3.5 w-1/3" />
          </div>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Shimmer key={i} className="h-16" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Shimmer key={i} className="h-10" />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 text-center text-sm text-white/35"
        >
          Chef's tip: {COOKING_TIPS[tipIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
