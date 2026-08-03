export interface DishVariety {
  name: string;
}

export interface DishGroup {
  id: string;
  name: string;
  emoji: string;
  description: string;
  varieties: DishVariety[];
  /** Overrides the Pexels search query when `${name} food` is too ambiguous
   * (e.g. "Pongal" alone tends to surface festival photos, not the dish). */
  imageQuery?: string;
}

export interface Region {
  id: string;
  name: string;
  emoji: string;
  description: string;
  groups: DishGroup[];
}

export interface Cuisine {
  id: string;
  label: string;
  emoji: string;
  description: string;
  regions: Region[];
}

function group(
  id: string,
  name: string,
  emoji: string,
  description: string,
  varieties: string[],
  imageQuery?: string
): DishGroup {
  return { id, name, emoji, description, varieties: varieties.map((n) => ({ name: n })), imageQuery };
}

export const EXPLORE_DATA: Cuisine[] = [
  {
    id: "indian",
    label: "Indian",
    emoji: "🇮🇳",
    description: "Bold spices, slow-cooked gravies, and centuries of regional variety.",
    regions: [
      {
        id: "north-indian",
        name: "North Indian",
        emoji: "🍛",
        description: "Rich gravies, tandoor breads, and dairy-forward comfort food.",
        groups: [
          group("butter-dishes", "Butter Curries", "🧈", "Silky, tomato-and-cream based gravies.", [
            "Butter Chicken", "Paneer Butter Masala",
          ]),
          group("legumes-nc", "Legumes & Rice", "🍚", "Slow-cooked lentils and hearty rice mains.", [
            "Chole Bhature", "Rajma Chawal", "Dal Makhani",
          ], "indian dal lentils rice bowl food"),
          group("breads", "Griddle & Tandoor Breads", "🫓", "Fresh-baked breads straight off the tawa or tandoor.", [
            "Naan", "Kulcha",
          ]),
          group("paratha", "Paratha", "🥞", "Layered, stuffed flatbreads pan-fried till golden.", [
            "Aloo Paratha", "Gobi Paratha", "Paneer Paratha", "Methi Paratha", "Lachha Paratha",
          ]),
        ],
      },
      {
        id: "south-indian",
        name: "South Indian",
        emoji: "🥥",
        description: "Fermented batters, coconut, curry leaves, and steamed comfort food.",
        groups: [
          group("dosa", "Dosa", "🌯", "Crisp, fermented rice-and-lentil crepes.", [
            "Plain Dosa", "Masala Dosa", "Rava Dosa", "Onion Dosa", "Set Dosa",
            "Neer Dosa", "Pesarattu", "Cheese Dosa", "Mysore Masala Dosa", "Paper Dosa",
          ]),
          group("idli", "Idli", "⚪", "Steamed, fluffy fermented rice cakes.", [
            "Plain Idli", "Rava Idli", "Kanchipuram Idli", "Mini Idli", "Stuffed Idli", "Millet Idli",
          ]),
          group("pongal", "Pongal", "🍲", "Comforting rice-and-lentil porridge, savory or sweet.", [
            "Ven Pongal", "Sweet Pongal", "Millet Pongal", "Vegetable Pongal",
          ], "sweet pongal dessert bowl food"),
          group("rice", "Rice Varieties", "🍋", "Tangy, spiced, and aromatic one-pot rice dishes.", [
            "Lemon Rice", "Tamarind Rice", "Curd Rice", "Coconut Rice", "Tomato Rice",
          ], "steamed rice bowl food"),
          group("more-south", "Upma, Uttapam & More", "🥘", "Everyday South Indian breakfast staples.", [
            "Upma", "Uttapam", "Vada", "Rasam",
          ]),
        ],
      },
      {
        id: "east-indian",
        name: "East Indian",
        emoji: "🐟",
        description: "Mustard oil, fish, and delicately sweet finishes.",
        groups: [
          group("east-mains", "Everyday Mains", "🍛", "Rustic, homestyle East Indian classics.", [
            "Litti Chokha", "Pakhala Bhata", "Macher Jhol", "Aloo Posto", "Ghugni",
          ]),
          group("east-sweets", "Sweets", "🍮", "Delicate milk-based desserts.", ["Mishti Doi"]),
        ],
      },
      {
        id: "west-indian",
        name: "West Indian",
        emoji: "🌶️",
        description: "Tangy, spiced street snacks and steamed savory cakes.",
        groups: [
          group("west-mains", "Street-Style Mains", "🍞", "Bombay-street classics loaded with chutneys.", [
            "Pav Bhaji", "Misal Pav", "Dal Dhokli", "Undhiyu",
          ]),
          group("west-snacks", "Steamed & Griddled Snacks", "🧁", "Light, tangy Gujarati favorites.", [
            "Dhokla", "Thepla", "Handvo",
          ]),
        ],
      },
      {
        id: "street-food",
        name: "Street Food",
        emoji: "🥟",
        description: "Tangy, crunchy, fast, and endlessly craveable.",
        groups: [
          group("puri", "Puri Chaats", "💥", "Crisp shells bursting with tangy water and chutneys.", [
            "Pani Puri", "Bhel Puri", "Sev Puri",
          ]),
          group("fried-snacks", "Fried Snacks", "🥠", "Golden, crunchy, and best eaten piping hot.", [
            "Vada Pav", "Samosa", "Kachori",
          ]),
          group("chaat", "Chaat", "🥗", "Layered sweet, tangy, and spicy street bites.", ["Chaat"]),
        ],
      },
    ],
  },
  {
    id: "italian",
    label: "Italian",
    emoji: "🇮🇹",
    description: "Simple ingredients, technique-driven classics, and regional pasta traditions.",
    regions: [
      {
        id: "northern-italian",
        name: "Northern Italian",
        emoji: "🧈",
        description: "Butter, cream, and rice-forward comfort dishes.",
        groups: [
          group("risotto", "Risotto", "🍚", "Slow-stirred, creamy Arborio rice.", [
            "Risotto alla Milanese", "Mushroom Risotto", "Seafood Risotto",
          ]),
          group("north-pasta", "Cream & Butter Pasta", "🍝", "Rich, silky sauces from the north.", [
            "Fettuccine Alfredo", "Tagliatelle al Ragù",
          ]),
        ],
      },
      {
        id: "southern-italian",
        name: "Southern Italian",
        emoji: "🍅",
        description: "Sun-ripened tomatoes, olive oil, and bold garlic.",
        groups: [
          group("south-pasta", "Tomato Pasta", "🍅", "Bright, garlicky tomato-based classics.", [
            "Spaghetti alla Puttanesca", "Penne all'Arrabbiata", "Spaghetti Aglio e Olio",
          ]),
          group("pizza", "Pizza", "🍕", "Wood-fired, thin-crust Neapolitan classics.", [
            "Margherita Pizza", "Marinara Pizza",
          ]),
        ],
      },
      {
        id: "classic-italian",
        name: "Classic Comfort",
        emoji: "🧀",
        description: "The dishes everyone requests by name.",
        groups: [
          group("classics", "Weeknight Classics", "🍽️", "Familiar, crowd-pleasing Italian-American staples.", [
            "Spaghetti Carbonara", "Lasagna", "Chicken Parmigiana",
          ]),
        ],
      },
    ],
  },
  {
    id: "healthy",
    label: "Healthy",
    emoji: "🥗",
    description: "Light, nutrient-dense meals built around whole ingredients.",
    regions: [
      {
        id: "grain-bowls",
        name: "Grain Bowls",
        emoji: "🌾",
        description: "Balanced bowls layering grains, protein, and veg.",
        groups: [
          group("bowls", "Bowls", "🥣", "Build-your-own style balanced bowls.", [
            "Quinoa Buddha Bowl", "Brown Rice Power Bowl", "Chickpea Grain Bowl",
          ]),
        ],
      },
      {
        id: "salads",
        name: "Salads",
        emoji: "🥬",
        description: "Crisp, fresh, and dressed with light vinaigrettes.",
        groups: [
          group("salads-g", "Salads", "🥙", "Fresh vegetable-forward salads.", [
            "Greek Salad", "Avocado Chickpea Salad", "Spinach & Berry Salad",
          ]),
        ],
      },
      {
        id: "lean-protein",
        name: "Lean Protein",
        emoji: "🍗",
        description: "High-protein mains built for muscle and energy.",
        groups: [
          group("lean", "Lean Mains", "🐟", "Grilled and roasted protein-forward dishes.", [
            "Grilled Lemon Chicken", "Baked Salmon", "Tofu Stir-Fry",
          ]),
        ],
      },
    ],
  },
  {
    id: "quick",
    label: "Quick",
    emoji: "⚡",
    description: "On the table in 20 minutes or less.",
    regions: [
      {
        id: "one-pan",
        name: "One-Pan",
        emoji: "🍳",
        description: "Minimal cleanup, maximum flavor.",
        groups: [
          group("one-pan-g", "One-Pan Mains", "🍳", "Everything cooked in a single pan.", [
            "Veggie Fried Rice", "One-Pan Garlic Shrimp", "Sheet-Pan Chicken Fajitas",
          ]),
        ],
      },
      {
        id: "pantry",
        name: "Pantry Staples",
        emoji: "🥫",
        description: "Built from what's already in your cupboard.",
        groups: [
          group("pantry-g", "Pantry Meals", "🥫", "Simple meals from shelf-stable staples.", [
            "Egg Fried Rice", "Garlic Butter Pasta", "Beans on Toast",
          ]),
        ],
      },
    ],
  },
  {
    id: "vegetarian",
    label: "Vegetarian",
    emoji: "🥕",
    description: "Plant-forward mains that don't miss the meat.",
    regions: [
      {
        id: "veg-mains",
        name: "Hearty Mains",
        emoji: "🍆",
        description: "Filling, satisfying meat-free centerpieces.",
        groups: [
          group("veg-mains-g", "Mains", "🍆", "Substantial vegetarian centerpieces.", [
            "Eggplant Parmesan", "Stuffed Bell Peppers", "Mushroom Stroganoff",
          ]),
        ],
      },
      {
        id: "veg-curries",
        name: "Curries",
        emoji: "🍛",
        description: "Spiced, saucy vegetable-forward curries.",
        groups: [
          group("veg-curry-g", "Curries", "🍛", "Comforting plant-based curries.", [
            "Chana Masala", "Vegetable Korma", "Palak Tofu",
          ]),
        ],
      },
    ],
  },
  {
    id: "dessert",
    label: "Dessert",
    emoji: "🍰",
    description: "Sweet finishes, from quick bakes to no-cook treats.",
    regions: [
      {
        id: "baked",
        name: "Baked",
        emoji: "🧁",
        description: "Oven-baked classics.",
        groups: [
          group("baked-g", "Baked Treats", "🧁", "Classic oven-baked desserts.", [
            "Chocolate Chip Cookies", "Brownies", "Banana Bread",
          ]),
        ],
      },
      {
        id: "no-bake",
        name: "No-Bake",
        emoji: "🍨",
        description: "Sweet treats that need no oven at all.",
        groups: [
          group("no-bake-g", "No-Bake Treats", "🍨", "Chilled or raw sweet treats.", [
            "Tiramisu", "Chocolate Mousse", "No-Bake Cheesecake",
          ]),
        ],
      },
    ],
  },
];

export function findCuisine(id: string) {
  return EXPLORE_DATA.find((c) => c.id === id) ?? null;
}

export function findRegion(cuisineId: string, regionId: string) {
  return findCuisine(cuisineId)?.regions.find((r) => r.id === regionId) ?? null;
}

export function findGroup(cuisineId: string, regionId: string, groupId: string) {
  return findRegion(cuisineId, regionId)?.groups.find((g) => g.id === groupId) ?? null;
}

/** Sibling varieties within the same dish group, excluding the given one — used for "you might also like". */
export function getSiblingVarieties(
  cuisineId: string,
  regionId: string,
  groupId: string,
  excludeName: string
): string[] {
  const g = findGroup(cuisineId, regionId, groupId);
  if (!g) return [];
  return g.varieties.map((v) => v.name).filter((n) => n !== excludeName);
}
