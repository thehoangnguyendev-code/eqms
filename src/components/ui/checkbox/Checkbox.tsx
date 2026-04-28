import React, { useId as useReactId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils';

/**
 * Checkbox component with custom styling
 * 
 * @example
 * ```tsx
 * <Checkbox 
 *   checked={isChecked} 
 *   onChange={setIsChecked}
 *   label="Accept terms" 
 * />
 * ```
 */
export interface CheckboxProps {
  /** Input element ID */
  id?: string;
  /** Checked state */
  checked?: boolean;
  /** Callback when checked state changes */
  onChange?: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Disable the checkbox */
  disabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the label */
  labelClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked = false,
  onChange,
  label,
  disabled = false,
  className,
  labelClassName,
}) => {
  const generatedId = useReactId();
  const checkboxId = id || generatedId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={cn('flex items-center gap-2 min-h-[40px] sm:min-h-0', className)}>
      <div className="relative flex items-center justify-start">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <label
          htmlFor={checkboxId}
          className={cn(
            'flex items-center justify-center w-5 h-5 rounded border-2 cursor-pointer transition-all',
            'peer-focus-visible:ring-1 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2',
            checked
              ? 'bg-emerald-600 border-emerald-600'
              : 'bg-white border-slate-200 hover:border-emerald-400',
            disabled && 'cursor-not-allowed'
          )}
        >
          {checked && (
            <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
          )}
        </label>
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          className={cn(
            'text-xs sm:text-sm font-medium text-slate-700 cursor-pointer select-none',
            labelClassName,
            disabled && 'cursor-not-allowed'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};
