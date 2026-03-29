import React from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb/Breadcrumb";
import { cn } from "@/components/ui/utils";

interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Breadcrumb items. Use breadcrumbs.config.ts factory functions. */
  breadcrumbItems: BreadcrumbItem[];
  /** Action buttons rendered on the right side */
  actions?: React.ReactNode;
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
      <div className="w-full sm:w-auto sm:flex-1 min-w-0 overflow-hidden">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </h1>
        <Breadcrumb items={breadcrumbItems} />
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
