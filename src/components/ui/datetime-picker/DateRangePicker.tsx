import React, { useState, useRef, useEffect, useLayoutEffect, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../button/Button';

export interface DateRangePickerProps {
  /** Label displayed above picker */
  label?: string;
  /** Start date value (dd/MM/yyyy) */
  startDate: string;
  /** End date value (dd/MM/yyyy) */
  endDate: string;
  /** Callback when start date changes */
  onStartDateChange: (value: string) => void;
  /** Callback when end date changes */
  onEndDateChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
}

// Helper to parse dd/MM/yyyy or ISO strings
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const ddmmyyyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const formatDateValue = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

const isInRange = (date: Date, start: Date | null, end: Date | null): boolean => {
  if (!start || !end) return false;
  const t = date.getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t > s && t < e;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholder = "Select date range",
  disabled = false,
}) => {
  const pickerId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const [activeField, setActiveField] = useState<'start' | 'end'>('start');

  const [localStart, setLocalStart] = useState<Date | null>(() => parseDate(startDate));
  const [localEnd, setLocalEnd] = useState<Date | null>(() => parseDate(endDate));
  const [viewDate, setViewDate] = useState<Date>(() => parseDate(startDate) || new Date());

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ opacity: 0 });

  // Close other dropdowns
  useEffect(() => {
    const handler = (event: CustomEvent<{ openId: string }>) => {
      if (event.detail.openId !== pickerId && isOpen) setIsOpen(false);
    };
    window.addEventListener('select-dropdown-open' as any, handler);
    return () => window.removeEventListener('select-dropdown-open' as any, handler);
  }, [pickerId, isOpen]);

  // Position
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const update = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const sw = window.innerWidth;
        const sh = window.innerHeight;
        const pw = 300;
        const ph = popoverRef.current?.offsetHeight || 460;

        let left = rect.left;
        const style: React.CSSProperties = { position: 'fixed', zIndex: 9999, opacity: 1 };

        if (left + pw > sw - 20) left = sw - pw - 20;
        if (left < 20) left = 20;
        style.left = left;

        const spaceBelow = sh - rect.bottom - 8;
        const spaceAbove = rect.top - 8;
        if (spaceBelow < ph && spaceAbove > spaceBelow) {
          style.bottom = sh - rect.top + 8;
          style.top = 'auto';
        } else {
          style.top = rect.bottom + 8;
          style.bottom = 'auto';
        }
        setPopoverStyle(style);
      };
      update();
      requestAnimationFrame(update);
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      };
    }
  }, [isOpen, viewMode, viewDate]);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  // Sync external values
  useEffect(() => {
    setLocalStart(parseDate(startDate));
  }, [startDate]);
  useEffect(() => {
    setLocalEnd(parseDate(endDate));
  }, [endDate]);

  useEffect(() => {
    if (isOpen) setViewMode('calendar');
  }, [isOpen]);

  const navigateMonth = (dir: 'prev' | 'next') => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
    setViewDate(d);
  };

  const handleDateClick = (day: number) => {
    const clicked = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (activeField === 'start') {
      setLocalStart(clicked);
      // If end is before start, clear it
      if (localEnd && clicked > localEnd) setLocalEnd(null);
      setActiveField('end');
    } else {
      // If clicked before start, swap
      if (localStart && clicked < localStart) {
        setLocalEnd(localStart);
        setLocalStart(clicked);
      } else {
        setLocalEnd(clicked);
      }
    }
  };

  const handleMonthSelect = (idx: number) => {
    const d = new Date(viewDate);
    d.setMonth(idx);
    setViewDate(d);
    setViewMode('calendar');
  };

  const handleYearSelect = (y: number) => {
    const d = new Date(viewDate);
    d.setFullYear(y);
    setViewDate(d);
    setViewMode('calendar');
  };

  const handleApply = () => {
    if (localStart) onStartDateChange(formatDateValue(localStart));
    else onStartDateChange('');
    if (localEnd) onEndDateChange(formatDateValue(localEnd));
    else onEndDateChange('');
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalStart(null);
    setLocalEnd(null);
    setActiveField('start');
    onStartDateChange('');
    onEndDateChange('');
  };

  // Display value for trigger
  const displayValue = useMemo(() => {
    const s = formatDateDisplay(startDate);
    const e = formatDateDisplay(endDate);
    if (s && e) return `${s}  →  ${e}`;
    if (s) return `From ${s}`;
    if (e) return `To ${e}`;
    return placeholder;
  }, [startDate, endDate, placeholder]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const renderMonthView = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <button onClick={() => setViewMode('calendar')} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-slate-900 text-sm">Select Month</span>
          <div className="w-6" />
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
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <button onClick={() => { const d = new Date(viewDate); d.setFullYear(d.getFullYear() - 12); setViewDate(d); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-slate-900 text-sm">{startYear} - {startYear + 11}</span>
          <button onClick={() => { const d = new Date(viewDate); d.setFullYear(d.getFullYear() + 12); setViewDate(d); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
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
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDay.getDay();
    const today = new Date();

    const days: React.ReactNode[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`e-${i}`} className="h-9 w-9" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(year, month, day);
      const isStart = localStart && isSameDay(current, localStart);
      const isEnd = localEnd && isSameDay(current, localEnd);
      const isSelected = isStart || isEnd;
      const inRange = isInRange(current, localStart, localEnd);
      const isToday = isSameDay(current, today);

      // Range highlight background
      const isRangeStart = isStart && localEnd;
      const isRangeEnd = isEnd && localStart;

      days.push(
        <div
          key={day}
          className={cn(
            "relative flex items-center justify-center h-8",
            // Range background spans full cell width
            inRange && "bg-emerald-50",
            isRangeStart && "bg-gradient-to-r from-transparent via-emerald-50 to-emerald-50 rounded-l-full",
            isRangeEnd && "bg-gradient-to-l from-transparent via-emerald-50 to-emerald-50 rounded-r-full",
          )}
        >
          <button
            type="button"
            onClick={() => handleDateClick(day)}
            className={cn(
              "h-8 w-8 rounded-full text-xs flex items-center justify-center transition-colors relative z-10",
              isSelected
                ? 'bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700'
                : isToday
                  ? 'text-emerald-600 font-bold border border-emerald-300 hover:bg-emerald-50'
                  : 'text-slate-700 hover:bg-slate-100'
            )}
          >
            {day}
          </button>
        </div>
      );
    }

    return (
      <div className="px-4 pt-1.5 pb-2">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            type="button"
            onClick={() => navigateMonth('prev')}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
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
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0 mb-0.5">
          {dayNames.map((d, i) => (
            <div key={i} className="h-6 flex items-center justify-center text-xs font-semibold text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {days}
        </div>
      </div>
    );
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
          <CalendarIcon className={cn("h-4 w-4 shrink-0", (startDate || endDate) ? "text-slate-900" : "text-slate-400")} />
          <span className={cn("truncate", !(startDate || endDate) && "text-slate-400")}>
            {displayValue}
          </span>
        </div>
      </button>

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label="Choose date range"
          style={popoverStyle}
          className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col w-[300px]"
        >
          {/* Start / Due date inputs */}
          <div className="px-4 pt-4 pb-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Start */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Start</label>
                <button
                  type="button"
                  onClick={() => setActiveField('start')}
                  className={cn(
                    "flex items-center gap-1.5 w-full px-3 py-1.5 h-8 rounded-lg text-sm border transition-colors",
                    activeField === 'start'
                      ? "border-emerald-400 ring-1 ring-emerald-200"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className={cn("truncate text-xs", localStart ? "text-slate-900" : "text-slate-400")}>
                    {localStart ? formatDateDisplay(formatDateValue(localStart)) : 'dd/mm/yyyy'}
                  </span>
                </button>
              </div>
              {/* Due/End */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Due</label>
                <button
                  type="button"
                  onClick={() => setActiveField('end')}
                  className={cn(
                    "flex items-center gap-1.5 w-full px-3 py-1.5 h-8 rounded-lg text-sm border transition-colors",
                    activeField === 'end'
                      ? "border-emerald-400 ring-1 ring-emerald-200"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className={cn("truncate text-xs", localEnd ? "text-slate-900" : "text-slate-400")}>
                    {localEnd ? formatDateDisplay(formatDateValue(localEnd)) : 'dd/mm/yyyy'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Calendar */}
          {renderCalendar()}

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Reset all
              </button>
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
