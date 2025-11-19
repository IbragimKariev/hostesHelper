import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, fullWidth, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <Container $fullWidth={fullWidth}>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <InputWrapper $hasError={!!error}>
          {leftIcon && <IconWrapper $position="left" aria-hidden="true">{leftIcon}</IconWrapper>}
          <StyledInput
            ref={ref}
            id={inputId}
            $hasLeftIcon={!!leftIcon}
            $hasRightIcon={!!rightIcon}
            $hasError={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
          {rightIcon && <IconWrapper $position="right" aria-hidden="true">{rightIcon}</IconWrapper>}
        </InputWrapper>
        {error && <ErrorText id={errorId} role="alert">{error}</ErrorText>}
        {!error && helperText && <HelperText id={helperId}>{helperText}</HelperText>}
      </Container>
    );
  }
);

Input.displayName = 'Input';

const Container = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
  ${(props) => props.$fullWidth && 'width: 100%;'}
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const InputWrapper = styled.div<{ $hasError: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{
  $hasLeftIcon: boolean;
  $hasRightIcon: boolean;
  $hasError: boolean;
}>`
  width: 100%;
  height: 40px;
  padding: 0 ${theme.spacing[3]};
  padding-left: ${(props) => (props.$hasLeftIcon ? theme.spacing[10] : theme.spacing[3])};
  padding-right: ${(props) => (props.$hasRightIcon ? theme.spacing[10] : theme.spacing[3])};
  font-family: ${theme.typography.fontFamily.sans};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  background: white;
  border: 1px solid ${(props) => (props.$hasError ? theme.colors.error[500] : theme.colors.border)};
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.fast};

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }

  &:hover:not(:disabled) {
    border-color: ${(props) => (props.$hasError ? theme.colors.error[600] : theme.colors.gray[400])};
  }

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? theme.colors.error[500] : theme.colors.primary[500])};
    box-shadow: 0 0 0 3px
      ${(props) => (props.$hasError ? theme.colors.error[100] : theme.colors.primary[100])};
  }

  &:disabled {
    background: ${theme.colors.gray[50]};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  ${(props) => props.$position}: ${theme.spacing[3]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.secondary};
  pointer-events: none;
`;

const ErrorText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error[600]};
`;

const HelperText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;
