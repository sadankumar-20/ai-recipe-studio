import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { clsx } from "clsx";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}

const variants = {
  primary: "bg-accent text-black hover:bg-orange-400",
  secondary: "bg-surface-2 text-white border border-line hover:border-white/30",
  ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-full",
  md: "px-5 py-2.5 text-sm rounded-full",
  lg: "px-7 py-3.5 text-base rounded-full",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "focus-ring inline-flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
}
