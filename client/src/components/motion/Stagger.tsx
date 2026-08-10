import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

// Staggered entrance for a vertical stack of sections. Parent controls the
// cadence; each child rises and fades in. Respects reduced-motion settings
// (framer-motion handles prefers-reduced-motion automatically for transforms).

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] as const } },
};

export function StaggerContainer({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
