import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { X, Info, XCircle } from "lucide-react";
import { cn } from "../utils";
import { IconAlertTriangle, IconRosetteDiscountCheck } from "@tabler/icons-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number; // ms
}

interface ToastContextProps {
  showToast: (toast: Omit<Toast, "id"> & { id?: string }) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const ICONS = {
  success: IconRosetteDiscountCheck,
  error: XCircle,
  warning: IconAlertTriangle,
  info: Info,
};

const COLORS = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  error: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

const MAX_TOASTS = 3;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<{ [id: string]: NodeJS.Timeout }>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback((toast: Omit<Toast, "id"> & { id?: string }) => {
    const id = toast.id || Math.random().toString(36).slice(2, 10);
    
    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }];
      
      // Remove oldest toasts if exceeding MAX_TOASTS
      if (newToasts.length > MAX_TOASTS) {
        const toastsToRemove = newToasts.slice(0, newToasts.length - MAX_TOASTS);
        toastsToRemove.forEach(t => {
          if (timers.current[t.id]) {
            clearTimeout(timers.current[t.id]);
            delete timers.current[t.id];
          }
        });
        return newToasts.slice(-MAX_TOASTS);
      }
      
      return newToasts;
    });
    
    const duration = toast.duration ?? 3500;
    timers.current[id] = setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div 
        className="fixed z-[9999] flex flex-col gap-3 items-end max-w-xs md:max-w-sm lg:max-w-md w-full"
        style={{
          top: 'max(1rem, env(safe-area-inset-top, 1rem))',
          right: 'max(1rem, env(safe-area-inset-right, 1rem))',
        }}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          const duration = toast.duration ?? 3500;
          
          return (
            <div
              key={toast.id}
              className={cn(
                "w-full border rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
                COLORS[toast.type]
              )}
              role="alert"
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {toast.title && <div className="font-semibold text-sm mb-0.5">{toast.title}</div>}
                  <div className="text-sm leading-relaxed">{toast.message}</div>
                </div>
                <button
                  className="ml-2 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Close"
                  onClick={() => removeToast(toast.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1 bg-white/30 relative overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    toast.type === "success" && "bg-emerald-600",
                    toast.type === "error" && "bg-red-600",
                    toast.type === "warning" && "bg-amber-600",
                    toast.type === "info" && "bg-blue-600"
                  )}
                  style={{
                    width: '100%',
                    animation: `shrink ${duration}ms linear forwards`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Add keyframe animation for progress bar */}
      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
