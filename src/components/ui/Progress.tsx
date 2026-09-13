import { ReactNode } from 'react';
import './Progress.css';

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'circular' | 'ring';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  thickness?: number;
  showLabel?: boolean;
  label?: ReactNode;
  color?: 'brand' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
  'aria-label'?: string;
}

export function Progress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  thickness,
  showLabel = false,
  label,
  color = 'brand',
  className = '',
  'aria-label': ariaLabel,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label ?? (showLabel ? `${Math.round(percentage)}%` : null);

  const classNames = [
    'progress',
    `progress--${variant}`,
    `progress--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const colorVar = `--color-${color}`;

  if (variant === 'circular' || variant === 'ring') {
    const strokeWidth = thickness || (size === 'sm' ? 4 : size === 'md' ? 6 : size === 'lg' ? 8 : 10);
    const radius = size === 'sm' ? 20 : size === 'md' ? 32 : size === 'lg' ? 44 : 56;
    const circumference = 2 * Math.PI * (radius - strokeWidth);
    const strokeDashoffset = circumference * (1 - percentage / 100);

    return (
      <div
        className={classNames}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        style={{
          '--progress-radius': `${radius}px`,
          '--progress-stroke': `${strokeWidth}px`,
          '--progress-circumference': `${circumference}px`,
          '--progress-offset': `${strokeDashoffset}px`,
          '--progress-color': `var(${colorVar})`,
        } as React.CSSProperties}
      >
        <svg className="progress__svg" viewBox="0 0 100 100">
          <circle
            className="progress__track"
            cx="50"
            cy="50"
            r={radius - strokeWidth}
            strokeWidth={strokeWidth}
          />
          <circle
            className="progress__indicator"
            cx="50"
            cy="50"
            r={radius - strokeWidth}
            strokeWidth={strokeWidth}
            strokeDasharray="var(--progress-circumference)"
            strokeDashoffset="var(--progress-offset)"
            style={{ stroke: 'var(--progress-color)' }}
          />
        </svg>
        {displayLabel && (
          <div className="progress__label" aria-hidden="true">
            {displayLabel}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={classNames}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div className="progress__track">
        <div
          className="progress__indicator"
          style={{
            '--progress-scale': percentage / 100,
            backgroundColor: `var(${colorVar})`,
          } as React.CSSProperties}
        />
      </div>
      {displayLabel && (
        <div className="progress__label" aria-hidden="true">
          {displayLabel}
        </div>
      )}
    </div>
  );
}

export interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  variant?: 'default' | 'compact';
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  variant = 'default',
  className = '',
}: StepProgressProps) {
  const classNames = [
    'step-progress',
    `step-progress--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} role="navigation" aria-label="Progress steps">
      <div className="step-progress__track">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step <= currentStep;
          const isCurrent = step === currentStep;
          return (
            <div
              key={step}
              className={`step-progress__step ${isActive ? 'step-progress__step--active' : ''} ${isCurrent ? 'step-progress__step--current' : ''}`}
            >
              <div
                className="step-progress__indicator"
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isActive ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {labels && labels[i] && (
                <span className="step-progress__label">{labels[i]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}