import { motion } from "framer-motion";
import { X } from "lucide-react";

interface IngredientChipProps {
  label: string;
  onRemove: () => void;
}

export default function IngredientChip({ label, onRemove }: IngredientChipProps) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft/10 px-3 py-1.5 text-sm text-orange-200 ring-1 ring-accent/30"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="focus-ring rounded-full p-1 hover:bg-white/10 sm:p-0.5"
      >
        <X size={12} />
      </button>
    </motion.span>
  );
}
