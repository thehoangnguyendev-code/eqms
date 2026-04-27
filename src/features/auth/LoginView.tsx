import React, { useState, useCallback, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import logoImg from "@/assets/images/logo_nobg.png";
import { IconArrowBigUpFilled } from "@tabler/icons-react";
import { AUTH_UI } from "./auth-ui";
import { AuthField, AuthInfoPanel, AuthLayout } from "./components";
import { AlertModal } from "@/components/ui/modal/AlertModal";


// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const MIN_PASSWORD_LENGTH = 6;

const TYPEWRITER_PHRASES = [
  "EQMS centralizes document control, training, deviations, CAPA, and audit trails.",
  "It strengthens data integrity, traceability, and inspection readiness under EU-GMP.",
  "Built for regulated manufacturing teams that need compliant, consistent execution.",
];

const ERROR_MESSAGES = {
  USERNAME_REQUIRED: "Username or email is required",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  INVALID_CREDENTIALS: "Invalid username or password. Please try again.",
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface LoginViewProps {
  onLogin?: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  onForgotPassword?: () => void;
}

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username: string;
  password: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates login form data
 * @param data - Form data to validate
 * @returns Object containing validation errors (empty strings if no errors)
 */
const validateLoginForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {
    username: "",
    password: "",
  };

  if (!data.username.trim()) {
    errors.username = ERROR_MESSAGES.USERNAME_REQUIRED;
  }

  if (!data.password) {
    errors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;
  } else if (data.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
  }

  return errors;
};

/**
 * Checks if form has any validation errors
 * @param errors - Form errors object
 * @returns true if form is valid (no errors)
 */
const isFormValid = (errors: FormErrors): boolean => {
  return !errors.username && !errors.password;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * LoginView Component
 * Full-page login interface with splash screen, carousel, and form validation
 * 
 * @component
 * @example
 * ```tsx
 * <LoginView onLogin={(username, password, rememberMe) => {
 *   // Handle successful login
 * }} />
 * ```
 */
export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onForgotPassword }) => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [typewriterPhraseIndex, setTypewriterPhraseIndex] = useState(0);
  const [isDeletingText, setIsDeletingText] = useState(false);
  const [isTypewriterPaused, setIsTypewriterPaused] = useState(false);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleInputChange = useCallback(
    (field: keyof Pick<FormData, "username" | "password">, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
      setLoginError("");
    },
    []
  );

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleCapsLockCheck = useCallback((e: React.KeyboardEvent) => {
    const capsLockState = e.getModifierState("CapsLock");
    setIsCapsLockOn(capsLockState);
  }, []);

  const handleForgotPasswordClick = useCallback(() => {
    blurActiveInput();
    resetViewportZoom();

    if (onForgotPassword) {
      onForgotPassword();
    }
  }, [onForgotPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError("");

      // Validate form
      const validationErrors = validateLoginForm(formData);
      setErrors(validationErrors);

      if (!isFormValid(validationErrors)) {
        return;
      }

      setIsLoading(true);

      if (!onLogin) {
        setIsLoading(false);
        setLoginError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        return;
      }

      if (isLocked) {
        setIsLoading(false);
        return;
      }

      const result = await onLogin(formData.username, formData.password);
      setIsLoading(false);

      if (result.success) {
        setFailedAttempts(0);
        // Login stage completed (direct auth or moved to 2FA), normalize viewport before navigation.
        blurActiveInput();
        resetViewportZoom();
        return;
      }

      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= 5) {
        setIsLocked(true);
      } else {
        setLoginError(result.error || ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    },
    [formData, onLogin, failedAttempts, isLocked]
  );

  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[typewriterPhraseIndex];

    if (isTypewriterPaused) {
      const pauseTimer = window.setTimeout(() => {
        setIsTypewriterPaused(false);
        setIsDeletingText(true);
      }, 1900);

      return () => window.clearTimeout(pauseTimer);
    }

    const nextLength = isDeletingText
      ? Math.max(0, typewriterText.length - 1)
      : Math.min(currentPhrase.length, typewriterText.length + 1);

    const nextText = currentPhrase.slice(0, nextLength);
    const speed = isDeletingText ? 42 : 72;

    const typeTimer = window.setTimeout(() => {
      setTypewriterText(nextText);

      if (!isDeletingText && nextText === currentPhrase) {
        setIsTypewriterPaused(true);
        return;
      }

      if (isDeletingText && nextText.length === 0) {
        setIsDeletingText(false);
        setTypewriterPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
      }
    }, speed);

    return () => window.clearTimeout(typeTimer);
  }, [isDeletingText, isTypewriterPaused, typewriterPhraseIndex, typewriterText]);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <>
      <AlertModal
        isOpen={isLocked}
        onClose={() => setIsLocked(false)}
        type="error"
        title="Account Locked"
        description="Your account has been locked due to multiple failed attempts. Please contact Administrator or use the Reset Password feature."
        confirmText="Close"
      />

      {isLoading && <FullPageLoading text="Signing in..." />}
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

            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Welcome Back!</h1>
              <p className="max-w-sm text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
                Sign in with your account to access and manage your quality processes efficiently.
              </p>
            </div>

            {loginError && (
              <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 sm:mb-5" role="alert" aria-live="assertive">
                <p className="text-sm font-semibold text-red-900">Authentication Failed</p>
                <p className="mt-0.5 text-sm text-red-700">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className={AUTH_UI.formStack} noValidate autoComplete="off">
              <AuthField htmlFor="username" label="Email or Username" error={errors.username}>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="off"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={cn(
                    AUTH_UI.inputBase,
                    AUTH_UI.inputFocus,
                    errors.username ? AUTH_UI.inputError : AUTH_UI.inputDefault
                  )}
                  placeholder="Enter your email or username"
                  disabled={isLoading}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? "username-error" : undefined}
                />
              </AuthField>

              <AuthField htmlFor="password" label="Password" error={errors.password}>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={cn(
                      AUTH_UI.inputBase,
                      "pr-12 sm:pr-12",
                      AUTH_UI.inputFocus,
                      errors.password ? AUTH_UI.inputError : AUTH_UI.inputDefault
                    )}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    onKeyUp={handleCapsLockCheck}
                    onKeyDown={handleCapsLockCheck}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                    {isCapsLockOn && (
                      <div className="mr-2 rounded-md border border-teal-100 bg-teal-50 p-1" title="Caps Lock is ON">
                        <IconArrowBigUpFilled className="h-4 w-4 text-teal-700" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleTogglePassword}
                      className="flex items-center p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus:text-slate-700"
                      disabled={isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </AuthField>

              <div className="flex items-center justify-end pt-0.5 sm:pt-1">
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-xs font-medium text-teal-700 transition-colors hover:text-teal-800 focus:outline-none sm:text-sm"
                  disabled={isLoading}
                  aria-label="Forgot password"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                size="default"
                className={AUTH_UI.submitButton}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                <span className="tracking-wide">Sign In</span>
              </Button>
            </form>

            <div className="relative my-4 sm:my-7" aria-hidden="true">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-white px-3 font-semibold uppercase tracking-[0.18em] text-slate-400"></span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[11px] text-slate-500 sm:text-sm">Access is managed by the Ngoc Thien Pharma Dev Team</p>
            </div>
          </div>
        }
        right={
          <AuthInfoPanel
            title="Electronic Quality Management System"
            body={
              <>
                <p className="sr-only">
                  EQMS supports EU-GMP operations with centralized document control, training, CAPA, deviations, and audit trail traceability.
                </p>
                <p className="min-h-[176px] max-w-xl text-[22px]/[1.2] font-medium text-teal-100 lg:min-h-[152px] lg:text-[26px]/[1.15] xl:min-h-[132px] xl:text-[30px]/[1.1]" aria-hidden="true">
                  {typewriterText}
                  <span className="ml-1 inline-block text-teal-50/95 animate-pulse">|</span>
                </p>
              </>
            }
            footerTitle="Ngoc Thien Pharma Dev Team"
            footerSubtitle="Designed for EU-GMP regulated manufacturing"
          />
        }
      />
    </>
  );
};
