import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button/Button";
import { ButtonLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import { isValidEmail } from "@/utils/validation";
import logoImg from "@/assets/images/logo_nobg.png";
import { AUTH_UI } from "./auth-ui";
import { AuthBackLink, AuthField, AuthInfoPanel, AuthLayout } from "./components";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const REQUEST_SIMULATION_DELAY = 2000; // 2 seconds

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

      }, REQUEST_SIMULATION_DELAY);
    },
    [formData, onRequestSubmit]
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <AuthLayout
      left={
        <div className={AUTH_UI.formColumn}>
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

          {isSuccess ? (
            <div className="space-y-6 sm:space-y-5" role="status" aria-live="polite">
              <div className={AUTH_UI.headingBlock}>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Request Sent</h1>
                <p className="text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">{SUCCESS_MESSAGE}</p>
              </div>

              <div className="space-y-3 pt-2 sm:space-y-3 sm:pt-2">
                <Button
                  onClick={handleBackToLogin}
                  size="default"
                  className="h-12 w-full rounded-[10px] bg-teal-900 text-sm font-medium text-white transition-colors hover:bg-teal-950 sm:h-12 sm:text-base"
                >
                  Back to Sign In
                </Button>

                <p className="text-[11px] text-slate-500 sm:text-xs">Click "Back to Sign In" to return to the login screen.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={AUTH_UI.formStack} noValidate>
              <div className={AUTH_UI.headingBlock}>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Forgot Password?</h1>
                <p className="text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
                  Submit a reset request and the system administrator will assist with account recovery.
                </p>
              </div>

              <AuthField htmlFor="email" label="Email or Username" required error={errors.email}>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={cn(
                    AUTH_UI.inputBase,
                    AUTH_UI.inputFocus,
                    errors.email ? AUTH_UI.inputError : AUTH_UI.inputDefault
                  )}
                  placeholder="Enter your email or username"
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </AuthField>

              <AuthField htmlFor="reason" label="Reason for Request" required error={errors.reason}>
                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className={cn(
                    "w-full resize-none rounded-[10px] border bg-white px-4 py-3 text-sm text-slate-700 transition-all sm:px-4 sm:py-3 sm:text-sm",
                    AUTH_UI.inputFocus,
                    errors.reason ? AUTH_UI.inputError : AUTH_UI.inputDefault
                  )}
                  placeholder="Reason for password reset"
                  disabled={isLoading}
                  aria-invalid={!!errors.reason}
                  aria-describedby={errors.reason ? "reason-error" : undefined}
                />
              </AuthField>

              <Button
                type="submit"
                size="default"
                className={AUTH_UI.submitButton}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? <ButtonLoading text="Submitting Request..." light /> : "Submit Request"}
              </Button>

              <AuthBackLink onClick={handleBackToLogin} label="Back to Sign In" disabled={isLoading} />
            </form>
          )}
        </div>
      }
      right={
        <AuthInfoPanel
          title="Secure Password Recovery with Full Audit Traceability"
          body={
            <p className="text-base leading-8 text-teal-100/90">
              Reset requests are routed through controlled admin workflow to preserve data integrity and access governance.
            </p>
          }
          footerTitle="Ngoc Thien Pharma Dev Team"
          footerSubtitle="Designed for EU-GMP regulated manufacturing"
        />
      }
    />
  );
};
