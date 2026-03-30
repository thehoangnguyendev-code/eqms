import React, { useState, useEffect, useCallback, useRef } from "react";
import { ShieldCheck, ArrowLeft, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import logoImg from "@/assets/images/logo_nobg.png";
import { AUTH_SLIDE_IMAGES, CAROUSEL_INTERVAL } from "./authCarousel";
import { IconAuth2fa, IconRefresh } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const OTP_LENGTH = 6;
const VERIFICATION_SIMULATION_DELAY = 2000;
const RESEND_COOLDOWN = 60; // 60 seconds

const SLIDE_CONTENT = [
  {
    tag: "Enhanced Security",
    title: "Multi-Factor Protection",
    description: "Protecting your GxP data with enterprise-grade security layers and immutable audit trails for every access point."
  },
  {
    tag: "Data Integrity",
    title: "Secure Digital Presence",
    description: "Ensuring that every interaction with the EQMS platform is verified, authorized, and captured within our secure ecosystem."
  }
];

// ============================================================================
// TYPES
// ============================================================================

interface TwoFactorViewProps {
  onVerify?: (code: string) => void;
  onBackToLogin?: () => void;
  email?: string; // Masked email address
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TwoFactorView: React.FC<TwoFactorViewProps> = ({
  onVerify,
  onBackToLogin,
  email = "a***n@eqms.com"
}) => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [method, setMethod] = useState<'email' | 'app' | null>(null);
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_CONTENT.length);
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  // Resend timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
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
    <div className="min-h-screen w-full flex overflow-hidden" role="main">
      {isLoading && <FullPageLoading text="Verifying code..." />}

      {/* LEFT SIDE - BRANDING (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 p-4 lg:p-6 items-center justify-center bg-white">
        <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-slate-900 ring-1 ring-slate-900/5">
          <div className="absolute inset-0 z-0">
            {AUTH_SLIDE_IMAGES.slice(0, 2).map((slide, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-all duration-[1500ms] ease-out",
                  index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"
                )}
              >
                <img src={slide} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 z-20 p-12 xl:p-16 flex flex-col justify-end">
            <div className="max-w-xl">
              <div className="relative h-[180px] mb-6">
                {SLIDE_CONTENT.map((content, index) => (
                  <div
                    key={index}
                    className={cn(
                      "absolute bottom-0 left-0 w-full transition-all duration-700 ease-out transform",
                      index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-0.5 bg-emerald-500 rounded-full"></span>
                      <span className="text-emerald-400 font-bold tracking-wider text-xs uppercase">{content.tag}</span>
                    </div>
                    <h2 className="text-4xl font-bold leading-tight text-white mb-4 tracking-tight">
                      {content.title}
                    </h2>
                    <p className="text-lg text-slate-300 leading-relaxed font-light">
                      {content.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - 2FA FORM */}
      <div className="w-full lg:w-1/2 xl:w-2/5 relative flex flex-col lg:flex-row items-center justify-center p-6 sm:p-8 lg:p-12 bg-[#0c3547] lg:bg-white">
        {/* Mobile-only Logo */}
        <div className="w-full max-w-md flex items-center gap-3 mb-6 lg:hidden">
          <img
            src={logoImg}
            alt="QMS Logo"
            className="h-10 w-auto object-contain drop-shadow-sm"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white overflow-hidden rounded-2xl shadow-2xl lg:shadow-none p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="hidden lg:inline-flex items-center justify-center mb-6">
                <img
                  src={logoImg}
                  alt="QMS Logo"
                  className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Two-Step Verification</h1>
              <p className="text-slate-500 text-sm max-w-auto mx-auto leading-relaxed">
                {!method
                  ? "Choose how you want to receive your verification code to continue."
                  : method === 'email'
                    ? <>Please enter the 6-digit code sent to <span className="font-semibold text-slate-800">{email}</span></>
                    : <>Please enter the 6-digit code from your <span className="font-semibold text-slate-800">Authenticator app</span></>
                }
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
            {!method ? (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-3"
              >
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className="group relative flex items-center gap-4 p-5 rounded-2xl border border-slate-300 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-emerald-500/5 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-100 group-hover:bg-emerald-50 transition-all duration-300">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Email Verification</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Send a code to {email}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('app')}
                  className="group relative flex items-center gap-4 p-5 rounded-2xl border border-slate-300 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-emerald-500/5 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-100 group-hover:bg-emerald-50 transition-all duration-300">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Authenticator App</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Use Google Authenticator or similar</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit} 
                className="space-y-8"
              >
                {/* OTP Input Group */}
                <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
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
                        "w-full h-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all duration-200 outline-none",
                        digit
                          ? "border-emerald-500 bg-emerald-50/30 text-emerald-700 ring-2 ring-emerald-500/10"
                          : "border-slate-200 bg-slate-50 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      )}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="rounded-xl w-full h-12 mt-3 text-base font-semibold shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group flex items-center justify-center gap-2"
                    disabled={isLoading || otp.join("").length < OTP_LENGTH}
                  >
                    <span>Verify Account</span>
                  </Button>

                  <div className="flex flex-col items-center gap-4 pt-2">
                    {method === 'email' && (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend || isLoading}
                        className={cn(
                          "flex items-center gap-2 text-sm font-semibold transition-colors",
                          canResend
                            ? "text-emerald-600 hover:text-emerald-700"
                            : "text-slate-500 cursor-not-allowed"
                        )}
                      >
                        <IconRefresh
                          size={16}
                          className={cn(
                            !canResend ? "animate-spin opacity-80" : "opacity-100"
                          )}
                          style={!canResend ? { animationDuration: '2s' } : {}}
                        />
                        {canResend ? "Resend Verification Code" : `Resend in ${resendTimer}s`}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMethod(null);
                        setOtp(new Array(OTP_LENGTH).fill(""));
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                      disabled={isLoading}
                    >
                      <ArrowLeft size={16} />
                      Choose another method
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
            </AnimatePresence>

            {/* Footer Help */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lost access to your email or authenticator? Please contact your <button className="text-emerald-600 font-semibold hover:underline">System Administrator</button> for emergency recovery.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
