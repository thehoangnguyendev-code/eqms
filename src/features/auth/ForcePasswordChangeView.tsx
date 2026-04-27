import React, { useState, useCallback } from "react";
import { Eye, EyeOff, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import logoImg from "@/assets/images/logo_nobg.png";
import { AUTH_UI } from "./auth-ui";
import { AuthField, AuthInfoPanel, AuthLayout, AuthBackLink } from "./components";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const MIN_PASSWORD_LENGTH = 8;
const REQUIRE_SPECIAL_CHAR = true;
const REQUIRE_NUMBER = true;
const REQUIRE_UPPERCASE = true;

const ERROR_MESSAGES = {
  NEW_PASSWORD_REQUIRED: "New password is required",
  PASSWORD_TOO_SHORT: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  PASSWORDS_MUST_MATCH: "Passwords do not match",
  STRENGTH_REQUIREMENTS: "Password does not meet security requirements",
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface ForcePasswordChangeViewProps {
  onSubmit?: (data: {
    newPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
  onBackToLogin?: () => void;
  username?: string;
}

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const checkPasswordStrength = (password: string) => {
  const hasMinLength = password.length >= MIN_PASSWORD_LENGTH;
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasSpecial) score++;
  if (hasNumber) score++;
  if (hasUpper) score++;

  return {
    score, // 0-4
    hasMinLength,
    hasSpecial,
    hasNumber,
    hasUpper,
    isValid: hasMinLength && (!REQUIRE_SPECIAL_CHAR || hasSpecial) && (!REQUIRE_NUMBER || hasNumber) && (!REQUIRE_UPPERCASE || hasUpper)
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ForcePasswordChangeView: React.FC<ForcePasswordChangeViewProps> = ({
  onSubmit,
  onBackToLogin,
  username = "User",
}) => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [formData, setFormData] = useState<FormData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const strength = checkPasswordStrength(formData.newPassword);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
      setSubmitError("");
    },
    []
  );

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      newPassword: "",
      confirmPassword: "",
    };

    if (!formData.newPassword) {
      newErrors.newPassword = ERROR_MESSAGES.NEW_PASSWORD_REQUIRED;
    } else if (formData.newPassword.length < MIN_PASSWORD_LENGTH) {
      newErrors.newPassword = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    } else if (!strength.isValid) {
      newErrors.newPassword = ERROR_MESSAGES.STRENGTH_REQUIREMENTS;
    }

    if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = ERROR_MESSAGES.PASSWORDS_MUST_MATCH;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError("");

      if (!validateForm()) return;

      setIsLoading(true);

      if (!onSubmit) {
        setIsLoading(false);
        setSubmitError("Submission handler not configured");
        return;
      }

      const result = await onSubmit({
        newPassword: formData.newPassword,
      });

      setIsLoading(false);

      if (result.success) {
        blurActiveInput();
        resetViewportZoom();
        return;
      }

      setSubmitError(result.error || "Failed to update password. Please try again.");
    },
    [formData, onSubmit, strength]
  );

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const PasswordIcon = ({ field }: { field: keyof typeof showPasswords }) => (
    <button
      type="button"
      onClick={() => togglePasswordVisibility(field)}
      className="flex items-center p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
      aria-label={showPasswords[field] ? "Hide password" : "Show password"}
      tabIndex={-1}
    >
      {showPasswords[field] ? (
        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </button>
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <>
      {isLoading && <FullPageLoading text="Updating credentials..." />}
      <AuthLayout
        left={
          <div className={AUTH_UI.formColumn}>
            <div className="mb-6 flex items-center gap-3 text-slate-900 sm:mb-10 lg:mb-12">
              <img
                src={logoImg}
                alt="EQMS Logo"
                className="h-8 w-auto object-contain sm:h-9"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Secure Your Account</h1>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
                Hi <span className="font-semibold text-slate-700">{username}</span>, you must change your password the first time you sign in.
              </p>
            </div>

            {submitError && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
                <div className="flex gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Security Update Failed</p>
                    <p className="mt-0.5 text-sm text-red-700">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className={AUTH_UI.formStack} noValidate>

              <AuthField
                htmlFor="newPassword"
                label="New Secure Password"
                required={true}
                error={errors.newPassword}
              >
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    className={cn(AUTH_UI.inputBase, "pr-12", AUTH_UI.inputFocus, errors.newPassword ? AUTH_UI.inputError : AUTH_UI.inputDefault)}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <PasswordIcon field="new" />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <div className="mt-3 space-y-2">
                  <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-100">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-full flex-1 transition-all duration-500",
                          i < strength.score
                            ? strength.score <= 1 ? "bg-red-500"
                              : strength.score <= 2 ? "bg-orange-400"
                                : strength.score <= 3 ? "bg-yellow-400"
                                  : "bg-teal-500"
                            : "bg-transparent"
                        )}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                    <StrengthCheck label="At least 8 characters" checked={strength.hasMinLength} />
                    <StrengthCheck label="One uppercase letter" checked={strength.hasUpper} />
                    <StrengthCheck label="One number" checked={strength.hasNumber} />
                    <StrengthCheck label="One special character" checked={strength.hasSpecial} />
                  </div>
                </div>
              </AuthField>

              <AuthField
                htmlFor="confirmPassword"
                label="Confirm New Password"
                required={true}
                error={errors.confirmPassword}
              >
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={cn(AUTH_UI.inputBase, "pr-12", AUTH_UI.inputFocus, errors.confirmPassword ? AUTH_UI.inputError : AUTH_UI.inputDefault)}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <PasswordIcon field="confirm" />
                  </div>
                </div>
                {formData.confirmPassword && formData.confirmPassword !== formData.newPassword && (
                  <p className="mt-1.5 text-[11px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    Passwords do not match yet
                  </p>
                )}
              </AuthField>

              <Button
                type="submit"
                className={cn(AUTH_UI.submitButton, "mt-2")}
                disabled={isLoading || !strength.isValid || formData.newPassword !== formData.confirmPassword}
              >
                Continue
              </Button>

              <AuthBackLink onClick={onBackToLogin} label="Return to Login" disabled={isLoading} />
            </form>
          </div>
        }
        right={
          <AuthInfoPanel
            title="Data Integrity & Security Compliance"
            body={
              <div className="space-y-6 text-teal-100/90">
                <p className="text-base leading-relaxed">
                  As part of our commitment to <span className="font-semibold text-white">ALCOA+</span> principles, all users must maintain unique, strong credentials that are periodically updated.
                </p>
              </div>
            }
            footerTitle="Security Directive 2026-A"
            footerSubtitle="EU-GMP Annex 11 & FDA 21 CFR Part 11 Compliant"
          />
        }
      />
    </>
  );
};

const StrengthCheck = ({ label, checked }: { label: string; checked: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={cn(
      "flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors",
      checked ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300 bg-white"
    )}>
      {checked && <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
    </div>
    <span className={cn("text-[11px] font-medium transition-colors sm:text-xs", checked ? "text-slate-900" : "text-slate-400")}>{label}</span>
  </div>
);
