import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { EXPLORE_DATA, findCuisine, findRegion } from "../../data/exploreData";
import CuisineChips from "./CuisineChips";
import RegionBox from "./RegionBox";
import DishGroupFlipCard from "./DishGroupFlipCard";

interface CuisineExplorerProps {
  onSelectDish: (params: {
    dishName: string;
    cuisineId: string;
    cuisineLabel: string;
    regionId: string;
    groupId: string;
  }) => void;
}

export default function CuisineExplorer({ onSelectDish }: CuisineExplorerProps) {
  const [cuisineId, setCuisineId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);

  const cuisine = cuisineId ? findCuisine(cuisineId) : null;
  const region = cuisineId && regionId ? findRegion(cuisineId, regionId) : null;

  const handleSelectCuisine = (id: string) => {
    setCuisineId((prev) => (prev === id ? null : id));
    setRegionId(null);
  };

  return (
    <div className="mt-2">
      <CuisineChips cuisines={EXPLORE_DATA} activeId={cuisineId} onSelect={handleSelectCuisine} />

      <AnimatePresence mode="wait">
        {cuisine && !region && (
          <motion.div
            key={`regions-${cuisine.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mx-auto mt-6 max-w-5xl px-2"
          >
            <p className="mb-4 text-center text-sm text-white/40">{cuisine.description}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cuisine.regions.map((r, i) => (
                <RegionBox key={r.id} region={r} index={i} onSelect={() => setRegionId(r.id)} />
              ))}
            </div>
          </motion.div>
        )}

        {cuisine && region && (
          <motion.div
            key={`groups-${cuisine.id}-${region.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mx-auto mt-6 max-w-5xl px-2"
          >
            <button
              type="button"
              onClick={() => setRegionId(null)}
              className="focus-ring mb-4 flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
            >
              <ArrowLeft size={14} /> Back to {cuisine.label} regions
            </button>
            <p className="mb-4 text-sm text-white/40">
              {region.emoji} <span className="font-medium text-white/70">{region.name}</span> — {region.description}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {region.groups.map((g) => (
                <DishGroupFlipCard
                  key={g.id}
                  group={g}
                  onSelectVariety={(varietyName) =>
                    onSelectDish({
                      dishName: varietyName,
                      cuisineId: cuisine.id,
                      cuisineLabel: cuisine.label,
                      regionId: region.id,
                      groupId: g.id,
                    })
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
