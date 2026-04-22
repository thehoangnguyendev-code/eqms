import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AUTH_UI } from "../auth-ui";

interface AuthLayoutProps {
  left: React.ReactNode;
  right?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ left, right }) => {
  const prefersReducedMotion = useReducedMotion();

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: "easeOut" as const };
  const leftPanelInitial = prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 };
  const rightPanelInitial = prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 };

  return (
    <div className={AUTH_UI.pageWrapper} role="main">
      <div className={AUTH_UI.cardWrapper}>
        <div className={AUTH_UI.gridWrapper}>
          <motion.div
            initial={leftPanelInitial}
            animate={{ opacity: 1, x: 0 }}
            transition={panelTransition}
            className={AUTH_UI.leftPanel}
          >
            {left}
          </motion.div>

          {right && (
            <motion.aside
              initial={rightPanelInitial}
              animate={{ opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? panelTransition : { ...panelTransition, delay: 0.05 }}
              className={AUTH_UI.rightPanel}
            >
              {right}
            </motion.aside>
          )}
        </div>
      </div>
    </div>
  );
};
