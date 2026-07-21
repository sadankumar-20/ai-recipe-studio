import { clsx } from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "easy" | "medium" | "hard";
  className?: string;
}

const tones = {
  neutral: "bg-white/10 text-white",
  easy: "bg-emerald-500/15 text-emerald-400",
  medium: "bg-amber-500/15 text-amber-400",
  hard: "bg-rose-500/15 text-rose-400",
};

export default function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
