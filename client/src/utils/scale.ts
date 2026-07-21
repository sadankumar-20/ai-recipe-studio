/**
 * Scales an ingredient quantity from the recipe's base servings to a target
 * serving count, formatting to at most 2 decimal places. Non-numeric
 * quantities (e.g. "a pinch", "to taste") are returned unchanged, since
 * there's nothing sensible to scale.
 */
export function scaleQuantity(
  amount: number | string,
  baseServings: number,
  targetServings: number
): string {
  if (typeof amount !== "number") return amount;
  if (!baseServings) return String(amount);
  const scaled = (amount / baseServings) * targetServings;
  const rounded = Math.round(scaled * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
