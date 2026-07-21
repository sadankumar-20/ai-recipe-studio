import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function CookingTips({ tips }: { tips: string[] }) {
  if (tips.length === 0) return null;

  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-white">Chef's Tips</h2>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4"
          >
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-sm leading-relaxed text-white/70">{tip}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
