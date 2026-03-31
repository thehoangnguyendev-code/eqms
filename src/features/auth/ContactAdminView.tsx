import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, CheckCircle2, Mail, User, Phone, Briefcase } from "lucide-react";
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
    tag: "Get Started",
    title: "Join Our Quality System",
    description: "Request access to our comprehensive QMS platform. Our administrators will review your request and create your account within 24 hours."
  },
  {
    tag: "Secure Onboarding",
    title: "Controlled Access Management",
    description: "All account requests are carefully reviewed by our admin team following strict security protocols to ensure authorized access only."
  },
  {
    tag: "Quick Setup",
    title: "Fast Account Activation",
    description: "Once approved, you'll receive your credentials via email with detailed instructions to get started with the system immediately."
  },
  {
    tag: "Compliance Ready",
    title: "Role-Based Permissions",
    description: "Your account will be configured with appropriate permissions based on your role and department to ensure regulatory compliance."
  }
];

const ERROR_MESSAGES = {
  FULL_NAME_REQUIRED: "Full name is required",
  EMAIL_REQUIRED: "Email address is required",
  INVALID_EMAIL_FORMAT: "Please enter a valid email address",
  PHONE_REQUIRED: "Phone number is required",
  PHONE_INVALID: "Please enter a valid phone number",
  DEPARTMENT_REQUIRED: "Department is required",
  POSITION_REQUIRED: "Position is required",
} as const;

const SUCCESS_MESSAGE = "Your account request has been sent to the administrator. You will receive an email with your login credentials within 24 hours once your request is approved.";

// ============================================================================
// TYPES
// ============================================================================

interface ContactAdminViewProps {
  onBackToLogin?: () => void;
  onRequestSubmit?: (data: AccountRequestData) => void;
}

interface AccountRequestData {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
}

interface FormData extends AccountRequestData { }

interface FormErrors {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates phone number format (basic validation)
 * @param phone - Phone string to validate
 * @returns true if valid phone format
 */
const isValidPhone = (phone: string): boolean => {
  if (!phone.trim()) return false; // Phone is required
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 9;
};

/**
 * Validates account request form data
 * @param data - Form data to validate
 * @returns Object containing validation errors (empty strings if no errors)
 */
const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
  };

  if (!data.fullName.trim()) {
    errors.fullName = ERROR_MESSAGES.FULL_NAME_REQUIRED;
  }

  if (!data.email.trim()) {
    errors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
  } else if (!isValidEmail(data.email)) {
    errors.email = ERROR_MESSAGES.INVALID_EMAIL_FORMAT;
  }

  if (!data.phone.trim()) {
    errors.phone = ERROR_MESSAGES.PHONE_REQUIRED;
  } else if (!isValidPhone(data.phone)) {
    errors.phone = ERROR_MESSAGES.PHONE_INVALID;
  }

  if (!data.department.trim()) {
    errors.department = ERROR_MESSAGES.DEPARTMENT_REQUIRED;
  }

  if (!data.position.trim()) {
    errors.position = ERROR_MESSAGES.POSITION_REQUIRED;
  }

  return errors;
};

/**
 * Checks if form has any validation errors
 * @param errors - Form errors object
 * @returns true if form is valid (no errors)
 */
const isFormValid = (errors: FormErrors): boolean => {
  return !errors.fullName && !errors.email && !errors.phone && !errors.department && !errors.position;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ContactAdminView Component
 * Account request form - sends request to admin for new account creation
 * 
 * @component
 * @example
 * ```tsx
 * <ContactAdminView 
 *   onBackToLogin={() => navigate('/login')}
 *   onRequestSubmit={(data) => console.log('Request sent')}
 * />
 * ```
 */
export const ContactAdminView: React.FC<ContactAdminViewProps> = ({
  onBackToLogin,
  onRequestSubmit
}) => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
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
          onRequestSubmit(formData);
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
          RIGHT SIDE - ACCOUNT REQUEST FORM
          ==================================================================== */}

      {/* ====================================================================
          RIGHT SIDE - ACCOUNT REQUEST FORM
          ==================================================================== */}
      <div className="w-full lg:w-1/2 xl:w-2/5 relative flex flex-col lg:flex-row items-center justify-center p-6 sm:p-8 lg:p-12 bg-[#0c3547] lg:bg-white">
        {/* Mobile-only Logo - top left header */}
        <div className="w-full max-w-md flex items-center gap-3 mb-6 lg:hidden">
          <img
            src={logoImg}
            alt="QMS Logo"
            className="h-10 w-auto object-contain drop-shadow-sm"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white overflow-hidden rounded-xl lg:rounded-none shadow-2xl lg:shadow-none">
            {/* Mobile gradient top bar */}
            <div className="lg:hidden h-1.5 bg-gradient-to-r from-green-400 via-emerald-400 to-emerald-500" />

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
                  <div className="px-6 sm:px-8 pt-4 sm:pt-10 pb-4">
                    <div className="text-center space-y-3">
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

                      <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        Request New Account
                      </h1>
                      {/* <p className="text-xs text-slate-500 max-w-sm mx-auto">
                     Submit your information and our administrator will create your account.
                    </p> */}
                    </div>
                  </div>

                  {/* Form Body */}
                  <div className="px-6 sm:px-8 py-4 sm:py-6">
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                      {/* Full Name Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Full Name <span className="text-red-600">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            value={formData.fullName}
                            onChange={(e) =>
                              handleInputChange("fullName", e.target.value)
                            }
                            className={cn(
                              "w-full h-12 px-4 text-sm font-medium border rounded-xl transition-all",
                              "placeholder:text-slate-400 placeholder:font-normal",
                              "focus:outline-none focus:ring-2",
                              errors.fullName
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                            )}
                            placeholder="Enter your full name"
                            disabled={isLoading}
                            aria-invalid={!!errors.fullName}
                            aria-describedby={errors.fullName ? "fullName-error" : undefined}
                          />
                        </div>
                        {errors.fullName && (
                          <p
                            id="fullName-error"
                            className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                            role="alert"
                          >
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Email Address <span className="text-red-600">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            id="email"
                            name="email"
                            type="email"
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
                            placeholder="Enter your email address"
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

                      {/* Phone Number Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className={cn(
                              "w-full h-12 px-4 text-sm font-medium border rounded-xl transition-all",
                              "placeholder:text-slate-400 placeholder:font-normal",
                              "focus:outline-none focus:ring-2",
                              errors.phone
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                            )}
                            placeholder="Enter your phone number"
                            disabled={isLoading}
                            aria-invalid={!!errors.phone}
                            aria-describedby={errors.phone ? "phone-error" : undefined}
                          />
                        </div>
                        {errors.phone && (
                          <p
                            id="phone-error"
                            className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                            role="alert"
                          >
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* Department Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="department"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Department <span className="text-red-600">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            id="department"
                            name="department"
                            type="text"
                            autoComplete="organization"
                            value={formData.department}
                            onChange={(e) =>
                              handleInputChange("department", e.target.value)
                            }
                            className={cn(
                              "w-full h-12 px-4 text-sm font-medium border rounded-xl transition-all",
                              "placeholder:text-slate-400 placeholder:font-normal",
                              "focus:outline-none focus:ring-2",
                              errors.department
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                            )}
                            placeholder="e.g., Quality Assurance"
                            disabled={isLoading}
                            aria-invalid={!!errors.department}
                            aria-describedby={errors.department ? "department-error" : undefined}
                          />
                        </div>
                        {errors.department && (
                          <p
                            id="department-error"
                            className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                            role="alert"
                          >
                            {errors.department}
                          </p>
                        )}
                      </div>

                      {/* Position Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="position"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Position <span className="text-red-600">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            id="position"
                            name="position"
                            type="text"
                            autoComplete="organization-title"
                            value={formData.position}
                            onChange={(e) =>
                              handleInputChange("position", e.target.value)
                            }
                            className={cn(
                              "w-full h-12 px-4 text-sm font-medium border rounded-xl transition-all",
                              "placeholder:text-slate-400 placeholder:font-normal",
                              "focus:outline-none focus:ring-2",
                              errors.position
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                            )}
                            placeholder="e.g., QA Manager"
                            disabled={isLoading}
                            aria-invalid={!!errors.position}
                            aria-describedby={errors.position ? "position-error" : undefined}
                          />
                        </div>
                        {errors.position && (
                          <p
                            id="position-error"
                            className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                            role="alert"
                          >
                            {errors.position}
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
