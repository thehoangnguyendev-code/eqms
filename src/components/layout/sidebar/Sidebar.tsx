import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NavItem } from "@/types";
import { NAV_CONFIG, findNodeByPath } from "@/app/constants";
import { isTransactionalRoute } from "@/app/routes.constants";
import { cn } from "@/components/ui/utils";
import { useAuth } from "@/contexts/AuthContext";
import { SearchDropdown } from "../header/SearchDropdown";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import logoFull from "@/assets/images/logo_nobg.png";
import logoCollapsed from "@/assets/images/LOGO.png";
import "./Sidebar.module.css";
import { IconStar } from "@tabler/icons-react";

// Constants
const BASE_PADDING = 12;
const LEVEL_PADDING = 16;
const MENU_WIDTH = 320;
const MENU_GAP = 8;
const SAFE_PADDING = 16;
const MAX_MENU_HEIGHT = 600;

// Filter nav items by user role (recursive)
const filterNavByRole = (items: NavItem[], userRole?: string): NavItem[] => {
  return items
    .filter(
      (item) =>
        !item.allowedRoles ||
        (userRole && item.allowedRoles.includes(userRole as any)),
    )
    .map((item) => {
      if (item.children) {
        return { ...item, children: filterNavByRole(item.children, userRole) };
      }
      return item;
    });
};

// Helper function to find parent IDs of active item
const findParentIds = (
  items: NavItem[],
  targetId: string,
  path: string[] = [],
): string[] => {
  for (const item of items) {
    if (item.id === targetId) return path;
    if (item.children) {
      const result = findParentIds(item.children, targetId, [...path, item.id]);
      if (
        result.length > 0 ||
        (result.length === 0 && item.children.some((c) => c.id === targetId))
      ) {
        return [...path, item.id];
      }
    }
  }
  return [];
};

interface SidebarProps {
  isCollapsed: boolean;
  activeId: string;
  onNavigate: (id: string) => void;
  isMobileOpen: boolean;
  onClose: () => void;
  onToggleSidebar: () => void; // Add toggle function
}

interface HoverMenuState {
  isOpen: boolean;
  item: NavItem | null;
  position: { top: number; left: number; showAbove: boolean };
  expandedSubItems: string[];
}

interface TooltipState {
  isVisible: boolean;
  label: string;
  position: { top: number; left: number };
}

export const Sidebar: React.FC<SidebarProps> = React.memo(
  ({
    isCollapsed,
    activeId,
    onNavigate,
    isMobileOpen,
    onClose,
    onToggleSidebar,
  }) => {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | "favourite">("all");
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const { user } = useAuth();
    const location = useLocation();

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [pendingNavId, setPendingNavId] = useState<string | null>(null);
    const [pendingNavLabel, setPendingNavLabel] = useState<string>("");
    const [pendingPageTitle, setPendingPageTitle] = useState<string>("");
    const [shakingId, setShakingId] = useState<string | null>(null);

    // Filter nav items based on user role
    const filteredNav = useMemo(
      () => filterNavByRole(NAV_CONFIG, user?.role),
      [user?.role],
    );

    // Recursive filter for favorite items - preserves hierarchy
    const filterFavoriteItems = useCallback(
      (items: NavItem[]): NavItem[] => {
        return items
          .map((item) => {
            const hasChildren = item.children?.length;
            if (hasChildren) {
              const filteredChildren = filterFavoriteItems(item.children || []);
              if (filteredChildren.length > 0) {
                return { ...item, children: filteredChildren };
              }
            } else if (favoriteIds.includes(item.id)) {
              return item;
            }
            return null;
          })
          .filter((item): item is NavItem => item !== null);
      },
      [favoriteIds],
    );

    // Filter nav items by active tab
    const displayedNav = useMemo(() => {
      if (activeTab === "all") {
        return filteredNav;
      }

      // For favorite tab, recursively filter to show only favorite items and their parents
      return filterFavoriteItems(filteredNav);
    }, [filteredNav, activeTab, filterFavoriteItems]);

    const [hoverMenu, setHoverMenu] = useState<HoverMenuState>({
      isOpen: false,
      item: null,
      position: { top: 0, left: 0, showAbove: false },
      expandedSubItems: [],
    });
    const [tooltip, setTooltip] = useState<TooltipState>({
      isVisible: false,
      label: "",
      position: { top: 0, left: 0 },
    });

    const currentScreenLabel = useMemo(() => {
      const item = findNodeByPath(NAV_CONFIG, location.pathname);
      return item?.label || "";
    }, [location.pathname]);

    /** Lấy title hiện tại của trang: ưu tiên h1 trong main, rồi document.title, cuối cùng nav label. */
    const getCurrentPageTitle = useCallback(() => {
      const h1 = document.querySelector("main h1");
      const fromH1 = h1?.textContent?.trim();
      const fromDoc =
        typeof document !== "undefined" ? document.title?.trim() : "";
      return fromH1 || fromDoc || currentScreenLabel || "";
    }, [currentScreenLabel]);

    // Auto-expand parent items when activeId changes
    useEffect(() => {
      const parentIds = findParentIds(NAV_CONFIG, activeId);
      if (parentIds.length > 0) {
        setExpandedItems((prev) =>
          Array.from(new Set([...prev, ...parentIds])),
        );
      }
    }, [activeId]);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
      if (isMobileOpen) {
        // Save current scroll position
        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
      } else {
        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || "0") * -1);
        }
      }

      // Cleanup on unmount
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
      };
    }, [isMobileOpen]);

    // Calculate menu position to prevent viewport overflow
    const calculateMenuPosition = useCallback((rect: DOMRect) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Menu dimensions
      const menuWidth = 280;
      const menuMaxHeight = 400; // Max height estimate
      const safeMargin = 8;

      // Check available space around the button
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;

      // Determine if menu should show above based on available space
      const shouldShowAbove =
        spaceBelow < menuMaxHeight && spaceAbove > spaceBelow;

      // Horizontal positioning - always to the right of sidebar with gap
      let left: number;
      if (spaceRight >= menuWidth + MENU_GAP) {
        // Show on right side (default)
        left = rect.right + MENU_GAP + window.scrollX;
      } else if (spaceLeft >= menuWidth + MENU_GAP) {
        // Show on left side if no space on right
        left = rect.left - menuWidth - MENU_GAP + window.scrollX;
      } else {
        // Center in viewport if no space on either side
        left = Math.max(
          safeMargin + window.scrollX,
          (viewportWidth - menuWidth) / 2 + window.scrollX,
        );
      }

      // Ensure menu doesn't overflow horizontally
      if (left + menuWidth > viewportWidth + window.scrollX - safeMargin) {
        left = viewportWidth - menuWidth - safeMargin + window.scrollX;
      }
      if (left < safeMargin + window.scrollX) {
        left = safeMargin + window.scrollX;
      }

      // Vertical positioning - align with button center, adjust if needed
      let top: number;

      if (shouldShowAbove) {
        // When showing above, position so bottom of menu aligns near bottom of button
        top = rect.bottom + window.scrollY + safeMargin;
      } else {
        // When showing below, align menu top with button top
        top = rect.top + window.scrollY;
      }

      // Ensure menu stays within viewport bounds
      const menuEstimatedHeight = Math.min(
        menuMaxHeight,
        viewportHeight - 2 * safeMargin,
      );

      if (shouldShowAbove) {
        // For showAbove mode, ensure there's enough space above
        const menuBottom = top;
        const menuTop = menuBottom - menuEstimatedHeight;

        if (menuTop < window.scrollY + safeMargin) {
          // Not enough space above, adjust to fit
          top = window.scrollY + safeMargin + menuEstimatedHeight;
        }
      } else {
        // For normal mode, ensure menu doesn't overflow bottom
        const menuBottom = top + menuEstimatedHeight;

        if (menuBottom > viewportHeight + window.scrollY - safeMargin) {
          // Adjust to fit within viewport
          top = Math.max(
            window.scrollY + safeMargin,
            viewportHeight + window.scrollY - menuEstimatedHeight - safeMargin,
          );
        }
      }

      return { top, left, showAbove: shouldShowAbove };
    }, []);

    // Handle click on menu item (collapsed mode)
    const handleMenuItemClick = useCallback(
      (item: NavItem, event: React.MouseEvent<HTMLButtonElement>) => {
        if (item.icon) setShakingId(item.id);
        if (!isCollapsed || !item.children?.length) return;

        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        const position = calculateMenuPosition(rect);

        setHoverMenu((prev) => {
          // Toggle: close if same item, open if different
          if (prev.isOpen && prev.item?.id === item.id) {
            return { ...prev, isOpen: false };
          }
          return {
            isOpen: true,
            item,
            position,
            expandedSubItems: [],
          };
        });
      },
      [isCollapsed, calculateMenuPosition],
    );

    // Memoized toggle handler
    const toggleExpand = useCallback((id: string, event: React.MouseEvent) => {
      event.stopPropagation();
      setExpandedItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    }, []);

    // Memoized item click handler
    const handleItemClick = useCallback(
      (item: NavItem) => {
        if (item.icon) setShakingId(item.id);
        if (item.children && !isCollapsed) {
          setExpandedItems((prev) =>
            prev.includes(item.id)
              ? prev.filter((i) => i !== item.id)
              : [...prev, item.id],
          );
          return;
        }

        const currentPath = location.pathname;
        const targetPath = item.path
          ? item.path.startsWith("/")
            ? item.path
            : `/${item.path}`
          : null;

        // If no path or same path, just navigate normally
        if (!targetPath || targetPath === currentPath) {
          onNavigate(item.id);
          onClose();
          return;
        }

        // Heuristic: warn when leaving transactional screens (review/new/edit/approval/etc.)
        const shouldWarn = isTransactionalRoute(currentPath);

        if (shouldWarn) {
          setPendingNavId(item.id);
          setPendingNavLabel(item.label);
          setPendingPageTitle(getCurrentPageTitle());
          setShowLeaveModal(true);
          return;
        }

        onNavigate(item.id);
        onClose();
      },
      [isCollapsed, location.pathname, onNavigate, onClose, getCurrentPageTitle],
    );

    // Handle tooltip show
    const handleTooltipShow = useCallback(
      (label: string, event: React.MouseEvent<HTMLButtonElement>) => {
        if (!isCollapsed) return;

        const rect = event.currentTarget.getBoundingClientRect();
        setTooltip({
          isVisible: true,
          label,
          position: {
            top: rect.top + rect.height / 2,
            left: rect.right + 8,
          },
        });
      },
      [isCollapsed],
    );

    // Handle tooltip hide
    const handleTooltipHide = useCallback(() => {
      setTooltip((prev) => ({ ...prev, isVisible: false }));
    }, []);

    // Memoized menu item renderer
    const renderMenuItem = useCallback(
      (item: NavItem, level: number = 0, index: number = 0) => {
        const hasChildren = Boolean(item.children?.length);
        const isExpanded = expandedItems.includes(item.id);
        const isActive = activeId === item.id;
        const Icon = item.icon;

        const paddingLeft = isCollapsed
          ? 0
          : level === 0
            ? BASE_PADDING
            : level * LEVEL_PADDING + BASE_PADDING;

        return (
          <>
            <div key={item.id} className="w-full relative">
              {!isCollapsed && level > 0 && (
                <div
                  className="absolute top-0 bottom-0 border-l border-slate-200 w-px z-0"
                  style={{ left: `${BASE_PADDING + 10 + (level - 1) * LEVEL_PADDING}px` }}
                />
              )}

              <button
                onClick={(e) => {
                  if (isCollapsed && hasChildren) {
                    handleMenuItemClick(item, e);
                  } else {
                    handleItemClick(item);
                  }
                }}
                onMouseEnter={(e) =>
                  level === 0 && handleTooltipShow(item.label, e)
                }
                onMouseLeave={handleTooltipHide}
                className={cn(
                  "w-full flex items-center group relative overflow-visible z-10 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20",
                  // Mobile: Taller touch target (h-12), Desktop: h-11
                  "h-12 md:h-11",
                  isCollapsed ? "justify-center px-0" : "justify-start pr-3",
                  isActive
                    ? "text-emerald-700"
                    : "text-slate-600 hover:text-slate-900 active:bg-slate-100",
                  !isCollapsed && level === 0 && "rounded-lg mx-2",
                )}
                style={{
                  paddingLeft: isCollapsed ? 0 : `${paddingLeft}px`,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Sliding active background indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className={cn(
                      "absolute inset-0 z-0",
                      level === 0 ? "bg-emerald-50 rounded-lg" : "bg-emerald-50/50",
                    )}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}

                {/* Active left border indicator */}
                {level === 0 && isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeNavBorder"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-600 rounded-r-full z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center relative z-10 shrink-0",
                    isCollapsed ? "w-full" : "w-5",
                  )}
                >
                  {Icon && (
                    <motion.div
                      animate={
                        shakingId === item.id
                          ? { rotate: [0, -7, 7, -7, 7, 0], scale: [1, 1.1, 1] }
                          : isActive
                            ? { scale: [1, 1.12, 1] }
                            : {}
                      }
                      onAnimationComplete={() => setShakingId(null)}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          // Use custom iconColor if provided, otherwise use default colors
                          isActive
                            ? "text-emerald-700"
                            : item.iconColor
                              ? `${item.iconColor} group-hover:opacity-80`
                              : "text-slate-500 group-hover:text-slate-900",
                        )}
                      />
                    </motion.div>
                  )}
                  {!Icon && level > 0 && !isCollapsed && (
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors duration-200",
                        isActive
                          ? "bg-emerald-600"
                          : "bg-slate-300 group-hover:bg-slate-900",
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div
                  className={cn(
                    "overflow-hidden flex-1 relative z-10",
                    isCollapsed
                      ? "max-w-0 opacity-0 ml-0 transition-all duration-150 ease-in"
                      : "opacity-100 ml-2 transition-all duration-250 ease-out delay-75",
                  )}
                  style={{
                    willChange: isCollapsed ? "auto" : "opacity, max-width",
                  }}
                >
                  <span
                    className={cn(
                      "block text-sm text-left whitespace-nowrap leading-tight",
                      "overflow-hidden",
                      isActive
                        ? "font-semibold text-emerald-700"
                        : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Chevron or Star icon */}
                {hasChildren && !isCollapsed && (
                  <div
                    onClick={(e) => toggleExpand(item.id, e)}
                    className={cn(
                      "ml-auto rounded-lg flex items-center justify-center h-6 w-6 relative z-10",
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-slate-400",
                        isExpanded && "rotate-90",
                      )}
                      style={{
                        transition:
                          "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                        willChange: "transform",
                      }}
                    />
                  </div>
                )}

                {/* Star icon for favorites - only for leaf nodes (no children) at any level */}
                {!hasChildren && !isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFavoriteIds((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id],
                      );
                    }}
                    className={cn(
                      "ml-auto flex items-center justify-center h-6 w-6 rounded-lg hover:text-emerald-600 transition-all duration-200 shrink-0 relative z-10",
                      favoriteIds.includes(item.id)
                        ? "opacity-100 text-emerald-600"
                        : "opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-400",
                    )}
                    title="Add to favorites"
                  >
                    <IconStar
                      className={cn(
                        "h-4 w-4 transition-all duration-200",
                        favoriteIds.includes(item.id) && "fill-emerald-600",
                      )}
                    />
                  </button>
                )}
              </button>

              {/* Expanded children (only in expanded sidebar) */}
              <AnimatePresence initial={false}>
                {hasChildren && !isCollapsed && isExpanded && (
                  <motion.div
                    key={`submenu-${item.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: [0.4, 0, 0.2, 1] 
                    }}
                    className="overflow-hidden"
                  >
                    <div className="relative pt-1">
                      {item.children?.map((child, childIndex) =>
                        renderMenuItem(child, level + 1, childIndex),
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider after item if specified */}
            {level === 0 && item.showDividerAfter && (
              <div className={cn("my-1", isCollapsed ? "mx-3" : "mx-4")}>
                <div className="h-px bg-slate-200" />
              </div>
            )}
          </>
        );
      },
      [
        expandedItems,
        activeId,
        isCollapsed,
        toggleExpand,
        handleItemClick,
        handleMenuItemClick,
        handleTooltipShow,
        handleTooltipHide,
        hoverMenu.isOpen,
        hoverMenu.item,
        setHoverMenu,
        onNavigate,
        onClose,
        favoriteIds,
        setFavoriteIds,
        shakingId,
      ],
    );

    // Tooltip portal component
    const TooltipPortal = () => {
      if (!tooltip.isVisible || !isCollapsed) return null;

      return createPortal(
        <div
          className="fixed z-[60] px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none shadow-lg"
          style={{
            top: `${tooltip.position.top}px`,
            left: `${tooltip.position.left}px`,
            transform: "translateY(-50%)",
          }}
        >
          {tooltip.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900" />
        </div>,
        document.body,
      );
    };

    // Handle hover menu sub-item click
    const handleSubItemClick = useCallback(
      (item: NavItem, hasChildren: boolean) => {
        if (item.icon) setShakingId(item.id);
        if (hasChildren) {
          setHoverMenu((prev) => ({
            ...prev,
            expandedSubItems: prev.expandedSubItems.includes(item.id)
              ? prev.expandedSubItems.filter((id) => id !== item.id)
              : [...prev.expandedSubItems, item.id],
          }));
          return;
        }

        const currentPath = location.pathname;
        const targetPath = item.path
          ? item.path.startsWith("/")
            ? item.path
            : `/${item.path}`
          : null;

        if (!targetPath || targetPath === currentPath) {
          onNavigate(item.id);
          setHoverMenu((prev) => ({ ...prev, isOpen: false }));
          onClose();
          return;
        }

        if (isTransactionalRoute(currentPath)) {
          setPendingNavId(item.id);
          setPendingNavLabel(item.label);
          setPendingPageTitle(getCurrentPageTitle());
          setShowLeaveModal(true);
          setHoverMenu((prev) => ({ ...prev, isOpen: false }));
          return;
        }

        onNavigate(item.id);
        setHoverMenu((prev) => ({ ...prev, isOpen: false }));
        onClose();
      },
      [onNavigate, onClose, location.pathname, getCurrentPageTitle, isCollapsed],
    );

    // Render hover menu sub-item
    const renderHoverSubItem = useCallback(
      (item: NavItem, level: number = 1) => {
        const hasChildren = Boolean(item.children?.length);
        const isExpanded = hoverMenu.expandedSubItems.includes(item.id);
        const isActive = activeId === item.id;

        return (
          <div key={item.id} className="w-full">
            <button
              onClick={() => handleSubItemClick(item, hasChildren)}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors group",
                isActive
                  ? "text-emerald-700 bg-emerald-50 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {level >= 2 && (
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-200",
                    isActive
                      ? "bg-emerald-600"
                      : "bg-slate-300 group-hover:bg-slate-900",
                  )}
                />
              )}
              <span
                className={cn(
                  "flex-1 text-left break-words leading-tight",
                  level >= 2 ? "ml-0" : "ml-3",
                )}
              >
                {item.label}
              </span>
              {hasChildren && (
                <div className="rounded-lg flex items-center justify-center h-6 w-6 shrink-0">
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-slate-400",
                      isExpanded && "rotate-90",
                    )}
                    style={{
                      transition:
                        "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                      willChange: "transform",
                    }}
                  />
                </div>
              )}
            </button>

            {hasChildren && (
              <div
                className={cn(
                  "grid bg-slate-50/50",
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
                style={{
                  transition:
                    "grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5">
                  <div className="pl-3 py-1">
                    {item.children?.map((child) =>
                      renderHoverSubItem(child, level + 1),
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      },
      [hoverMenu.expandedSubItems, activeId, handleSubItemClick],
    );

    // Hover menu portal component
    const HoverMenuPortal = () => {
      if (!hoverMenu.isOpen || !hoverMenu.item || !isCollapsed) return null;

      return createPortal(
        <>
          {/* Invisible backdrop to detect outside clicks */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setHoverMenu((prev) => ({ ...prev, isOpen: false }))}
            aria-hidden="true"
          />

          {/* Menu content */}
          <div
            className="fixed z-50 min-w-[240px] max-w-[280px] bg-white rounded-xl border border-slate-200 shadow-xl origin-left"
            style={{
              top: `${hoverMenu.position.top}px`,
              left: `${hoverMenu.position.left}px`,
              transform: hoverMenu.position.showAbove
                ? "translateY(-100%)"
                : "none",
              maxHeight: "calc(100vh - 32px)",
            }}
          >
            {/* Menu header */}
            <div className="px-4 py-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                {hoverMenu.item.icon && (
                  <hoverMenu.item.icon
                    className={cn(
                      "h-5 w-5",
                      hoverMenu.item.iconColor || "text-slate-600",
                    )}
                  />
                )}
                <span className="font-semibold text-sm text-slate-900 text-left break-words leading-tight">
                  {hoverMenu.item.label}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div
              className="py-1 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            >
              {hoverMenu.item.children?.map((child) =>
                renderHoverSubItem(child),
              )}
            </div>
          </div>
        </>,
        document.body,
      );
    };

    return (
      <>
        {/* Tooltip Portal */}
        <TooltipPortal />

        {/* Hover Menu Portal */}
        <HoverMenuPortal />

        {/* Mobile Overlay Backdrop - Only show on mobile (<768px) */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
            style={{
              WebkitTapHighlightColor: "transparent",
              animation: "fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
              opacity: 0,
            }}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-slate-200 flex flex-col shadow-lg md:shadow-sm sidebar-mobile",
            "fixed top-0 left-0 bottom-0 z-50",
            "md:sticky md:top-0 md:z-30 md:h-screen",

            // PHẦN CHỈNH SỬA TẠI ĐÂY:
            isCollapsed
              ? "w-16 md:w-20"
              : "w-[275px] md:w-[290px] max-w-[90vw]", // Tăng mobile lên 300px và max 90% màn hình

            "md:translate-x-0",
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0",
          )}
          style={{
            // Mobile: Custom easing for smooth slide
            transition:
              window.innerWidth < 768
                ? "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)"
                : isCollapsed
                  ? "width 250ms cubic-bezier(0.4, 0, 0.2, 1)"
                  : "width 350ms cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: window.innerWidth < 768 ? "transform" : "width",
            // Safe area for notch/Dynamic Island (top) and landscape edges
            // Bottom is NOT set here - handled by nav container padding for proper scroll
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingLeft: "env(safe-area-inset-left, 0px)",
            // Use dvh for iOS Safari
            height: "100dvh",
            minHeight: "100vh",
          }}
        >
          {/* Header / Logo Area */}
          <div
            className={cn(
              "flex items-center border-b border-slate-100 bg-white relative shrink-0",
              "transition-all duration-300 ease-in-out",
              // Mobile: Higher header with close button
              "h-14 md:h-14",
              isCollapsed ? "justify-center px-0" : "justify-between px-5",
            )}
          >
            {/* Logo */}
            <div
              className={cn(
                "flex items-center justify-center overflow-hidden",
                isCollapsed
                  ? "w-full transition-all duration-200 ease-in"
                  : "flex-1 transition-all duration-300 ease-out",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center shrink-0",
                  isCollapsed ? "h-10 w-10" : "h-9 w-auto",
                )}
              >
                <img
                  src={isCollapsed ? logoCollapsed : logoFull}
                  alt="Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* Close button for mobile */}
            {!isCollapsed && (
              <button
                onClick={onClose}
                className={cn(
                  "md:hidden flex items-center justify-center h-10 w-10 rounded-lg",
                  "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  "transition-colors duration-200 active:scale-95",
                  "-mr-2",
                )}
                aria-label="Close sidebar"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Bar - Only show when expanded */}
          {!isCollapsed && (
            <div className="px-3 py-3 border-b border-slate-100 shrink-0">
              <SearchDropdown onCloseSidebar={onClose} />
            </div>
          )}

          {/* Tabs: All / Favourite - Only show when expanded */}
          {!isCollapsed && (
            <div className="px-3 py-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 relative overflow-hidden">
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative z-10",
                    activeTab === "all" ? "text-emerald-600" : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {activeTab === "all" && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white rounded-md shadow-sm pointer-events-none"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-20">All Items</span>
                </button>
                <button
                  onClick={() => setActiveTab("favourite")}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative z-10",
                    activeTab === "favourite"
                      ? "text-emerald-600"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {activeTab === "favourite" && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white rounded-md shadow-sm pointer-events-none"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <div className="relative z-20 flex items-center justify-center gap-1.5">
                    <span>Favourite</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div
            className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden scroll-smooth",
              // Mobile: More padding for easier scrolling
              "pt-4 md:pt-3 md:pb-3",
            )}
            style={{
              // Smooth scrolling on mobile with momentum
              WebkitOverflowScrolling: "touch",
              // Thin and light scrollbar
              scrollbarWidth: "thin",
              scrollbarColor: "#e2e8f0 transparent",
              // Ensure scroll works properly
              overscrollBehavior: "contain",
              // GPU acceleration for smoother scrolling
              willChange: "scroll-position",
              transform: "translateZ(0)",
              // Safe area padding bottom for iPad/iPhone
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
            }}
          >
            <nav
              className={cn(
                // Mobile: Larger spacing between items
                "space-y-1 md:space-y-0.5",
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {displayedNav.map((item, index) =>
                    renderMenuItem(item, 0, index),
                  )}
                </motion.div>
              </AnimatePresence>
            </nav>

            {/* Extra spacer at bottom for mobile/tablet to ensure last items are accessible */}
            <div
              className="md:hidden shrink-0"
              style={{
                height: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
                minHeight: "40px",
              }}
              aria-hidden="true"
            />
          </div>
        </aside>

        <AlertModal
          isOpen={showLeaveModal}
          onClose={() => {
            setShowLeaveModal(false);
            setPendingNavId(null);
            setPendingNavLabel("");
            setPendingPageTitle("");
          }}
          onConfirm={() => {
            if (pendingNavId) {
              onNavigate(pendingNavId);
              onClose();
            }
            setShowLeaveModal(false);
            setPendingNavId(null);
            setPendingNavLabel("");
            setPendingPageTitle("");
          }}
          type="warning"
          title="Leave current page?"
          description={
            <>
              <p className="mb-1">
                You are currently working in{" "}
                <span className="font-semibold">
                  {pendingPageTitle || currentScreenLabel || "this screen"}
                </span>
                .
              </p>
              <p className="text-xs text-slate-500">
                If you navigate to{" "}
                <span className="font-semibold">
                  {pendingNavLabel || "another page"}
                </span>
                , any unsaved progress on this screen may be lost.
              </p>
            </>
          }
          confirmText="Leave page"
          cancelText="Stay here"
        />
      </>
    );
  },
);
