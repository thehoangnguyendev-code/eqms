import React from "react";
import { cn } from "@/components/ui/utils";

export interface TabItem {
  id: string;
  label: string;
  /** Optional icon rendered before the label */
  icon?: React.ElementType;
  /** Optional count badge rendered after the label */
  count?: number;
}

interface TabNavProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  /**
   * Visual style variant:
   * - `"underline"` (default) — emerald bottom-border indicator inside a card border.
   *   Wrap TabNav + tab content in a `bg-white rounded-xl border` container.
   * - `"pill"` — segmented control on a slate background (e.g. Notifications).
   */
  variant?: "underline" | "pill";
  /** Additional className for the root container */
  className?: string;
}

/**
 * TabNav — Reusable tab navigation bar.
 *
 * **Underline variant** (default) — use inside a card container:
 * ```tsx
 * <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
 *   <TabNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
 *   <div className="animate-in fade-in duration-200">
 *     {renderTabContent()}
 *   </div>
 * </div>
 * ```
 *
 * **Pill variant** — standalone (e.g. Notifications):
 * ```tsx
 * <TabNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} variant="pill" />
 * ```
 *
 * Tab definition with optional icon and badge count:
 * ```tsx
 * const TABS: TabItem[] = [
 *   { id: "info",      label: "Information", icon: InfoIcon },
 *   { id: "training",  label: "Training" },
 *   { id: "audit",     label: "Audit Trail", count: 12 },
 * ];
 * ```
 */
export const TabNav: React.FC<TabNavProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className,
}) => {
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "flex gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-fit",
          className
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2 px-3 sm:px-4 py-2",
                "text-xs sm:text-sm font-medium rounded-lg transition-all duration-200",
                "flex-1 sm:flex-initial",
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5",
                    "text-xs font-semibold rounded-full",
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200/60 text-slate-500"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // --- Underline variant (default) ---
  return (
    <div className={cn("border-b border-slate-200", className)}>
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2.5",
                "text-xs sm:text-sm font-medium whitespace-nowrap",
                "border-b-2 border-r border-slate-200 last:border-r-0",
                "transition-colors",
                isActive
                  ? "border-b-emerald-600 text-emerald-700 bg-emerald-50/50"
                  : "border-b-transparent text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1",
                    "text-[10px] font-semibold rounded-full",
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
