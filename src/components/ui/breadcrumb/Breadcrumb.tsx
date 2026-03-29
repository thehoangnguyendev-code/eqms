import React from "react";
import { IconLayoutGrid, IconCaretRightFilled, IconChevronRight } from "@tabler/icons-react";

// --- Types ---
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** If provided, the item becomes clickable (button) */
  onClick?: () => void;
  /** Mark as the active/current page (last item styling) */
  isActive?: boolean;
}

interface BreadcrumbProps {
  /** Array of breadcrumb items from root to current page.
   *  The first item is always rendered as the Dashboard icon.
   *  The last item (or item with isActive) gets bold styling.
   *  Middle items collapse to "..." on small screens.
   */
  items: BreadcrumbItem[];
}

/**
 * Reusable Breadcrumb component.
 *
 * Usage:
 * ```tsx
 * import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
 * import { getBreadcrumbs } from "@/components/ui/breadcrumb/breadcrumbs.config";
 *
 * <Breadcrumb items={getBreadcrumbs("equipmentManagement")} />
 * ```
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="flex items-center gap-1.5 text-slate-500 mt-1 text-xs whitespace-nowrap overflow-x-auto">
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const isActive = item.isActive || isLast;
        const isMiddle = !isFirst && !isActive;

        return (
          <React.Fragment key={index}>
            {/* Render item */}
            {isFirst ? (
              // First item: always Dashboard icon
              item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="hover:text-emerald-600 transition-colors"
                  aria-label="Dashboard"
                >
                  <IconLayoutGrid className="h-4 w-4" />
                </button>
              ) : (
                <IconLayoutGrid className="h-4 w-4" />
              )
            ) : isActive ? (
              // Active/last item: bold
              <span className="text-slate-700 font-medium">{item.label}</span>
            ) : isMiddle && item.onClick ? (
              // Middle clickable item
              <>
                <button
                  onClick={item.onClick}
                  className="hidden sm:inline hover:text-emerald-600 transition-colors"
                >
                  {item.label}
                </button>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              // Middle non-clickable item
              <>
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">...</span>
              </>
            )}

            {/* Separator */}
            {!isLast && (
              <IconChevronRight className="h-4 w-4 text-slate-400 shrink-0 mx-0.5" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
export { Breadcrumb };
