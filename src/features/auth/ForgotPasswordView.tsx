import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button/Button"; import { ButtonLoading } from '@/components/ui/loading/Loading'; import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import { isValidEmail } from "@/utils/validation";
import logoImg from "@/assets/images/logo_nobg.png";
import { AUTH_SLIDE_IMAGES, CAROUSEL_INTERVAL } from "./authCarousel";
import { motion, AnimatePresence } from "framer-motion";
import { AuthBranding } from "./AuthBranding";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const REQUEST_SIMULATION_DELAY = 2000; // 2 seconds

const SLIDE_CONTENT = [
  {
    tag: "Secure Access",
    title: "Password Recovery Assistance",
    description: "Request password reset from your system administrator. We prioritize security and controlled access to protect your account."
  },
  {
    tag: "Admin Control",
    title: "Controlled Reset Process",
    description: "All password resets are handled by authorized administrators following strict security protocols for your protection."
  },
  {
    tag: "Quick Response",
    title: "Fast Administrator Support",
    description: "Your request will be reviewed promptly by our admin team. Expect a response within 24 hours during business days."
  },
  {
    tag: "Data Protection",
    title: "Compliance & Security",
    description: "Our password reset process follows EU-GMP guidelines and maintains complete audit trails for regulatory compliance."
  }
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
  // MEMOIZED VALUES
  // ========================================================================

  const hasFormErrors = useMemo(() => !isFormValid(errors), [errors]);

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
    <div className="min-h-screen w-full flex overflow-hidden" role="main">

      {/* ====================================================================
          LEFT SIDE - BRANDING & IMAGE (Desktop Only)
          ==================================================================== */}
      <AuthBranding slides={SLIDE_CONTENT} />

      {/* ====================================================================
          RIGHT SIDE - FORGOT PASSWORD FORM
          ==================================================================== */}
      <div className="w-full lg:w-1/2 xl:w-2/5 relative flex flex-col lg:flex-row items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        {/* Grid Pattern Background - Visible only on mobile/tablet */}
        <div
          className="absolute inset-0 lg:hidden pointer-events-none opacity-[0.6]"
          style={{
            backgroundImage: `linear-gradient(#f1f5f9 1.5px, transparent 1.5px), linear-gradient(90deg, #f1f5f9 1.5px, transparent 1.5px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md z-10"
        >
          <div className="bg-white overflow-hidden rounded-2xl lg:rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:shadow-none border border-slate-100 lg:border-none">
            {/* Mobile gradient top bar */}
            <div className="lg:hidden h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />

            {/* Success State */}
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="px-6 sm:px-8 py-10"
                >
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-2">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
                    </div>

                    <div className="space-y-3">
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Request Submitted Successfully
                      </h1>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                        {SUCCESS_MESSAGE}
                      </p>
                    </div>

                    <div className="pt-6 space-y-3">
                      <Button
                        onClick={handleBackToLogin}
                        size="default"
                        className="rounded-xl w-full h-12 text-base font-semibold shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20"
                      >
                        Back to Sign In
                      </Button>

                      <p className="text-xs text-slate-500">
                        Redirecting automatically in 5 seconds...
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  {/* Form Header */}
                  <div className="px-6 sm:px-8 pt-8 sm:pt-8 pb-4">
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

                      <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        Forgot your Password?
                      </h1>
                      {/* <p className="text-xs text-slate-500 max-w-sm mx-auto">
                     Submit a request and System Administrator will reset password for you.
                    </p> */}
                    </div>
                  </div>

                  {/* Form Body */}
                  <div className="px-6 sm:px-8 py-4 sm:py-6">
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      {/* Email/Username Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Email or Username <span className="text-red-600">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            id="email"
                            name="email"
                            type="text"
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className={cn(
                              "w-full h-12 px-4 text-sm font-medium border rounded-xl transition-all",
                              "placeholder:text-slate-400 placeholder:font-normal",
                              "focus:outline-none focus:ring-2",
                              errors.email
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                            )}
                            placeholder="Enter your email or username"
                            disabled={isLoading}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                          />
                        </div>
                        {errors.email && (
                          <p
                            id="email-error"
                            className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                            role="alert"
                          >
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Reason Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="reason"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Reason for Request <span className="text-red-600">*</span>
                        </label>
                        <div className="relative group">
                          <textarea
                            id="reason"
                            name="reason"
                            rows={4}
                            value={formData.reason}
                            onChange={(e) =>
                              handleInputChange("reason", e.target.value)
                            }
                            className={cn(
                              "w-full px-4 py-3 text-sm font-medium border rounded-xl transition-all resize-none",
                              "placeholder:text-slate-400 placeholder:font-normal",
                              "focus:outline-none focus:ring-2",
                              errors.reason
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                            )}
                            placeholder="Please explain why you need to reset your password (e.g., forgot password, account locked, etc.)"
                            disabled={isLoading}
                            aria-invalid={!!errors.reason}
                            aria-describedby={errors.reason ? "reason-error" : undefined}
                          />
                        </div>
                        {errors.reason && (
                          <p
                            id="reason-error"
                            className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                            role="alert"
                          >
                            {errors.reason}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        size="default"
                        className="rounded-xl w-full h-12 mt-6 text-base font-semibold shadow-md shadow-emerald-500/10 active:translate-y-0 transition-all duration-200"
                        disabled={isLoading}
                        aria-busy={isLoading}
                      >
                        {isLoading ? (
                          <ButtonLoading text="Submitting Request..." light />
                        ) : (
                          <span className="text-base tracking-wide">Submit Request</span>
                        )}
                      </Button>

                      {/* Back to Login Link */}
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors pt-3 pb-3 group"
                        disabled={isLoading}
                      >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                        <span>Back to Sign In</span>
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
