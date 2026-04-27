import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  IconMailOpened,
  IconQrcode,
  IconShieldCheck,
  IconRefresh,
  IconCheck,
  IconCopy
} from "@tabler/icons-react";
import { Smartphone } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { AUTH_UI } from "./auth-ui";
import { AuthInfoPanel, AuthLayout, AuthBackLink } from "./components";
import logoImg from "@/assets/images/logo_nobg.png";

// Import the generated QR code mockup
import qrMockup from "@/assets/images/mockups/qr_auth.png";

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

type MfaMethod = "email" | "app";
type SetupStep = "selection" | "config" | "success";

interface MfaSetupViewProps {
  onComplete?: () => void;
  onBack?: () => void;
  email?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MfaSetupView: React.FC<MfaSetupViewProps> = ({
  onComplete,
  onBack,
  email = "a***n@eqms.com"
}) => {
  const [step, setStep] = useState<SetupStep>("selection");
  const [method, setMethod] = useState<MfaMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleMethodSelect = (selectedMethod: MfaMethod) => {
    setMethod(selectedMethod);
    setStep("config");
    setOtp(new Array(6).fill(""));
    setError("");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value)) && value !== "") return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, '')
      .slice(0, 6)
      .split("");
    const newOtp = [...otp];

    pastedData.forEach((char, index) => {
      if (!isNaN(Number(char))) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);

    // Focus the last filled input or the first empty one
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const verifySetup = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    // Mocking verification delay
    await new Promise(r => setTimeout(r, 1500));

    // For mock: 123456 is success
    if (code === "123456") {
      setStep("success");
    } else {
      setError("Invalid verification code. Please try again.");
    }
    setIsLoading(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("ABCD-EFGH-IJKL-MNOP");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ========================================================================
  // STEPS
  // ========================================================================

  const renderSelection = () => (
    <motion.div
      key="selection"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className={AUTH_UI.headingBlock}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Multi-Factor Setup</h1>
        <p className="text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
          Choose how you would like to receive your secure login verification codes. This is mandatory for EU-GMP compliance.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-3">
        <button
          type="button"
          onClick={() => handleMethodSelect("email")}
          className="group flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white p-2.5 text-left transition-colors hover:border-teal-700/40 hover:bg-teal-50/30 sm:p-4"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-slate-600">
              <IconMailOpened size={26} stroke={1.5} className="h-[26px] w-[26px] sm:h-[30px] sm:w-[30px]" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-900 sm:text-sm">Email Authentication</p>
              <p className="text-xs text-slate-500">Receive codes at <span className="font-semibold text-slate-700">{email}</span></p>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleMethodSelect("app")}
          className="group flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white p-2.5 text-left transition-colors hover:border-teal-700/40 hover:bg-teal-50/30 sm:p-4"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-slate-600">
              <IconQrcode size={26} stroke={1.5} className="h-[26px] w-[26px] sm:h-[30px] sm:w-[30px]" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-900 sm:text-sm">Authenticator App</p>
              <p className="text-xs text-slate-500">Google Authenticator, Microsoft, Authy, etc.</p>
            </div>
          </div>
        </button>
      </div>

      {onBack && (
        <div className="pt-2">
          <AuthBackLink onClick={onBack} label="Back to Password Change" disabled={isLoading} />
        </div>
      )}
    </motion.div>
  );

  const renderConfig = () => (
    <motion.div
      key="config"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-6"
    >
      <div className={AUTH_UI.headingBlock}>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          {method === "app" ? "Scan QR Code" : "Verify Email"}
        </h2>
        <p className="text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
          {method === "app" ? (
            "Open your authenticator app and scan the code below."
          ) : (
            <>
              We've sent a code to your email <span className="font-semibold text-slate-700">{email}</span>.
            </>
          )}
        </p>
      </div>

      {method === "app" && (
        <div className="flex flex-col items-center justify-center space-y-4 py-2">
          <div className="relative rounded-2xl border-4 border-white bg-white shadow-xl shadow-teal-900/10 transition-transform">
            <img
              src={qrMockup}
              alt="QR Code"
              className="size-36 rounded-lg object-contain sm:size-48"
            />
          </div>
          <div className="flex w-full flex-col items-center space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Can't scan?</p>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <code>ABCD-EFGH-IJKL-MNOP</code>
              {copied ? <IconCheck size={14} className="text-teal-600" /> : <IconCopy size={14} />}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enter Verification Code</label>

        <motion.div
          className="grid grid-cols-6 gap-2 sm:gap-3"
          onPaste={handlePaste}
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {otp.map((digit, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: index * 0.05
              }}
            >
              <motion.input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                whileFocus={{ scale: 1.05 }}
                animate={digit ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.15 }}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                aria-label={`Verification code digit ${index + 1}`}
                className={cn(
                  "h-12 w-full rounded-[12px] border text-center text-xl font-bold outline-none transition-all sm:h-16 sm:text-2xl shadow-sm",
                  "focus:ring-4 focus:ring-teal-700/10",
                  digit
                    ? "border-teal-600 bg-teal-50/20 text-teal-900 shadow-teal-700/5"
                    : "border-slate-200 bg-white focus:border-teal-600"
                )}
              />
            </motion.div>
          ))}
        </motion.div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
      </div>

      <Button
        className={cn(AUTH_UI.submitButton, "mt-4 h-12 sm:h-14 w-full")}
        onClick={verifySetup}
        disabled={isLoading || otp.join("").length < 6}
      >
        Verify & Finalize
      </Button>

      <div className="flex flex-col items-start gap-2 pt-0.5 sm:gap-3 sm:pt-1">
        {method === "email" && (
          <button className="flex items-center gap-2 text-xs font-semibold text-teal-700 hover:text-teal-900">
            <IconRefresh size={16} /> Resend Code
          </button>
        )}

        <AuthBackLink
          onClick={() => setStep("selection")}
          label="Change verification method"
          disabled={isLoading}
        />
      </div>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center space-y-8 py-4 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-teal-400/20" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 text-white shadow-2xl shadow-teal-500/40">
          <IconShieldCheck size={56} />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Account Secured</h1>
        <p className="max-w-xs text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
          Two-factor authentication has been successfully enabled. Your account now meets all EU-GMP Annex 11 security requirements.
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500 p-2 text-white">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Primary Method</p>
              <p className="text-sm font-semibold text-teal-900">
                {method === "app" ? "Authenticator Application" : `Email: ${email}`}
              </p>
            </div>
          </div>
        </div>

        <Button
          className={cn("w-full py-6 text-lg", AUTH_UI.submitButton)}
          onClick={onComplete}
        >
          Continue to Dashboard
        </Button>
      </div>
    </motion.div>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <>
      {isLoading && <FullPageLoading text="Finalizing security setup..." />}
      <AuthLayout
        left={
          <div className={AUTH_UI.formColumn}>
            <div className="mb-6 flex items-center gap-3 text-slate-900 sm:mb-10 lg:mb-12">
              <img
                src={logoImg}
                alt="EQMS Logo"
                className="h-8 w-auto object-contain sm:h-9"
              />
            </div>

            <div className="min-h-[420px] sm:min-h-[480px]">
              <AnimatePresence mode="wait">
                {step === "selection" && renderSelection()}
                {step === "config" && renderConfig()}
                {step === "success" && renderSuccess()}
              </AnimatePresence>
            </div>
          </div>
        }
        right={
          <AuthInfoPanel
            title="A Zero-Trust Quality Architecture"
            body={
              <div className="space-y-6">
                <p className="text-base leading-relaxed text-teal-100/90">
                  EU-GMP and global regulatory bodies now recommend <span className="font-semibold text-white">Multi-Factor Authentication</span> as a critical barrier against unauthorized data modification.
                </p>
              </div>
            }
            footerTitle="Ngoc Thien Pharma"
            footerSubtitle="Trusted Compliance Infrastructure"
          />
        }
      />
    </>
  );
};

const FeatureBox = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4 backdrop-blur-md">
    <div className="text-teal-400">{icon}</div>
    <span className="text-sm font-medium text-white">{title}</span>
  </div>
);
