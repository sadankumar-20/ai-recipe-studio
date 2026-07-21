/**
 * Curated local image overrides, checked before falling back to a live
 * Pexels search. Some dish names are ambiguous on stock-photo sites — most
 * notably "Pongal", which is both a South Indian rice dish AND a major
 * harvest festival, so a plain search keeps surfacing festival photos
 * instead of the food. Entries are checked in order, so more specific
 * matches (e.g. "sweet pongal") must come before broader ones (e.g. "pongal").
 */
const DISH_IMAGE_OVERRIDES: { keys: string[]; path: string }[] = [
  { keys: ["ven pongal"], path: "/images/dishes/ven-pongal.jpg" },
  { keys: ["sweet pongal"], path: "/images/dishes/sweet-pongal.jpg" },
  // Generic fallback for any other pongal variety (millet/vegetable pongal,
  // or the "Pongal" dish-group thumbnail itself) — better to show a real
  // savory pongal photo than risk a festival image.
  { keys: ["pongal"], path: "/images/dishes/ven-pongal.jpg" },
];

/** Returns a local override image path if the given label matches a known dish, else null. */
export function findDishImageOverride(label: string): string | null {
  const lower = label.trim().toLowerCase();
  for (const entry of DISH_IMAGE_OVERRIDES) {
    if (entry.keys.some((key) => lower.includes(key))) return entry.path;
  }
  return null;
}
