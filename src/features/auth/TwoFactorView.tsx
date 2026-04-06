import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import logoImg from "@/assets/images/logo_nobg.png";
import { IconMailOpened, IconQrcode, IconRefresh } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthBranding } from "./AuthBranding";

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
    <div className="min-h-screen w-full flex overflow-hidden relative bg-white" role="main">
      {/* Grid Pattern Background - Unified for all screens */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.9]"
        style={{
          backgroundImage: `linear-gradient(#f1f5f9 1.5px, transparent 1.5px), linear-gradient(90deg, #f1f5f9 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px'
        }}
      />
      {isLoading && <FullPageLoading text="Verifying code..." />}

      {/* LEFT SIDE - BRANDING (Desktop) */}
      <AuthBranding slides={SLIDE_CONTENT} />

      {/* RIGHT SIDE - 2FA FORM */}

      {/* RIGHT SIDE - 2FA FORM */}
      <div className="w-full lg:w-1/2 xl:w-2/5 relative flex flex-col lg:flex-row items-center justify-center p-6 sm:p-8 lg:p-12 bg-transparent">

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md z-10"
        >
          <div className="bg-white/95 backdrop-blur-xl overflow-hidden rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-200/60 ring-1 ring-white/20">
            {/* Mobile gradient top bar */}
            <div className="lg:hidden h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />

            <div className="px-6 sm:px-8 pt-8 sm:pt-8 pb-4">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-2">
                  <img
                    src={logoImg}
                    alt="QMS Logo"
                    className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight sm:whitespace-nowrap">
                  Additional Authentication Required
                </h1>
                <p className="text-slate-500 text-sm max-w-auto mx-auto leading-relaxed">
                  {!method
                    ? <>Select default verification method for the account <span className="font-semibold text-slate-800">{username}</span></>
                    : method === 'email'
                      ? <>Enter 6 digit verification code sent to the email registered with the account: <span className="font-semibold text-slate-800">{email}</span></>
                      : <>Enter code shown on Authenticator App with username <span className="font-semibold text-slate-800">{username}</span></>
                  }
                </p>
              </div>

              <div className="py-4">
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
                      <div className="group relative flex items-center justify-between p-4 rounded-2xl border border-slate-200/60 bg-white/50 hover:bg-white hover:border-slate-300 transition-all duration-300 shadow-sm overflow-hidden backdrop-blur-sm">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center text-slate-500">
                            <IconMailOpened size={32} stroke={1.5} className="w-8 h-8 sm:w-10 sm:h-10" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 whitespace-normal">Email Authentication</h3>
                            <p className="text-[12px] sm:text-xs text-slate-500 mt-0.5 whitespace-normal leading-relaxed">Receive a verification code on your registered email</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline-emerald"
                            onClick={() => setMethod('email')}
                          >
                            Select
                          </Button>
                        </div>
                      </div>

                      <div className="group relative flex items-center justify-between p-4 rounded-2xl border border-slate-200/60 bg-white/50 hover:bg-white hover:border-slate-300 transition-all duration-300 shadow-sm overflow-hidden backdrop-blur-sm">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center text-slate-500">
                            <IconQrcode size={32} stroke={1.5} className="w-8 h-8 sm:w-10 sm:h-10" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 whitespace-normal">Authenticator App</h3>
                            <p className="text-[12px] sm:text-xs text-slate-500 mt-0.5 whitespace-normal leading-relaxed">Use the verification code generated by the authenticator app</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline-emerald"
                            onClick={() => setMethod('app')}
                          >
                            Select
                          </Button>
                        </div>
                      </div>

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
                          className="rounded-xl w-full h-12 mt-3 text-base font-semibold shadow-md shadow-emerald-500/10 active:translate-y-0 transition-all duration-200 group flex items-center justify-center gap-2"
                          disabled={isLoading || otp.join("").length < OTP_LENGTH}
                        >
                          <span>Submit</span>
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
                              {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
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
                            Change verification method
                          </button>
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
