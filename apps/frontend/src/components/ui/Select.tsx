import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { SelectHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, fullWidth, children, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <Container $fullWidth={fullWidth}>
        {label && <Label htmlFor={selectId}>{label}</Label>}
        <SelectWrapper>
          <StyledSelect
            ref={ref}
            id={selectId}
            $hasError={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          >
            {children}
          </StyledSelect>
          <IconWrapper aria-hidden="true">
            <ChevronDown size={16} />
          </IconWrapper>
        </SelectWrapper>
        {error && <ErrorText id={errorId} role="alert">{error}</ErrorText>}
        {!error && helperText && <HelperText id={helperId}>{helperText}</HelperText>}
      </Container>
    );
  }
);

Select.displayName = 'Select';

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

const SelectWrapper = styled.div`
  position: relative;
`;

const StyledSelect = styled.select<{ $hasError: boolean }>`
  width: 100%;
  height: 40px;
  padding: 0 ${theme.spacing[3]};
  padding-right: ${theme.spacing[10]};
  font-family: ${theme.typography.fontFamily.sans};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  background: white;
  border: 1px solid ${(props) => (props.$hasError ? theme.colors.error[500] : theme.colors.border)};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  appearance: none;
  transition: all ${theme.transitions.fast};

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

const IconWrapper = styled.div`
  position: absolute;
  right: ${theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
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
