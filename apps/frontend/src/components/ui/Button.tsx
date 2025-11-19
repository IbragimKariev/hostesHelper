import styled, { css } from 'styled-components';
import { theme } from '@/styles/theme';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner role="status" aria-label="Загрузка" />}
      {!loading && leftIcon && <IconWrapper aria-hidden="true">{leftIcon}</IconWrapper>}
      <span>{children}</span>
      {!loading && rightIcon && <IconWrapper aria-hidden="true">{rightIcon}</IconWrapper>}
    </StyledButton>
  );
};

const variantStyles = {
  primary: css`
    background: ${theme.colors.primary[600]};
    color: white;
    border: 1px solid ${theme.colors.primary[600]};

    &:hover:not(:disabled) {
      background: ${theme.colors.primary[700]};
      border-color: ${theme.colors.primary[700]};
    }

    &:active:not(:disabled) {
      background: ${theme.colors.primary[800]};
    }
  `,
  secondary: css`
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.gray[900]};
    border: 1px solid ${theme.colors.gray[200]};

    &:hover:not(:disabled) {
      background: ${theme.colors.gray[200]};
      border-color: ${theme.colors.gray[300]};
    }

    &:active:not(:disabled) {
      background: ${theme.colors.gray[300]};
    }
  `,
  outline: css`
    background: transparent;
    color: ${theme.colors.primary[600]};
    border: 1px solid ${theme.colors.primary[600]};

    &:hover:not(:disabled) {
      background: ${theme.colors.primary[50]};
    }

    &:active:not(:disabled) {
      background: ${theme.colors.primary[100]};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${theme.colors.gray[700]};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: ${theme.colors.gray[100]};
    }

    &:active:not(:disabled) {
      background: ${theme.colors.gray[200]};
    }
  `,
  danger: css`
    background: ${theme.colors.error[600]};
    color: white;
    border: 1px solid ${theme.colors.error[600]};

    &:hover:not(:disabled) {
      background: ${theme.colors.error[700]};
      border-color: ${theme.colors.error[700]};
    }

    &:active:not(:disabled) {
      background: ${theme.colors.error[800]};
    }
  `,
};

const sizeStyles = {
  sm: css`
    height: 32px;
    padding: 0 ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.sm};
    gap: ${theme.spacing[2]};
  `,
  md: css`
    height: 40px;
    padding: 0 ${theme.spacing[4]};
    font-size: ${theme.typography.fontSize.base};
    gap: ${theme.spacing[2]};
  `,
  lg: css`
    height: 48px;
    padding: 0 ${theme.spacing[6]};
    font-size: ${theme.typography.fontSize.lg};
    gap: ${theme.spacing[3]};
  `,
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.typography.fontFamily.sans};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  white-space: nowrap;
  user-select: none;

  ${(props) => variantStyles[props.$variant]}
  ${(props) => sizeStyles[props.$size]}
  ${(props) => props.$fullWidth && 'width: 100%;'}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
