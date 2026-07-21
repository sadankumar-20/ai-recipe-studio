import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { clsx } from "clsx";

interface VoiceButtonProps {
  isSupported: boolean;
  isListening: boolean;
  onClick: () => void;
}

export default function VoiceButton({ isSupported, isListening, onClick }: VoiceButtonProps) {
  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      aria-pressed={isListening}
      className={clsx(
        "focus-ring relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
        isListening ? "bg-accent text-black" : "bg-white/5 text-white/70 hover:bg-white/10"
      )}
    >
      <AnimatePresence>
        {isListening && (
          <motion.span
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-accent"
          />
        )}
      </AnimatePresence>
      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
}
