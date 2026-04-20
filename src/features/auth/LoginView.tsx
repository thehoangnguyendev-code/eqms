import React, { useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import logoImg from "@/assets/images/logo_nobg.png";
import { IconArrowBigUpFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";


// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const MIN_PASSWORD_LENGTH = 6;
const LOGIN_SIMULATION_DELAY = 3500; // 1.5 seconds

const PARTNER_BRANDS = [
  "Document Control",
  "Training Management",
  "Deviations & NCs",
  "Reports & Analytics",
  "Audit Trail",
  "... and more",
];

const DEMO_CREDENTIALS = {
  username: "admin",
  password: "123456",
} as const;

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
  onLogin?: (username: string, password: string, rememberMe: boolean) => void;
  onForgotPassword?: () => void;
}

interface FormData {
  username: string;
  password: string;
  rememberMe: boolean;
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
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

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

  const handleRememberMeChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  }, []);

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

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);

        // Check credentials
        if (
          formData.username === DEMO_CREDENTIALS.username &&
          formData.password === DEMO_CREDENTIALS.password
        ) {
          // Login successful - Reset viewport zoom before navigation
          blurActiveInput();
          resetViewportZoom();

          if (onLogin) {
            onLogin(formData.username, formData.password, formData.rememberMe);
          }
        } else {
          // Login failed
          setLoginError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
      }, LOGIN_SIMULATION_DELAY);
    },
    [formData, onLogin]
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-white p-0 sm:bg-slate-200 sm:p-6 lg:p-8" role="main">
      {isLoading && <FullPageLoading text="Signing in..." />}

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

              <div className="mb-6 space-y-2 sm:mb-8 sm:space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Welcome Back!</h1>
                <p className="max-w-sm text-sm leading-6 text-slate-500 sm:text-sm sm:leading-7">
                  Sign in with your account to access and manage your quality processes efficiently.
                </p>
              </div>

              {/* Login Error Alert */}
              {loginError && (
                <div
                  className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 sm:mb-5"
                  role="alert"
                  aria-live="assertive"
                >
                  <p className="text-sm font-semibold text-red-900">Authentication Failed</p>
                  <p className="mt-0.5 text-sm text-red-700">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6" noValidate>
                {/* Username/Email Field */}
                <div className="space-y-2 sm:space-y-2.5">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-slate-800 sm:text-sm"
                  >
                    Email or Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={cn(
                      "h-12 w-full rounded-[10px] border bg-white px-4 text-sm text-slate-700 transition-all sm:h-12 sm:px-4 sm:text-sm",
                      "placeholder:text-slate-400",
                      "focus:outline-none focus:ring-2 focus:ring-teal-800/20",
                      errors.username
                        ? "border-red-300 focus:border-red-500"
                        : "border-teal-700/40 hover:border-teal-700/60 focus:border-teal-700"
                    )}
                    placeholder="Enter your email or username"
                    disabled={isLoading}
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? "username-error" : undefined}
                  />
                  {errors.username && (
                    <p
                      id="username-error"
                      className="mt-1.5 text-xs font-medium text-red-600"
                      role="alert"
                    >
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2 sm:space-y-2.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-800 sm:text-sm"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={cn(
                        "h-12 w-full rounded-[10px] border bg-white px-4 pr-12 text-sm text-slate-700 transition-all sm:h-12 sm:px-4 sm:pr-12 sm:text-sm",
                        "placeholder:text-slate-400",
                        "focus:outline-none focus:ring-2 focus:ring-teal-800/20",
                        errors.password
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-300 hover:border-slate-400 focus:border-slate-500"
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

                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-1.5 text-xs font-medium text-red-600"
                      role="alert"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleRememberMeChange}
                    label="Remember me"
                    labelClassName="text-xs text-slate-500 sm:text-sm"
                    disabled={isLoading}
                  />
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="default"
                  className="mt-4 h-12 w-full rounded-[10px] bg-teal-900 text-sm font-medium text-white transition-colors hover:bg-teal-950 sm:mt-1 sm:h-12 sm:text-base"
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
                  <span className="bg-white px-3 font-semibold uppercase tracking-[0.18em] text-slate-400">
                    
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-slate-500 sm:text-sm">
                  Access is managed by the Ngoc Thien Pharma Dev Team
                </p>
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
                Revolutionize QA with Smarter Automation
              </h2>

              <div className="space-y-5">
                <p className="max-w-xl text-[30px]/[1.1] font-medium text-teal-100">
                  SoftQA has completely transformed our testing process. It's reliable, efficient,
                  and ensures our releases are always top-notch.
                </p>
              </div>

              <div className="pt-2">
                <p className="text-base font-semibold text-white">Michael Carter</p>
                <p className="text-sm text-teal-100/90">Software Engineer at DevCore</p>
              </div>
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
