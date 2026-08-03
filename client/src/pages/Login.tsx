import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { requestOtp, verifyOtp, AuthServiceError } from "../services/auth.service";
import Button from "../components/ui/Button";

type Step = "email" | "otp";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const redirectTo = (location.state as { from?: string })?.from ?? "/";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await requestOtp(email.trim());
      setDevOtp(result.devOtp ?? null);
      setStep("otp");
    } catch (err) {
      setError(err instanceof AuthServiceError ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyOtp(email.trim(), otp.trim(), rememberDevice);
      setSession(result.token, result.user, rememberDevice);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof AuthServiceError ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      {/* Blurry background collage */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center blur-md scale-110"
        style={{ backgroundImage: "url(/images/food-collage.jpg)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-ink/75" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-3xl border border-line bg-surface/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-black">
            <ChefHat size={22} />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-white">AI Recipe Studio</h1>
          <p className="mt-1 text-sm text-white/45">
            {step === "email" ? "Enter your email to continue" : "Enter the code we sent"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <label className="mb-1.5 block text-xs font-medium text-white/50">Email address</label>
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4 py-3 transition-colors focus-within:border-white/25 focus-within:ring-1 focus-within:ring-accent/20">
                <Mail size={16} className="text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                  placeholder="you@example.com"
                  autoFocus
                  className="focus-ring-soft w-full bg-transparent text-sm text-white placeholder:text-white/30"
                />
              </div>

              <Button
                type="button"
                onClick={handleRequestOtp}
                disabled={!email.trim() || isLoading}
                className="w-full justify-center"
              >
                {isLoading ? "Sending..." : "Get OTP"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError(null);
                }}
                className="focus-ring mb-4 flex items-center gap-1.5 text-xs text-white/40 hover:text-white"
              >
                <ArrowLeft size={12} /> Change email
              </button>

              <label className="mb-1.5 block text-xs font-medium text-white/50">
                6-digit code sent to {email}
              </label>
              <div className="mb-2 flex items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4 py-3 transition-colors focus-within:border-white/25 focus-within:ring-1 focus-within:ring-accent/20">
                <ShieldCheck size={16} className="text-white/40" />
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  placeholder="123456"
                  autoFocus
                  className="focus-ring-soft w-full bg-transparent text-sm tracking-[0.3em] text-white placeholder:text-white/30"
                />
              </div>

              {devOtp && (
                <p className="mb-4 text-xs text-white/35">
                  Demo mode — no email provider configured. Your code is{" "}
                  <span className="font-semibold text-accent">{devOtp}</span>.
                </p>
              )}

              <label className="mb-4 flex items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-line accent-orange-500"
                />
                Remember this device
              </label>

              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || isLoading}
                className="w-full justify-center"
              >
                {isLoading ? "Verifying..." : "Log in"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-300"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
