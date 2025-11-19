import { SelectHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, fullWidth, children, id, className, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const containerClasses = [
      styles.container,
      fullWidth && styles.fullWidth,
    ].filter(Boolean).join(' ');

    const selectClasses = [
      styles.select,
      error && styles.hasError,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          >
            {children}
          </select>
          <div className={styles.iconWrapper} aria-hidden="true">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <span id={errorId} className={styles.errorText} role="alert">{error}</span>}
        {!error && helperText && <span id={helperId} className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
