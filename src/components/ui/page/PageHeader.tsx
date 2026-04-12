import React from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb/Breadcrumb";
import { cn } from "@/components/ui/utils";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Breadcrumb items. Use breadcrumbs.config.ts factory functions. */
  breadcrumbItems: BreadcrumbItem[];
  /** Action buttons rendered on the right side */
  actions?: React.ReactNode;
  /** Optional back button callback */
  onBack?: () => void;
  /** Additional className for the root container */
  className?: string;
}

/**
 * PageHeader — Standard page header used across all views.
 *
 * Layout:
 *   [Title + Breadcrumb]  ·····  [Actions]
 *
 * Usage:
 * ```tsx
 * import { PageHeader } from "@/components/ui/page/PageHeader";
 * import breadcrumbs from "@/components/ui/breadcrumb/breadcrumbs.config";
 *
 * <PageHeader
 *   title="Course List"
 *   breadcrumbItems={breadcrumbs.coursesList(navigate)}
 *   actions={
 *     <>
 *       <Button variant="outline" size="sm">Export</Button>
 *       <Button size="sm">+ New</Button>
 *     </>
 *   }
 * />
 * ```
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbItems,
  actions,
  onBack,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row flex-wrap items-start sm:items-end justify-between gap-4 md:gap-5",
        className
      )}
    >
      {/* Title + Breadcrumb */}
      <div className="w-full sm:w-auto sm:flex-1 min-w-0 overflow-hidden flex items-start gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="mt-1 flex-shrink-0 h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 overflow-hidden">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
          </h1>
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};
