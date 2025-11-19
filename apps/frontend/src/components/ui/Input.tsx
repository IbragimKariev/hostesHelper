import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, fullWidth, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const containerClasses = [
      styles.container,
      fullWidth && styles.fullWidth,
    ].filter(Boolean).join(' ');

    const inputClasses = [
      styles.input,
      leftIcon && styles.hasLeftIcon,
      rightIcon && styles.hasRightIcon,
      error && styles.hasError,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <div className={styles.inputWrapper}>
          {leftIcon && (
            <span className={`${styles.iconWrapper} ${styles.iconLeft}`} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
          {rightIcon && (
            <span className={`${styles.iconWrapper} ${styles.iconRight}`} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span id={errorId} className={styles.errorText} role="alert">{error}</span>}
        {!error && helperText && <span id={helperId} className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
