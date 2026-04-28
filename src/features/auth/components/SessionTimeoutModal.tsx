import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { ButtonLoading, FullPageLoading } from "@/components/ui/loading/Loading";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/app/routes.constants";
import logoImg from "@/assets/images/logo_nobg.png";

const TIMEOUT_MS = 15 * 60 * 1000; // 30 minutes

export const SessionTimeoutModal: React.FC = () => {
  const navigate = useNavigate();
  const { user, initiateLogin, logout, isAuthenticated } = useAuth();

  const [isTimeout, setIsTimeout] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (isTimeout || !isAuthenticated) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsTimeout(true);
    }, TIMEOUT_MS);
  }, [isTimeout, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, resetTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }

    if (!user?.username) {
      await handleFail();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await initiateLogin({ username: user.username, password });

      if (result.success) {
        // Keep loading briefly so the overlay doesn't flash out
        setIsTimeout(false);
        setPassword("");
        setIsLoading(false);
      } else {
        // Don't stop loading — handleFail will transition straight to logout overlay
        await handleFail();
      }
    } catch (err) {
      await handleFail();
    }
  };

  const handleFail = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsTimeout(false);
    setPassword("");
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      {isLoading && <FullPageLoading text="Verifying identity..." />}
      {isLoggingOut && <FullPageLoading text="Signing out..." />}
      <AnimatePresence>
        {isTimeout && isAuthenticated && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5"
            >
              <div className="flex flex-col items-center border-b border-slate-100 p-5 text-center">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Session Locked</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  For security, your session has been locked due to inactivity.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 pt-6">
                <div className="mb-6 rounded-lg bg-teal-50 p-4">
                  <p className="text-sm text-teal-800">
                    Locked user: <span className="font-bold">{user?.username || 'Unknown'}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Verify Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-10 text-sm outline-none transition-all focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                        placeholder="Enter your password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleFail}
                      disabled={isLoading}
                    >
                      Sign Out
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      className="flex-1"
                      disabled={isLoading || !password}
                    >
                      {isLoading ? <ButtonLoading text="Verifying..." /> : "Unlock"}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
