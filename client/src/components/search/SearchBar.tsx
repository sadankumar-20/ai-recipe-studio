import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useIngredientStore } from "../../store/ingredientStore";
import { useIngredientSuggestions } from "../../hooks/useIngredientSuggestions";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import IngredientChip from "./IngredientChip";
import VoiceButton from "./VoiceButton";
import SuggestionsDropdown from "./SuggestionsDropdown";
import Button from "../ui/Button";

interface SearchBarProps {
  onGenerate: () => void;
  isLoading?: boolean;
  autoFocus?: boolean;
}

/**
 * Splits a spoken transcript into separate ingredients. Prefers explicit
 * separators ("," or "and") when present; otherwise falls back to treating
 * each spoken word as its own ingredient, which is how people naturally list
 * single-word pantry items ("sugar milk paneer") without pausing between them.
 */
function parseVoiceIngredients(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const bySeparator = trimmed
    .split(/,|\band\b/gi)
    .map((s) => s.trim())
    .filter(Boolean);
  if (bySeparator.length > 1) return bySeparator;
  return trimmed.split(/\s+/).filter(Boolean);
}

export default function SearchBar({ onGenerate, isLoading, autoFocus }: SearchBarProps) {
  const { ingredients, addIngredient, removeIngredient, removeLast, clear } = useIngredientStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasListeningRef = useRef(false);

  const suggestions = useIngredientSuggestions(query, ingredients);
  const voice = useVoiceInput();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (voice.transcript) setQuery(voice.transcript);
  }, [voice.transcript]);

  // When voice recognition stops, split whatever was said into separate
  // ingredient chips automatically, instead of dumping it in as one chip.
  useEffect(() => {
    if (wasListeningRef.current && !voice.isListening) {
      parseVoiceIngredients(voice.transcript).forEach((item) => addIngredient(item));
      setQuery("");
    }
    wasListeningRef.current = voice.isListening;
  }, [voice.isListening, voice.transcript, addIngredient]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  const commitQuery = () => {
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      addIngredient(suggestions[activeIndex]);
    } else if (query.trim()) {
      addIngredient(query);
    }
    setQuery("");
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitQuery();
    } else if (e.key === "Backspace" && query === "" && ingredients.length > 0) {
      removeLast();
    } else if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setActiveIndex(-1);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex min-h-[64px] w-full flex-wrap items-center gap-2 rounded-[28px] border border-line bg-surface px-4 py-3 shadow-xl transition-colors focus-within:border-white/25 focus-within:ring-1 focus-within:ring-accent/20">
          <AnimatePresence initial={false}>
            {ingredients.map((ing) => (
              <IngredientChip key={ing} label={ing} onRemove={() => removeIngredient(ing)} />
            ))}
          </AnimatePresence>

          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls="ingredient-suggestions"
            aria-autocomplete="list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              ingredients.length === 0
                ? "List the ingredients you have..."
                : "Add another ingredient..."
            }
            className="focus-ring-soft min-w-[120px] flex-1 bg-transparent px-2 py-2 text-[15px] text-white placeholder:text-white/35 sm:min-w-[160px]"
          />

          <VoiceButton
            isSupported={voice.isSupported}
            isListening={voice.isListening}
            onClick={() => (voice.isListening ? voice.stop() : voice.start())}
          />

          {ingredients.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clear();
                inputRef.current?.focus();
              }}
              aria-label="Clear all ingredients"
              className="focus-ring flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
            >
              <X size={13} />
              Clear all
            </button>
          )}

          <Button
            type="button"
            onClick={onGenerate}
            disabled={ingredients.length === 0 || isLoading}
            icon={<Sparkles size={16} />}
            className="w-full shrink-0 sm:w-auto"
          >
            {isLoading ? "Generating..." : "Generate Recipe"}
          </Button>
        </div>

        <div id="ingredient-suggestions">
          <SuggestionsDropdown
            suggestions={suggestions}
            activeIndex={activeIndex}
            onSelect={(item) => {
              addIngredient(item);
              setQuery("");
              inputRef.current?.focus();
            }}
          />
        </div>
      </div>

      {voice.isListening && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 pl-2 text-xs text-white/40"
        >
          Listening... say your ingredients one after another (e.g. "sugar, milk, paneer"), then tap the mic to stop.
        </motion.p>
      )}
    </div>
  );
}
