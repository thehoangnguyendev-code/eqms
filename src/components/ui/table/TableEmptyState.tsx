import React from "react";
import { Search } from "lucide-react";
import { Button } from "../button/Button";

export interface TableEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Table Empty State Component
 * Hiển thị khi không có dữ liệu sau khi filter
 * 
 * @example
 * ```tsx
 * <TableEmptyState 
 *   title="No Results Found"
 *   description="Try adjusting your filters"
 *   actionLabel="Clear Filters"
 *   onAction={handleClearFilters}
 * />
 * ```
 */
export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  icon,
  title = "No Results Found",
  description = "We couldn't find any items matching your filters. Try adjusting your search criteria or clear filters.",
  actionLabel = "Clear Filters",
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-3 sm:px-4 bg-white text-center">
      <div className="h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 bg-slate-50 rounded-full flex items-center justify-center mb-2.5 sm:mb-3 md:mb-4">
        {icon || <Search className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 text-slate-300" />}
      </div>
      <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm md:text-base text-slate-500 max-w-xs sm:max-w-sm mx-auto mb-3 sm:mb-4 md:mb-6">
        {description}
      </p>
      {onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="h-9 px-4 gap-2 font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 whitespace-nowrap"
          type="button"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
