import { motion } from "framer-motion";
import { APP_NAME, APP_TAGLINE } from "../../constants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24 sm:pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ opacity: [0.25, 0.4, 0.25], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-[-10%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]"
        />
      </div>

      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-white/60"
      >
        Fresh recipes, generated on demand
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl"
      >
        {APP_NAME}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12 }}
        className="mx-auto mt-5 max-w-xl text-base text-white/50 sm:text-lg"
      >
        {APP_TAGLINE}
        <br />
        One beautiful search away from your next meal.
      </motion.p>
    </section>
  );
}
