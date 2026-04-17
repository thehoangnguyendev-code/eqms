import React, { useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { ButtonLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import { isValidEmail } from "@/utils/validation";
import logoImg from "@/assets/images/logo_nobg.png";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const REQUEST_SIMULATION_DELAY = 2000; // 2 seconds

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

const ERROR_MESSAGES = {
  EMAIL_REQUIRED: "Email or username is required",
  REASON_REQUIRED: "Please provide a reason for password reset request",
  INVALID_EMAIL_FORMAT: "Please enter a valid email address",
} as const;

const SUCCESS_MESSAGE = "Your password reset request has been sent to the administrator. You will receive an email with further instructions within 24 hours.";

// ============================================================================
// TYPES
// ============================================================================

interface ForgotPasswordViewProps {
  onBackToLogin?: () => void;
  onRequestSubmit?: (email: string, reason: string) => void;
}

interface FormData {
  email: string;
  reason: string;
}

interface FormErrors {
  email: string;
  reason: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates forgot password form data
 * @param data - Form data to validate
 * @returns Object containing validation errors (empty strings if no errors)
 */
const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {
    email: "",
    reason: "",
  };

  if (!data.email.trim()) {
    errors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
  } else if (data.email.includes("@") && !isValidEmail(data.email)) {
    errors.email = ERROR_MESSAGES.INVALID_EMAIL_FORMAT;
  }

  if (!data.reason.trim()) {
    errors.reason = ERROR_MESSAGES.REASON_REQUIRED;
  }

  return errors;
};

/**
 * Checks if form has any validation errors
 * @param errors - Form errors object
 * @returns true if form is valid (no errors)
 */
const isFormValid = (errors: FormErrors): boolean => {
  return !errors.email && !errors.reason;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ForgotPasswordView Component
 * Password reset request form - sends request to admin for password reset
 * 
 * @component
 * @example
 * ```tsx
 * <ForgotPasswordView 
 *   onBackToLogin={() => navigate('/login')}
 *   onRequestSubmit={(email, reason) => console.log('Request sent')}
 * />
 * ```
 */
export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onBackToLogin,
  onRequestSubmit
}) => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [formData, setFormData] = useState<FormData>({
    email: "",
    reason: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    },
    []
  );

  const handleBackToLogin = useCallback(() => {
    blurActiveInput();
    resetViewportZoom();

    if (onBackToLogin) {
      onBackToLogin();
    }
  }, [onBackToLogin]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const validationErrors = validateForm(formData);
      setErrors(validationErrors);

      if (!isFormValid(validationErrors)) {
        return;
      }

      setIsLoading(true);

      // Simulate API call to send request to admin
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);

        // Reset viewport zoom
        blurActiveInput();
        resetViewportZoom();

        if (onRequestSubmit) {
          onRequestSubmit(formData.email, formData.reason);
        }

        // Auto redirect to login after 5 seconds
        setTimeout(() => {
          if (onBackToLogin) {
            onBackToLogin();
          }
        }, 5000);
      }, REQUEST_SIMULATION_DELAY);
    },
    [formData, onRequestSubmit, onBackToLogin]
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white sm:bg-slate-200 p-0 sm:p-6 lg:p-8" role="main">
      <div className="mx-auto w-full max-w-[1160px] overflow-hidden rounded-none sm:rounded-2xl bg-transparent shadow-none sm:shadow-[0_14px_36px_rgba(15,23,42,0.16)] lg:shadow-[0_24px_48px_rgba(15,23,42,0.18)]">
        <div className="grid w-full grid-cols-1 min-h-screen sm:min-h-[600px] lg:min-h-[640px] lg:grid-cols-2 xl:min-h-[720px]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center border-0 sm:border border-slate-200/90 bg-white px-6 py-10 sm:px-10 sm:py-10 lg:px-16 lg:py-12 xl:px-20"
          >
            <div className="w-full max-w-[340px] sm:max-w-[420px] flex-1 flex flex-col justify-center">
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

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6 sm:space-y-6"
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                    </div>

                    <div className="space-y-3 sm:space-y-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Request Sent</h1>
                      <p className="text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">{SUCCESS_MESSAGE}</p>
                    </div>

                    <div className="space-y-3 pt-2 sm:space-y-3 sm:pt-2">
                      <Button
                        onClick={handleBackToLogin}
                        size="default"
                        className="h-10 w-full rounded-[10px] bg-teal-900 text-sm font-medium text-white transition-colors hover:bg-teal-950 sm:h-12 sm:text-base"
                      >
                        Back to Sign In
                      </Button>

                      <p className="text-[11px] text-slate-500 sm:text-xs">Redirecting automatically in 5 seconds...</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-5 sm:space-y-6"
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Forgot Password?</h1>
                      <p className="text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
                        Submit a reset request and the system administrator will assist with account recovery.
                      </p>
                    </div>

                    <div className="space-y-2 sm:space-y-2.5">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-800 sm:text-sm">
                        Email or Username
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="text"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={cn(
                          "h-12 w-full rounded-[10px] border bg-white px-4 text-sm text-slate-700 transition-all sm:h-12 sm:px-4 sm:text-sm",
                          "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-800/20",
                          errors.email
                            ? "border-red-300 focus:border-red-500"
                            : "border-slate-300 hover:border-slate-400 focus:border-teal-700"
                        )}
                        placeholder="Enter your email or username"
                        disabled={isLoading}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 sm:space-y-2.5">
                      <label htmlFor="reason" className="block text-sm font-medium text-slate-800 sm:text-sm">
                        Reason for Request
                      </label>
                      <textarea
                        id="reason"
                        name="reason"
                        rows={4}
                        value={formData.reason}
                        onChange={(e) => handleInputChange("reason", e.target.value)}
                        className={cn(
                          "w-full resize-none rounded-[10px] border bg-white px-4 py-3 text-sm text-slate-700 transition-all sm:px-4 sm:py-3 sm:text-sm",
                          "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-800/20",
                          errors.reason
                            ? "border-red-300 focus:border-red-500"
                            : "border-slate-300 hover:border-slate-400 focus:border-teal-700"
                        )}
                        placeholder="Reason for password reset"
                        disabled={isLoading}
                        aria-invalid={!!errors.reason}
                        aria-describedby={errors.reason ? "reason-error" : undefined}
                      />
                      {errors.reason && (
                        <p id="reason-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                          {errors.reason}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="default"
                      className="h-12 mt-2 w-full rounded-[10px] bg-teal-900 text-sm font-medium text-white transition-colors hover:bg-teal-950 sm:h-12 sm:text-base"
                      disabled={isLoading}
                      aria-busy={isLoading}
                    >
                      {isLoading ? <ButtonLoading text="Submitting Request..." light /> : "Submit Request"}
                    </Button>

                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="group inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 focus-visible:text-slate-700 sm:text-sm"
                      disabled={isLoading}
                    >
                      <span
                        className="inline-flex w-0 -translate-x-1 items-center overflow-hidden opacity-0 transition-all duration-200 group-hover:mr-2 group-hover:w-4 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:mr-2 group-focus-visible:w-4 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                        aria-hidden="true"
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>Back to Sign In</span>
                    </button>
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
                Secure Password Recovery with Full Audit Traceability
              </h2>
              <p className="text-base leading-8 text-teal-100/90">
                Reset requests are routed through controlled admin workflow to preserve data integrity and access governance.
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
