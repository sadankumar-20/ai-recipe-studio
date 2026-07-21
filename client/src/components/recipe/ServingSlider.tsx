import { Minus, Plus, Users } from "lucide-react";
import { useRecipeStore } from "../../store/recipeStore";

export default function ServingSlider() {
  const { servings, setServings } = useRecipeStore();

  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-white">
          <Users size={16} className="text-accent" /> Servings
        </h2>
        <span className="text-lg font-semibold text-white">{servings}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Decrease servings"
          onClick={() => setServings(servings - 1)}
          className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-white/70 hover:border-white/30 hover:text-white"
        >
          <Minus size={14} />
        </button>

        <input
          type="range"
          min={1}
          max={8}
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          aria-label="Servings"
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-orange-500"
        />

        <button
          type="button"
          aria-label="Increase servings"
          onClick={() => setServings(servings + 1)}
          className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-white/70 hover:border-white/30 hover:text-white"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-white/25">
        <span>1</span>
        <span>8</span>
      </div>
    </div>
  );
}
