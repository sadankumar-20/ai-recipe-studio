import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, Star, ChefHat } from "lucide-react";
import { useRecipeStore } from "../../store/recipeStore";
import { submitFeedback } from "../../services/recipe.service";
import Button from "../ui/Button";

export default function PreparedFeedback({ recipeTitle }: { recipeTitle: string }) {
  const { isPrepared, markPrepared } = useRecipeStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitFeedback({ recipeTitle, rating: rating || 5, comment });
    } catch {
      // Feedback storage is best-effort; failure never blocks the celebration.
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  if (!isPrepared) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-6 text-center">
        <ChefHat size={22} className="mx-auto mb-3 text-accent" />
        <p className="mb-4 text-sm text-white/60">Finished cooking?</p>
        <Button type="button" onClick={markPrepared} icon={<PartyPopper size={16} />}>
          I made this!
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-3xl border border-accent/40 bg-accent-soft/5 p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl"
      >
        👍
      </motion.div>
      <h2 className="text-xl font-semibold text-white">Congratulations, chef!</h2>
      <p className="mt-1 text-sm text-white/50">You made {recipeTitle}. Nicely done.</p>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-5 max-w-sm"
          >
            <p className="mb-2 text-xs uppercase tracking-wide text-white/40">Rate this recipe</p>
            <div className="mb-4 flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                  className="focus-ring rounded-full p-1"
                >
                  <Star
                    size={22}
                    className={n <= rating ? "fill-accent text-accent" : "text-white/20"}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any notes for next time? (optional)"
              rows={2}
              className="focus-ring w-full resize-none rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-white placeholder:text-white/30"
            />
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-3 w-full justify-center"
            >
              {submitting ? "Sending..." : "Submit feedback"}
            </Button>
          </motion.div>
        ) : (
          <motion.p
            key="thanks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 text-sm text-white/60"
          >
            Thanks — your feedback was saved. Happy cooking! 🎉
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
