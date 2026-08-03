import { motion } from "framer-motion";
import { Clock, RotateCcw } from "lucide-react";
import type { RecipeStep } from "../../types/recipe.types";
import { useUIStore } from "../../store/uiStore";

interface StepCardProps {
  step: RecipeStep;
  index: number;
}

export default function StepCard({ step, index }: StepCardProps) {
  const isFlipped = useUIStore((s) => s.flippedStepId === step.id);
  const toggleFlippedStep = useUIStore((s) => s.toggleFlippedStep);

  return (
    <div className="[perspective:1200px]">
      <motion.button
        type="button"
        onClick={() => toggleFlippedStep(step.id)}
        aria-label={`Step ${index + 1}. ${isFlipped ? "Showing tip, click to show instruction" : "Click to see extra tip"}`}
        className="focus-ring relative h-full min-h-[150px] w-full text-left [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col rounded-2xl border border-line bg-surface p-5 [backface-visibility:hidden]">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-black">
              {index + 1}
            </span>
            <div className="flex items-center gap-2">
              {step.durationMinutes ? (
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <Clock size={12} /> {step.durationMinutes}m
                </span>
              ) : null}
              {step.tip && <RotateCcw size={13} className="text-white/25" />}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/85">{step.instruction}</p>
          {step.tip && <p className="mt-auto pt-3 text-[11px] text-white/30">Tap for a chef tip →</p>}
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col rounded-2xl border border-accent/40 bg-accent-soft/5 p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="mb-2 text-[11px] font-medium uppercase tracking-wide text-accent">
            Chef tip · Step {index + 1}
          </span>
          <p className="text-sm leading-relaxed text-white/85">
            {step.tip || "No extra tip for this step — you've got this."}
          </p>
          <p className="mt-auto pt-3 text-[11px] text-white/30">Tap to flip back →</p>
        </div>
      </motion.button>
    </div>
  );
}
