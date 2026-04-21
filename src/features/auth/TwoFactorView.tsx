import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import logoImg from "@/assets/images/logo_nobg.png";
import { IconMailOpened, IconQrcode, IconRefresh } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // 60 seconds

const PARTNER_BRANDS = [
  "Document Control",
  "Training Management",
  "Deviations & NCs",
  "Reports & Analytics",
  "Audit Trail",
  "... and more",
];

// ============================================================================
// TYPES
// ============================================================================

interface TwoFactorViewProps {
  onVerify?: (payload: {
    code: string;
    method: 'email' | 'app';
    rememberDevice: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  onResend?: (method: 'email') => Promise<{ success: boolean; error?: string }>;
  onBackToLogin?: () => void;
  email?: string; // Masked email address
  username?: string;
  availableMethods?: Array<'email' | 'app'>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TwoFactorView: React.FC<TwoFactorViewProps> = ({
  onVerify,
  onResend,
  onBackToLogin,
  email = "a***n@eqms.com",
  username = "Unknown User",
  availableMethods = ['email', 'app'],
}) => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [method, setMethod] = useState<'email' | 'app' | null>(null);
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Resend timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (method !== 'email') {
      return;
    }

    setCanResend(false);
    setResendTimer(RESEND_COOLDOWN);

    if (!onResend) {
      return;
    }

    (async () => {
      const result = await onResend('email');
      if (!result.success) {
        setError(result.error || 'Unable to send email verification code.');
      }
    })();
  }, [method, onResend]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value)) && value !== "") return;

    const newOtp = [...otp];
    // Take only the last character if multiple characters are pasted/typed
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError("");

    // Move to next input if value is entered
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH)
      .split("");
    const newOtp = [...otp];

    pastedData.forEach((char, index) => {
      if (!isNaN(Number(char))) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);

    // Focus the last filled input or the first empty one
    const lastIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleResend = useCallback(async () => {
    if (!canResend) return;

    if (!onResend) {
      return;
    }

    const result = await onResend('email');
    if (!result.success) {
      setError(result.error || 'Unable to resend code. Please try again.');
      return;
    }

    // Reset timer
    setCanResend(false);
    setResendTimer(RESEND_COOLDOWN);
  }, [canResend, onResend]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const code = otp.join("");

      if (code.length < OTP_LENGTH) {
        setError("Please enter all 6 digits");
        return;
      }

      if (!method) {
        setError("Please choose a verification method first");
        return;
      }

      if (!onVerify) {
        setError("Verification handler is not configured");
        return;
      }

      setIsLoading(true);
      setError("");

      const result = await onVerify({
        code,
        method,
        rememberDevice,
      });

      setIsLoading(false);

      if (result.success) {
        blurActiveInput();
        resetViewportZoom();
        return;
      }

      setError(result.error || "Invalid verification code. Please try again.");
      setOtp(new Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    },
    [method, onVerify, otp, rememberDevice]
  );

  const emailMethodEnabled = availableMethods.includes('email');
  const appMethodEnabled = availableMethods.includes('app');

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-white p-0 sm:bg-slate-200 sm:p-6 lg:p-8" role="main">
      {isLoading && <FullPageLoading text="Verifying code..." />}
      <div className="mx-auto w-full max-w-[1160px] overflow-hidden rounded-none sm:rounded-2xl bg-transparent shadow-none sm:shadow-[0_14px_36px_rgba(15,23,42,0.16)] lg:shadow-[0_24px_48px_rgba(15,23,42,0.18)]">
        <div className="grid min-h-screen min-h-dvh w-full grid-cols-1 sm:min-h-[600px] lg:min-h-[640px] lg:grid-cols-2 xl:min-h-[720px]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center border-0 sm:border border-slate-200/90 bg-white px-6 py-10 sm:px-10 sm:py-10 lg:px-16 lg:py-12 xl:px-20"
          >
            <div className="flex flex-1 w-full max-w-[340px] flex-col justify-center sm:max-w-[420px]">
              <div className="mb-6 flex items-center gap-3 text-slate-900 sm:mb-10 lg:mb-12">
                <img
                  src={logoImg}
                  alt="EQMS Logo"
                  className="h-8 w-auto object-contain sm:h-9"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="min-h-[360px] sm:min-h-[420px]">
                <AnimatePresence mode="wait" initial={false}>
                  {!method ? (
                    <motion.div
                      key="selection"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="space-y-6 sm:space-y-5"
                    >
                    <div className="space-y-2 sm:space-y-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Verify Your Identity</h1>
                      <p className="text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
                        Select a verification method for account <span className="font-semibold text-slate-700">{username}</span>.
                      </p>
                    </div>

                    <div className="space-y-4 sm:space-y-3">
                      <button
                        type="button"
                        onClick={() => setMethod("email")}
                        disabled={!emailMethodEnabled}
                        className="group flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white p-2.5 text-left transition-colors hover:border-teal-700/40 hover:bg-teal-50/30 sm:p-4"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-slate-600">
                            <IconMailOpened size={26} stroke={1.5} className="h-[26px] w-[26px] sm:h-[30px] sm:w-[30px]" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 sm:text-sm">Email Authentication</p>
                            <p className="text-xs text-slate-500">Receive the code at {email}</p>
                          </div>
                        </div>
                        {!emailMethodEnabled && <span className="text-xs font-medium text-slate-400">Unavailable</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethod("app")}
                        disabled={!appMethodEnabled}
                        className="group flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white p-2.5 text-left transition-colors hover:border-teal-700/40 hover:bg-teal-50/30 sm:p-4"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-slate-600">
                            <IconQrcode size={26} stroke={1.5} className="h-[26px] w-[26px] sm:h-[30px] sm:w-[30px]" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 sm:text-sm">Authenticator App</p>
                            <p className="text-xs text-slate-500">Use code from your authenticator app</p>
                          </div>
                        </div>
                        {!appMethodEnabled && <span className="text-xs font-medium text-slate-400">Unavailable</span>}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={onBackToLogin}
                      className="group inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 focus-visible:text-slate-700 sm:text-sm"
                    >
                      <span
                        className="inline-flex w-0 -translate-x-1 items-center overflow-hidden opacity-0 transition-all duration-200 group-hover:mr-2 group-hover:w-4 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:mr-2 group-focus-visible:w-4 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                        aria-hidden="true"
                      >
                        <ArrowLeft size={16} />
                      </span>
                      <span>Back to Sign In</span>
                    </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="otp-form"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onSubmit={handleSubmit}
                      className="flex flex-col justify-start space-y-5 sm:justify-center sm:space-y-6"
                    >
                    <div className="space-y-2 sm:space-y-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Enter Verification Code</h1>
                      <p className="text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
                        {method === "email"
                          ? <>Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{email}</span>.</>
                          : <>Enter the 6-digit code from your authenticator app.</>}
                      </p>
                    </div>

                    {error && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className={cn(
                            "h-12 w-full rounded-[10px] border text-center text-xl font-semibold outline-none transition-all sm:h-14 sm:text-xl",
                            "focus:ring-2 focus:ring-teal-800/20",
                            digit
                              ? "border-teal-700/50 bg-teal-50/40 text-teal-800"
                              : "border-slate-300 bg-white focus:border-teal-700"
                          )}
                        />
                      ))}
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full rounded-[10px] bg-teal-900 text-sm font-medium text-white transition-colors hover:bg-teal-950 sm:h-12 sm:text-base mt-2"
                      disabled={isLoading || otp.join("").length < OTP_LENGTH}
                    >
                      Submit
                    </Button>

                    <Checkbox
                      id="rememberDevice"
                      checked={rememberDevice}
                      onChange={setRememberDevice}
                      label="Remember this device for 8 hours"
                      labelClassName="text-xs text-slate-600 sm:text-sm"
                      disabled={isLoading}
                    />

                    <div className="flex flex-col items-start gap-2 pt-0.5 sm:gap-3 sm:pt-1">
                      {method === "email" && (
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={!canResend || isLoading}
                          className={cn(
                            "flex items-center gap-2 text-xs font-semibold transition-colors sm:text-sm",
                            canResend ? "text-teal-700 hover:text-teal-800" : "cursor-not-allowed text-slate-500"
                          )}
                        >
                          <IconRefresh
                            size={16}
                            className={cn(!canResend ? "animate-spin opacity-80" : "opacity-100")}
                            style={!canResend ? { animationDuration: "2s" } : {}}
                          />
                          {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setMethod(null);
                          setOtp(new Array(OTP_LENGTH).fill(""));
                          setError("");
                        }}
                        className="group inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 focus-visible:text-slate-700 sm:text-sm"
                        disabled={isLoading}
                      >
                        <span
                          className="inline-flex w-0 -translate-x-1 items-center overflow-hidden opacity-0 transition-all duration-200 group-hover:mr-2 group-hover:w-4 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:mr-2 group-focus-visible:w-4 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                          aria-hidden="true"
                        >
                          <ArrowLeft size={16} />
                        </span>
                        <span>Change verification method</span>
                      </button>
                    </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
            className="relative hidden overflow-hidden bg-[#053f46] px-8 py-10 text-white lg:flex lg:flex-col xl:px-12 xl:py-14"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_6%,rgba(146,224,224,0.35),transparent_30%)]" />

            <div className="relative z-10 mt-10 max-w-[460px] space-y-6 xl:mt-24 xl:space-y-8">
              <h2 className="text-3xl font-medium leading-[1.2] tracking-tight text-teal-50 lg:text-4xl xl:text-5xl">
                Multi-Factor Security for Regulated Quality Systems
              </h2>
              <p className="text-base leading-8 text-teal-100/90">
                Every sign-in step is verified and traceable to protect critical GMP records, audit trails, and operational workflows.
              </p>
            </div>

            <div className="relative z-10 mt-auto pt-10 xl:pt-16">
              <div className="mb-7 flex items-center gap-5">
                <span className="text-xs uppercase tracking-[0.14em] text-teal-200/80">EQMS Modules</span>
                <span className="h-px flex-1 bg-teal-200/30" />
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-4 text-sm font-medium text-teal-100/90">
                {PARTNER_BRANDS.map((brand) => (
                  <span key={brand}>{brand}</span>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};
