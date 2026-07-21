import type { RecipeStep } from "../../types/recipe.types";
import StepCard from "./StepCard";

export default function CookingSteps({ steps }: { steps: RecipeStep[] }) {
  const ordered = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-white">Cooking Steps</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {ordered.map((step, i) => (
          <StepCard key={step.id} step={step} index={i} />
        ))}
      </div>
    </div>
  );
}
