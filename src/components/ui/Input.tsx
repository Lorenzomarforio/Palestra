import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const describedBy = [errorId, hintId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

    const classNames = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full-width',
      error && 'input-wrapper--error',
      props.disabled && 'input-wrapper--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classNames}>
        {label && (
          <label htmlFor={inputId} className="input__label">
            {label}
            {props.required && <span className="input__required" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="input__field-wrapper">
          {leftIcon && (
            <span className="input__icon input__icon--left" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className="input__field"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-disabled={props.disabled}
            {...props}
          />
          {rightIcon && (
            <span className="input__icon input__icon--right" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="input__error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="input__hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = false,
      className = '',
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const describedBy = [errorId, hintId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

    const classNames = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full-width',
      error && 'input-wrapper--error',
      props.disabled && 'input-wrapper--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classNames}>
        {label && (
          <label htmlFor={textareaId} className="input__label">
            {label}
            {props.required && <span className="input__required" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className="input__field input__field--textarea"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-disabled={props.disabled}
          {...props}
        />
        {error && (
          <p id={errorId} className="input__error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="input__hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      placeholder,
      options,
      fullWidth = false,
      className = '',
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const describedBy = [errorId, hintId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

    const classNames = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full-width',
      error && 'input-wrapper--error',
      props.disabled && 'input-wrapper--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classNames}>
        {label && (
          <label htmlFor={selectId} className="input__label">
            {label}
            {props.required && <span className="input__required" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="input__field-wrapper input__field-wrapper--select">
          <select
            ref={ref}
            id={selectId}
            className="input__field input__field--select"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-disabled={props.disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="input__select-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
        {error && (
          <p id={errorId} className="input__error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="input__hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';