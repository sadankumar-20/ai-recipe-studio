import { useState } from "react";
import { Wand2 } from "lucide-react";
import Button from "../ui/Button";

const QUICK_REFINEMENTS = ["Make it spicier", "Make it vegetarian", "Cut the cook time"];

interface RefineBarProps {
  onRefine: (instruction: string) => void;
  isRefining?: boolean;
}

/**
 * The refinement loop: a follow-up prompt that edits the recipe currently on
 * screen ("make it spicier", "swap out the paneer") instead of regenerating a
 * brand-new one. Submitting sends the instruction plus the current recipe
 * JSON to POST /generate/refine.
 */
export default function RefineBar({ onRefine, isRefining }: RefineBarProps) {
  const [instruction, setInstruction] = useState("");

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 3 || isRefining) return;
    onRefine(trimmed);
    setInstruction("");
  };

  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-white">
        <Wand2 size={15} className="text-accent" /> Refine this recipe
      </h2>
      <p className="mb-4 text-sm text-white/40">
        Describe one change — the recipe is edited in place, not regenerated from scratch.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(instruction)}
          placeholder='e.g. "make it spicier" or "swap out the paneer"'
          disabled={isRefining}
          aria-label="Refinement instruction"
          className="focus-ring-soft min-w-0 flex-1 rounded-2xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors focus-within:border-white/25 disabled:opacity-50"
        />
        <Button
          type="button"
          onClick={() => submit(instruction)}
          disabled={instruction.trim().length < 3 || isRefining}
          icon={<Wand2 size={14} />}
          className="w-full justify-center sm:w-auto"
        >
          {isRefining ? "Refining..." : "Refine"}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_REFINEMENTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => submit(q)}
            disabled={isRefining}
            className="focus-ring rounded-full border border-line px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-accent/40 hover:text-white disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
