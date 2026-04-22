import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/app/routes.constants';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { Header } from '@/components/layout/header/Header';
import { PinnedNotificationsPanel } from '@/components/layout/header/NotificationsDropdown';
import { Footer } from '@/components/layout/footer/Footer';
import { NetworkStatusMonitor } from '@/components/layout/NetworkStatusMonitor';
import { ScrollToTop } from '@/components/ui/scroll-to-top/ScrollToTop';
import { useResponsiveSidebar } from './useResponsiveSidebar';
import { useNavigation } from './useNavigation';
import { resetViewportZoom, isIOSSafari } from '@/utils/viewport';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarCollapsed, isMobileMenuOpen, toggleSidebar, closeMobileMenu } = useResponsiveSidebar();
  const { activeId, handleNavigate } = useNavigation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Page title in header (shown when scrolled past page h1)
  const [headerTitle, setHeaderTitle] = useState('');
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const [isNotificationsPinnedDesktop, setIsNotificationsPinnedDesktop] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopViewport(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktopViewport && isNotificationsPinnedDesktop) {
      setIsNotificationsPinnedDesktop(false);
    }
  }, [isDesktopViewport, isNotificationsPinnedDesktop]);

  // Scroll to top on route change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  // Observe page title (h1) visibility for sticky header title
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Reset on route change
    setShowHeaderTitle(false);
    setHeaderTitle('');

    let intersectionObserver: IntersectionObserver | null = null;
    let currentH1: Element | null = null;
    let currentTitle = '';

    const syncTitle = () => {
      const h1 = scrollContainer.querySelector('main h1');
      if (h1) {
        // Always check text content — catches state-based navigation
        const newTitle = h1.textContent?.trim() || '';
        if (newTitle !== currentTitle) {
          currentTitle = newTitle;
          setHeaderTitle(newTitle);
        }

        // Re-attach IntersectionObserver only when the element changes
        if (h1 !== currentH1) {
          currentH1 = h1;
          intersectionObserver?.disconnect();
          intersectionObserver = new IntersectionObserver(
            ([entry]) => {
              setShowHeaderTitle(!entry.isIntersecting);
            },
            { root: scrollContainer, threshold: 0 }
          );
          intersectionObserver.observe(h1);
        }
      } else if (currentH1) {
        // h1 removed (transitioning between pages)
        currentH1 = null;
        currentTitle = '';
        setHeaderTitle('');
        setShowHeaderTitle(false);
        intersectionObserver?.disconnect();
      }
    };

    // Initial check
    syncTitle();

    // Watch DOM for any changes (handles lazy loading + state-based navigation)
    const domObserver = new MutationObserver(syncTitle);
    domObserver.observe(scrollContainer, { childList: true, subtree: true, characterData: true });

    return () => {
      domObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [location.pathname]);

  // Reset viewport zoom on iOS Safari
  useEffect(() => {
    if (isIOSSafari()) {
      const timer = setTimeout(() => {
        resetViewportZoom();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogout = () => {
    // Clear any auth tokens/session data here if needed
    // Navigate to login page
    navigate(ROUTES.LOGIN);
  };

  return (
    <div
      className="fixed inset-0 flex h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden"
      style={{
        // Viewport safe area support
        padding: '0',
        margin: '0',
      }}
    >
      {/* Network Status Monitor - Global */}
      <NetworkStatusMonitor />

      {/* Sidebar - Off-canvas on mobile, sticky on desktop */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        activeId={activeId}
        onNavigate={handleNavigate}
        isMobileOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onToggleSidebar={toggleSidebar}
      />

      {/* Mobile Backdrop - Blur effect when sidebar is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-150 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
          style={{
            // Ensure full coverage including safe areas
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header - Pinned at top via flex shrink-0 */}
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          onNavigateToProfile={() => navigate(ROUTES.PROFILE)}
          onLogout={handleLogout}
          headerTitle={headerTitle}
          showHeaderTitle={showHeaderTitle}
          isNotificationsPinnedDesktop={isNotificationsPinnedDesktop && isDesktopViewport}
          onToggleNotificationsPinnedDesktop={() => setIsNotificationsPinnedDesktop((prev) => !prev)}
        />

        {/* Scrollable Content Area - ONLY this div scrolls */}
        <div
          id="main-scroll-container"
          tabIndex={-1}
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Main Content: Responsive padding */}
          <main
            className="w-full p-4 md:p-6 lg:p-8 pb-6"
            style={{
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="w-full max-w-[1920px] mx-auto space-y-4 md:space-y-6">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Footer - Pinned at bottom via flex shrink-0 */}
        <Footer />
      </div>

      {isDesktopViewport && isNotificationsPinnedDesktop && (
        <PinnedNotificationsPanel onTogglePinned={() => setIsNotificationsPinnedDesktop(false)} />
      )}

      {/* Scroll To Top - Global */}
      <ScrollToTop
        scrollContainerRef={scrollContainerRef}
        isMobileMenuOpen={isMobileMenuOpen}
      />
    </div>
  );
};
