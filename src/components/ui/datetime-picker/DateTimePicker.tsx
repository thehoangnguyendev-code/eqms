import React, { useState, useRef, useEffect, useLayoutEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../button/Button';

/**
 * DateTimePicker component with calendar interface
 * 
 * @example
 * ```tsx
 * <DateTimePicker
 *   label="Effective Date"
 *   value={effectiveDate}
 *   onChange={setEffectiveDate}
 * />
 * ```
 */
export interface DateTimePickerProps {
  /** Label displayed above picker */
  label?: React.ReactNode;
  /** Current date value (ISO string) */
  value: string;
  /** Callback when date changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
}) => {
  const pickerId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  
  // Helper function to parse date string (supports both dd/MM/yyyy and ISO formats)
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Try dd/MM/yyyy format first
    const ddmmyyyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Try ISO format or other standard formats
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Initialize state from value or defaults
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => 
    value ? parseDate(value) : null
  );
  
  const [viewDate, setViewDate] = useState<Date>(() => 
    value ? parseDate(value) || new Date() : new Date()
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ opacity: 0 });

  // Listen for custom event to close other dropdowns
  useEffect(() => {
    const handleCloseOtherDropdowns = (event: CustomEvent<{ openId: string }>) => {
      if (event.detail.openId !== pickerId && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('select-dropdown-open' as any, handleCloseOtherDropdowns);
    return () => {
      window.removeEventListener('select-dropdown-open' as any, handleCloseOtherDropdowns);
    };
  }, [pickerId, isOpen]);

  // Handle positioning
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        if (!triggerRef.current) return;
        
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        const popoverWidth = 280;
        const realHeight = popoverRef.current?.offsetHeight || 370;
        
        let left = triggerRect.left;
        let style: React.CSSProperties = {
          position: 'fixed',
          zIndex: 9999,
          opacity: 1,
        };
        
        // Horizontal adjustment
        if (left + popoverWidth > screenWidth - 20) {
          left = screenWidth - popoverWidth - 20;
        }
        if (left < 20) left = 20;
        style.left = left;
        
        // Vertical adjustment
        const spaceBelow = screenHeight - triggerRect.bottom - 8;
        const spaceAbove = triggerRect.top - 8;
        
        // Flip up if space below is insufficient and space above is better
        if (spaceBelow < realHeight && spaceAbove > spaceBelow) {
          style.bottom = screenHeight - triggerRect.top + 8;
          style.top = 'auto';
        } else {
          style.top = triggerRect.bottom + 8;
          style.bottom = 'auto';
        }

        setPopoverStyle(style);
      };

      // Initial update
      updatePosition();
      // Update when popover ref is ready (e.g. after first render in this layout effect)
      requestAnimationFrame(updatePosition);

      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, viewMode, viewDate]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Sync with external value changes
  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      if (d) {
        setSelectedDate(d);
        setViewDate(d);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Reset view mode when opening
  useEffect(() => {
    if (isOpen) {
      setViewMode('calendar');
    }
  }, [isOpen]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setViewDate(newDate);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(monthIndex);
    setViewDate(newDate);
    setViewMode('calendar');
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setViewMode('calendar');
  };

  const handleApply = () => {
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      
      // Return dd/MM/yyyy format
      onChange(`${day}/${month}/${year}`);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSelectedDate(null);
    setIsOpen(false);
  };

  const renderMonthView = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <button 
            onClick={() => setViewMode('calendar')} 
            className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-slate-900 text-sm">Select Month</span>
          <div className="w-6"></div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {months.map((m, idx) => (
            <button
              key={m}
              onClick={() => handleMonthSelect(idx)}
              className={cn(
                "h-8 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors",
                viewDate.getMonth() === idx ? "bg-emerald-50 text-emerald-600" : "text-slate-700"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const currentYear = viewDate.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    const years = [];
    for (let i = 0; i < 12; i++) {
      years.push(startYear + i);
    }

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <button 
            onClick={() => {
              const d = new Date(viewDate);
              d.setFullYear(d.getFullYear() - 12);
              setViewDate(d);
            }} 
            className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-slate-900 text-sm">
            {startYear} - {startYear + 11}
          </span>
          <button 
            onClick={() => {
              const d = new Date(viewDate);
              d.setFullYear(d.getFullYear() + 12);
              setViewDate(d);
            }} 
            className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => handleYearSelect(y)}
              className={cn(
                "h-8 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors",
                viewDate.getFullYear() === y ? "bg-emerald-50 text-emerald-600" : "text-slate-700"
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    if (viewMode === 'month') return renderMonthView();
    if (viewMode === 'year') return renderYearView();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;

      const isToday = new Date().getDate() === day && 
        new Date().getMonth() === month && 
        new Date().getFullYear() === year;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={cn(
            "h-8 w-8 rounded-full text-xs flex items-center justify-center transition-colors",
            isSelected 
              ? 'bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700' 
              : isToday
                ? 'text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-100'
                : 'text-slate-700 hover:bg-slate-100'
          )}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            type="button"
            onClick={() => navigateMonth('prev')}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setViewMode('month')}
              className="font-semibold text-slate-900 text-sm hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors"
            >
              {monthNames[month]}
            </button>
            <button 
              onClick={() => setViewMode('year')}
              className="font-semibold text-slate-900 text-sm hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors"
            >
              {year}
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => navigateMonth('next')}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0 mb-1">
          {dayNames.map((day, idx) => (
            <div key={idx} className="h-6 flex items-center justify-center text-xs font-medium text-slate-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5">
          {days}
        </div>
      </div>
    );
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    const d = parseDate(value);
    if (!d) return placeholder;
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="relative w-full">
      {label && (
        <label htmlFor={`${pickerId}-trigger`} className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={`${pickerId}-trigger`}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => {
          if (disabled) return;
          if (!isOpen) {
            window.dispatchEvent(new CustomEvent('select-dropdown-open', { detail: { openId: pickerId } }));
          }
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between gap-2 w-full px-3 py-2 h-9 rounded-lg text-sm transition-colors focus:outline-none',
          'border bg-white',
          disabled
            ? 'bg-slate-50 cursor-default text-slate-500 border-slate-200'
            : isOpen
              ? 'ring-1 ring-emerald-500 border-emerald-500'
              : 'border-slate-200 hover:border-slate-300 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500'
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className={cn(
            "h-4 w-4 shrink-0",
            value ? "text-slate-900" : "text-slate-400"
          )} />
          <span className={cn("truncate", !value && "text-slate-400")}>
            {formatDisplayValue()}
          </span>
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0', 
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && createPortal(
        <div 
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label="Choose date"
          style={popoverStyle}
          className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col w-[280px]"
        >
          {renderCalendar()}
          
          <div className="border-t border-slate-100 p-2 px-3 bg-slate-50/50">
            <div className="flex items-center justify-between gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClear}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                Clear
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApply}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={!selectedDate}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
