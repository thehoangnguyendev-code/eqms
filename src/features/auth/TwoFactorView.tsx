import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import logoImg from "@/assets/images/logo_nobg.png";
import { IconMailOpened, IconQrcode, IconRefresh } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const OTP_LENGTH = 6;
const VERIFICATION_SIMULATION_DELAY = 2000;
const RESEND_COOLDOWN = 60; // 60 seconds

const PARTNER_BRANDS = [
  "Discord",
  "Mailchimp",
  "Grammarly",
  "Attentive",
  "HelloSign",
  "Intercom",
  "Square",
  "Dropbox",
];

// ============================================================================
// TYPES
// ============================================================================

interface TwoFactorViewProps {
  onVerify?: (code: string) => void;
  onBackToLogin?: () => void;
  email?: string; // Masked email address
  username?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TwoFactorView: React.FC<TwoFactorViewProps> = ({
  onVerify,
  onBackToLogin,
  email = "a***n@eqms.com",
  username = "Unknown User"
}) => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [method, setMethod] = useState<'email' | 'app' | null>(null);
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH).split("");
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

  const handleResend = useCallback(() => {
    if (!canResend) return;

    // Reset timer
    setCanResend(false);
    setResendTimer(RESEND_COOLDOWN);

    // Simulate resend
    console.log("Resending code...");
  }, [canResend]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const code = otp.join("");

      if (code.length < OTP_LENGTH) {
        setError("Please enter all 6 digits");
        return;
      }

      setIsLoading(true);
      setError("");

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);

        // Demo logic: temporarily allow any 6-digit code to pass
        if (code.length === OTP_LENGTH) {
          blurActiveInput();
          resetViewportZoom();
          if (onVerify) {
            onVerify(code);
          }
        } else {
          setError("Invalid verification code. Please try again.");
          setOtp(new Array(OTP_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        }
      }, VERIFICATION_SIMULATION_DELAY);
    },
    [otp, onVerify]
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-200 px-2 py-2 sm:px-6 sm:py-4 lg:px-8" role="main">
      {isLoading && <FullPageLoading text="Verifying code..." />}
      <div className="mx-auto w-full max-w-[1160px] overflow-hidden rounded-xl bg-transparent shadow-[0_14px_36px_rgba(15,23,42,0.16)] sm:rounded-2xl lg:shadow-[0_24px_48px_rgba(15,23,42,0.18)]">
        <div className="grid w-full grid-cols-1 lg:min-h-[640px] lg:grid-cols-2 xl:min-h-[720px]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-center justify-center border border-slate-200/90 bg-white px-6 py-6 sm:px-10 sm:py-10 lg:px-16 lg:py-12 xl:px-20"
          >
            <div className="w-full max-w-[300px] sm:max-w-[420px]">
              <div className="mb-4 flex items-center gap-3 text-slate-900 sm:mb-10 lg:mb-12">
                <img
                  src={logoImg}
                  alt="EQMS Logo"
                  className="h-7 w-auto object-contain sm:h-9"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <AnimatePresence mode="wait">
                {!method ? (
                  <motion.div
                    key="selection"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3 sm:space-y-5"
                  >
                    <div className="space-y-1.5 sm:space-y-3">
                      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Verify Your Identity</h1>
                      <p className="text-xs leading-5 text-slate-500 sm:text-sm sm:leading-7">
                        Select a verification method for account <span className="font-semibold text-slate-700">{username}</span>.
                      </p>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <button
                        type="button"
                        onClick={() => setMethod("email")}
                        className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-left transition-colors hover:border-teal-700/40 hover:bg-teal-50/30 sm:p-4"
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
                        
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethod("app")}
                        className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-left transition-colors hover:border-teal-700/40 hover:bg-teal-50/30 sm:p-4"
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSubmit}
                    className="space-y-3 sm:space-y-6"
                  >
                    <div className="space-y-1.5 sm:space-y-3">
                      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Enter Verification Code</h1>
                      <p className="text-xs leading-5 text-slate-500 sm:text-sm sm:leading-7">
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

                    <div className="flex justify-between gap-1.5 sm:gap-3" onPaste={handlePaste}>
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
                            "h-10 w-full rounded-[10px] border text-center text-base font-semibold outline-none transition-all sm:h-14 sm:text-xl",
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
                      className="h-10 w-full rounded-[10px] bg-teal-900 text-sm font-medium text-white transition-colors hover:bg-teal-950 sm:h-12 sm:text-base"
                      disabled={isLoading || otp.join("").length < OTP_LENGTH}
                    >
                      Submit
                    </Button>

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
                        }}
                        className="flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 sm:text-sm"
                        disabled={isLoading}
                      >
                        <ArrowLeft size={16} />
                        Change verification method
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
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
                <span className="text-xs uppercase tracking-[0.14em] text-teal-200/80">Trusted by teams</span>
                <span className="h-px flex-1 bg-teal-200/30" />
              </div>
              <div className="grid grid-cols-4 gap-x-4 gap-y-4 text-sm font-semibold text-teal-100/90">
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
