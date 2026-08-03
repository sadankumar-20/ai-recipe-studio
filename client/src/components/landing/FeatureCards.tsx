import { motion } from "framer-motion";
import { Sparkles, ListChecks, SlidersHorizontal } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Generated Recipes",
    tagline: "Every dish, freshly written by AI",
    body: "Every recipe is generated live by Groq's AI from your exact ingredients or a dish you pick — not a static database entry. It comes back as structured, schema-validated data and is rendered into real UI, never dumped as a wall of chat text.",
  },
  {
    icon: ListChecks,
    title: "Interactive Workspace",
    tagline: "Built to actually cook from",
    body: "A tappable ingredient checklist with a live progress bar, flippable step cards that reveal a chef's tip on the back, real food photography, and nutrition at a glance — this is a kitchen tool, not an article.",
  },
  {
    icon: SlidersHorizontal,
    title: "Adaptive Servings",
    tagline: "Cooking for 2 or a crowd of 12",
    body: "Drag the serving slider from 1 to 8 and every ingredient quantity recalculates instantly in front of you — no mental math, no re-generating the whole recipe just because your headcount changed.",
  },
];

export default function FeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid gap-5 sm:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-line bg-surface p-7"
          >
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft/10 text-accent">
              <f.icon size={20} />
            </span>
            <h3 className="text-lg font-bold tracking-tight text-white">{f.title}</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">
              {f.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/55">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
