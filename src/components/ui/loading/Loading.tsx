import React from 'react';
import { createPortal } from 'react-dom';
import { DashLoading } from 'respinner';
import { cn } from '../utils';

/**
 * Loading Component using respinner BeatLoading
 * 
 * Usage:
 * - <Loading /> - Default inline loading
 * - <Loading size="sm" /> - Small loading
 * - <Loading size="lg" /> - Large loading
 * - <Loading fullPage /> - Full page overlay loading
 * - <Loading color="#111111" /> - Custom color
 */

interface LoadingProps {
  /** Size of the loading spinner */
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
  /** Color of the spinner (hex or color name) */
  color?: string;
  /** Display as full-page overlay */
  fullPage?: boolean;
  /** Additional text to display */
  text?: string;
  /** Additional className */
  className?: string;
}

const PullUpText: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <>
    <style>{`
      @keyframes letter-pull-up {
        0%   { opacity: 0; transform: translateY(10px); }
        60%  { opacity: 1; transform: translateY(-2px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    <span className={cn('inline-flex', className)}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: 0,
            animation: 'letter-pull-up 0.5s ease forwards',
            animationDelay: `${i * 0.055}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  </>
);

const sizeMap = {
  xs: { size: 20, textSize: 'text-xs' },
  sm: { size: 24, textSize: 'text-sm' },
  default: { size: 32, textSize: 'text-sm' },
  lg: { size: 40, textSize: 'text-base' },
  xl: { size: 48, textSize: 'text-lg' },
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'default',
  color = '#059669',
  fullPage = false,
  text,
  className,
}) => {
  const sizeConfig = sizeMap[size];

  const loadingContent = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      className
    )}>
      <DashLoading color={color} size={sizeConfig.size} />
      {text && (
        <PullUpText
          text={text}
          className={cn('text-slate-600 font-medium', sizeConfig.textSize)}
        />
      )}
    </div>
  );

  if (fullPage) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
        {loadingContent}
      </div>,
      document.body
    );
  }

  return loadingContent;
};

/**
 * Inline Loading - For small inline contexts (buttons, dropdowns)
 */
export const InlineLoading: React.FC<Omit<LoadingProps, 'fullPage' | 'text'>> = (props) => (
  <Loading {...props} size={props.size || 'xs'} />
);

/**
 * Full Page Loading - For route transitions and page loading
 */
export const FullPageLoading: React.FC<Omit<LoadingProps, 'fullPage'>> = (props) => (
  <Loading {...props} fullPage text={props.text || 'Loading...'} />
);

/**
 * Button Loading - Specifically for button loading states
 */
export const ButtonLoading: React.FC<{ text?: string; light?: boolean }> = ({
  text = 'Loading...',
  light = false
}) => (
  <div className="flex items-center justify-center gap-2">
    <DashLoading color={light ? '#ffffff' : '#059669'} size={32} />
    <span>{text}</span>
  </div>
);

/**
 * Card/Section Loading - For loading states in cards or sections
 */
export const SectionLoading: React.FC<{
  text?: string;
  minHeight?: string;
  className?: string;
}> = ({
  text = 'Loading...',
  minHeight = '200px',
  className
}) => (
    <div
      className={cn("flex flex-col items-center justify-center w-full", className)}
      style={{ minHeight }}
    >
      <Loading text={text} size="default" />
    </div>
  );
