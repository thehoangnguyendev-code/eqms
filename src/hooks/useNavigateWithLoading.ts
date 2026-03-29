import { useState, useCallback } from 'react';
import { useNavigate, NavigateOptions } from 'react-router-dom';

export interface UseNavigateWithLoadingReturn {
  /** Whether a navigation is in progress (show FullPageLoading when true) */
  isNavigating: boolean;
  /**
   * Navigate to a route after a brief loading delay.
   * @param to      Route path or delta (same signature as react-router navigate)
   * @param options NavigateOptions (replace, state, etc.)
   * @param delay   Loading animation duration in ms (default: 600)
   */
  navigateTo: (to: string | number, options?: NavigateOptions, delay?: number) => void;
}

/**
 * Centralizes the "show loading overlay → navigate" pattern that was
 * copy-pasted in ~20 feature views.
 *
 * @example
 * ```tsx
 * const { navigateTo, isNavigating } = useNavigateWithLoading();
 *
 * // Trigger navigation
 * <Button onClick={() => navigateTo(ROUTES.SETTINGS.USERS)}>Back</Button>
 *
 * // Render overlay
 * {isNavigating && <FullPageLoading text="Loading..." />}
 * ```
 */
export function useNavigateWithLoading(): UseNavigateWithLoadingReturn {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateTo = useCallback(
    (to: string | number, options?: NavigateOptions, delay = 600) => {
      setIsNavigating(true);
      setTimeout(() => {
        if (typeof to === 'number') {
          navigate(to);
        } else {
          navigate(to, options);
        }
      }, delay);
    },
    [navigate]
  );

  return { isNavigating, navigateTo };
}
