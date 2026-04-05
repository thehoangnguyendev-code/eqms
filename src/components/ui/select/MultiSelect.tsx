import React, { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '../utils';
import { InlineLoading } from '../loading/Loading';

export interface MultiSelectOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface MultiSelectProps {
  label?: string;
  value: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  triggerClassName?: string;
  enableSearch?: boolean;
  disabled?: boolean;
  maxVisibleRows?: number;
  rowHeight?: number;
  maxVisibleTags?: number;
  isLoading?: boolean;
  loadingText?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  className,
  triggerClassName,
  enableSearch = true,
  disabled = false,
  maxVisibleRows = 5,
  rowHeight = 40,
  maxVisibleTags = 2,
  isLoading = false,
  loadingText = "Loading options...",
}) => {
  const selectId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, showAbove: false });
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tooltipTargetRef = useRef<HTMLSpanElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredOptions = enableSearch
    ? options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : options;

  const selectedOptions = options.filter((opt) => value.includes(opt.value));
  const visibleTags = selectedOptions.slice(0, maxVisibleTags);
  const remainingCount = selectedOptions.length - maxVisibleTags;
  const remainingOptions = selectedOptions.slice(maxVisibleTags);

  // Calculate dropdown position
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(maxVisibleRows * rowHeight + 100, 400); // Estimate dropdown height

      // Show above if not enough space below and more space above
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setPosition({
        top: showAbove ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        showAbove,
      });
    }
  };

  // Handle open/close
  const handleOpen = () => {
    if (disabled) return;
    updatePosition();
    setIsOpen(true);
    setSearchQuery("");
    setFocusedIndex(-1);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
    setFocusedIndex(-1);
  };

  const handleToggleOption = (optionValue: string | number) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveTag = (optionValue: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(filteredOptions.map(opt => opt.value));
    }
  };

  const handleTooltipOpen = (e: React.MouseEvent | React.TouchEvent | React.FocusEvent) => {
    e.stopPropagation();
    if (tooltipTargetRef.current) {
      const rect = tooltipTargetRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
      setShowTooltip(true);
    }
  };

  const isAllSelected = filteredOptions.length > 0 &&
    filteredOptions.every(opt => value.includes(opt.value));
  const isSomeSelected = value.length > 0 && !isAllSelected;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(filteredOptions.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleToggleOption(filteredOptions[focusedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        triggerRef.current?.focus();
        break;
      case 'Tab':
        handleClose();
        break;
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      handleClose();
    };

    // Delay to avoid catching the opening click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close tooltip on click outside
  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (tooltipTargetRef.current?.contains(target)) return;
      setShowTooltip(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && enableSearch && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, enableSearch]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Close other dropdowns
  useEffect(() => {
    const handleCloseOthers = (e: CustomEvent<{ id: string }>) => {
      if (e.detail.id !== selectId && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('select-open' as any, handleCloseOthers);
    return () => window.removeEventListener('select-open' as any, handleCloseOthers);
  }, [selectId, isOpen]);

  const handleTriggerClick = () => {
    if (isOpen) {
      handleClose();
    } else {
      window.dispatchEvent(new CustomEvent('select-open', { detail: { id: selectId } }));
      handleOpen();
    }
  };

  const searchHeight = enableSearch ? 56 : 0;
  const dropdownMaxHeight = maxVisibleRows * rowHeight + searchHeight + 8;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label htmlFor={`${selectId}-trigger`} className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        id={`${selectId}-trigger`}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${selectId}-listbox`}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border bg-white px-3 text-sm transition-colors focus:outline-none",
          "h-9",
          disabled
            ? "bg-slate-50 text-slate-500 cursor-default border-slate-200"
            : isOpen
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-slate-200 hover:border-slate-300 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-1 flex-nowrap flex-1 min-w-0 overflow-hidden">
          {selectedOptions.length === 0 ? (
            <span className="text-slate-400 text-left truncate">{placeholder}</span>
          ) : (
            <>
              {visibleTags.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 pl-1.5 pr-0.5 py-0 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 whitespace-nowrap shrink-0"
                >
                  <span className="">{option.label}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveTag(option.value, e)}
                    className="hover:bg-emerald-200/50 rounded-sm p-0.5 flex items-center justify-center transition-colors"
                    aria-label={`Remove ${option.label}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              {remainingCount > 0 && (
                <span
                  ref={tooltipTargetRef}
                  onMouseEnter={handleTooltipOpen}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTooltipOpen(e);
                  }}
                  className="text-[10px] text-slate-500 font-bold whitespace-nowrap px-1.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  +{remainingCount}
                </span>
              )}
            </>
          )}
        </div>
        {selectedOptions.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 shrink-0 ml-1"
            aria-label="Clear all selections"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform shrink-0 ml-2",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
          role="listbox"
          aria-multiselectable="true"
          id={`${selectId}-listbox`}
          style={{
            top: position.showAbove ? 'auto' : position.top,
            bottom: position.showAbove ? `${window.innerHeight - position.top}px` : 'auto',
            left: position.left,
            width: position.width,
            zIndex: 50,
            maxHeight: dropdownMaxHeight,
          }}
        >
          {/* Search */}
          {enableSearch && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-9 pl-9 pr-3 text-[16px] sm:text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight: maxVisibleRows * rowHeight }}
            onKeyDown={handleKeyDown}
          >
            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <InlineLoading size="sm" />
                <span className="text-sm text-slate-500">{loadingText}</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No results found
              </div>
            ) : (
              <>
                {/* Select All */}
                {filteredOptions.length > 1 && (
                  <div className="sticky top-0 bg-white border-b border-slate-100 z-10">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isAllSelected}
                      onClick={handleSelectAll}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors font-medium text-slate-700"
                    >
                      <div className="relative flex items-center justify-center">
                        <div
                          className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                            isAllSelected
                              ? "bg-emerald-600 border-emerald-600"
                              : isSomeSelected
                                ? "bg-emerald-600 border-emerald-600"
                                : "bg-white border-slate-300 hover:border-emerald-400"
                          )}
                        >
                          {isAllSelected ? (
                            <Check className="h-3 w-3 text-white stroke-[3]" />
                          ) : isSomeSelected ? (
                            <div className="h-2 w-2 bg-white rounded-sm" />
                          ) : null}
                        </div>
                      </div>
                      <span>
                        {isAllSelected
                          ? `Deselect All (${filteredOptions.length})`
                          : `Select All (${filteredOptions.length})`
                        }
                      </span>
                    </button>
                  </div>
                )}

                {/* Options List */}
                {filteredOptions.map((option, index) => {
                  const isSelected = value.includes(option.value);
                  const isFocused = index === focusedIndex;
                  return (
                    <button
                      key={option.value}
                      ref={el => { optionRefs.current[index] = el; }}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleToggleOption(option.value)}
                      className={cn(
                        "flex w-full items-center px-3 text-sm transition-colors",
                        "min-h-[44px] hover:bg-slate-50 active:bg-slate-100",
                        isSelected && "bg-emerald-50 text-emerald-700",
                        isFocused && "bg-slate-100 ring-1 ring-inset ring-slate-300"
                      )}
                      style={{ height: rowHeight }}
                    >
                      <span className="flex-1 text-left">{option.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Tags Tooltip Portal */}
      {showTooltip && remainingOptions.length > 0 && createPortal(
        <div
          className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="relative bg-white text-slate-900 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden min-w-[160px] max-w-[260px]">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Selected</span>
              <span className="inline-flex items-center justify-center h-4 min-w-[1rem] px-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {remainingOptions.length}
              </span>
            </div>
            {/* Tags list */}
            <div className="flex flex-col gap-0.5 p-2 max-h-[180px] overflow-y-auto">
              {remainingOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs text-slate-700 whitespace-nowrap font-medium">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[6px] border-transparent border-t-white z-[1]" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-slate-100" style={{ marginTop: '-1px', zIndex: 0 }} />
        </div>,
        document.body
      )}
    </div>
  );
};
