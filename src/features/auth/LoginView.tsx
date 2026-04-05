import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { cn } from "@/components/ui/utils";
import { resetViewportZoom, blurActiveInput } from "@/utils/viewport";
import logoImg from "@/assets/images/logo_nobg.png";
import { IconArrowBigUpFilled } from "@tabler/icons-react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { AuthBranding } from "./AuthBranding";


// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const MIN_PASSWORD_LENGTH = 6;
const LOGIN_SIMULATION_DELAY = 3500; // 1.5 seconds

const SLIDE_CONTENT = [
  {
    tag: "Compliance First",
    title: "Pharmaceutical Excellence",
    description: "A comprehensive platform engineered for strict adherence to EU-GMP, FDA 21 CFR Part 11, and global GxP regulatory standards."
  },
  {
    tag: "Digital Integrity",
    title: "Streamlined Quality Workflows",
    description: "Digitize critical processes from CAPA to Change Control. Ensure data integrity with automated audit trails and secure electronic signatures."
  },
  {
    tag: "Strategic Vision",
    title: "Real-time Quality Analytics",
    description: "Transform operational data into strategic insights. Visualize quality trends instantly to drive continuous improvement and risk mitigation."
  },
  {
    tag: "Global Synergy",
    title: "Unified Quality Ecosystem",
    description: "Break down operational silos. Foster seamless collaboration across departments and geographies in a secure, centralized environment."
  },
  {
    tag: "Audit Readiness",
    title: "Always Inspection-Ready",
    description: "Maintain complete audit trails for every action, document, and decision. Stay perpetually prepared for regulatory inspections with immutable, timestamped records."
  },
  {
    tag: "Risk Intelligence",
    title: "Proactive Risk Management",
    description: "Identify, assess, and mitigate quality risks before they escalate. Leverage integrated risk registers and automated escalation workflows to protect product integrity."
  },
  {
    tag: "Supplier Trust",
    title: "End-to-End Supplier Control",
    description: "Manage supplier qualifications, audits, and performance metrics in one place. Ensure your supply chain meets the highest GxP and regulatory standards."
  },
  {
    tag: "Training Excellence",
    title: "Competency-Driven Workforce",
    description: "Automate training assignments, track completions, and verify competencies across your organization. Build a culture of quality from the ground up."
  },
  {
    tag: "Smart Automation",
    title: "Intelligent Process Control",
    description: "Eliminate manual bottlenecks with intelligent workflows and automated notifications. Accelerate review cycles while maintaining full regulatory traceability."
  }
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
  onContactAdmin?: () => void;
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
export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onForgotPassword, onContactAdmin }) => {
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
  // MEMOIZED VALUES
  // ========================================================================

  const hasFormErrors = useMemo(() => !isFormValid(errors), [errors]);

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

  const handleContactAdminClick = useCallback(() => {
    blurActiveInput();
    resetViewportZoom();

    if (onContactAdmin) {
      onContactAdmin();
    }
  }, [onContactAdmin]);

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
    <div className="min-h-screen w-full flex overflow-hidden" role="main">
      {isLoading && <FullPageLoading text="Signing in..." />}

      {/* ====================================================================
          LEFT SIDE - BRANDING & IMAGE (Desktop Only)
          ==================================================================== */}
      <AuthBranding slides={SLIDE_CONTENT} />

      {/* ====================================================================
          RIGHT SIDE - LOGIN FORM
          ==================================================================== */}
      <div className="w-full lg:w-1/2 xl:w-2/5 relative flex flex-col lg:flex-row items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        {/* Grid Pattern Background - Visible only on mobile/tablet */}
        <div
          className="absolute inset-0 lg:hidden pointer-events-none opacity-[0.9]"
          style={{
            backgroundImage: `linear-gradient(#f1f5f9 1.5px, transparent 1.5px), linear-gradient(90deg, #f1f5f9 1.5px, transparent 1.5px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md z-10"
        >
          <div className="bg-white overflow-hidden rounded-2xl lg:rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:shadow-none border border-slate-100 lg:border-none">
            {/* Mobile gradient top bar */}
            <div className="lg:hidden h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
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
                  Sign in with your EQMS account
                </h1>
              </div>
            </div>

            {/* Form Body */}
            <div className="px-6 sm:px-8 py-4 sm:py-6">
              {/* Login Error Alert */}
              {loginError && (
                <div
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                  role="alert"
                  aria-live="assertive"
                >
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-red-900">
                      Authentication Failed
                    </p>
                    <p className="text-sm text-red-700 mt-0.5">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Username/Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Username or Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
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
                        "w-full h-12 px-4 text-sm font-medium border rounded-xl transition-all",
                        "placeholder:text-slate-400 placeholder:font-normal",
                        "focus:outline-none focus:ring-2",
                        errors.username
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                      )}
                      placeholder="Enter your username or email"
                      disabled={isLoading}
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? "username-error" : undefined}
                    />
                  </div>
                  {errors.username && (
                    <p
                      id="username-error"
                      className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                      role="alert"
                    >
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
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
                        "w-full h-12 pl-4 pr-12 text-sm font-medium border rounded-xl transition-all",
                        "placeholder:text-slate-400 placeholder:font-normal",
                        "focus:outline-none focus:ring-2",
                        errors.password
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                      )}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      onKeyUp={handleCapsLockCheck}
                      onKeyDown={handleCapsLockCheck}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                      {isCapsLockOn && (
                        <div className="p-1 bg-slate-50 border border-emerald-200 rounded-md animate-in fade-in zoom-in duration-200 shadow-sm" title="Caps Lock is ON">
                          <IconArrowBigUpFilled className="h-4 w-4 text-emerald-500" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleTogglePassword}
                        className="p-1.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:text-slate-700"
                        disabled={isLoading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Eye className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                      role="alert"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleRememberMeChange}
                    label="Remember me"
                    labelClassName="text-xs sm:text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleForgotPasswordClick}
                    className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors focus:outline-none hover:underline"
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
                  className="rounded-xl w-full h-12 mt-6 text-base font-semibold shadow-md shadow-emerald-500/10 active:translate-y-0 transition-all duration-200 group"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  <span className="text-base tracking-wide">Sign In</span>
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8" aria-hidden="true">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-slate-400 font-medium tracking-normal">
                    Need help?
                  </span>
                </div>
              </div>

              {/* Footer Text */}
              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={handleContactAdminClick}
                    className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors focus:outline-none hover:underline"
                    aria-label="Contact administrator to create an account"
                  >
                    Contact Administrator
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
