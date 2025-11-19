import styled, { keyframes } from 'styled-components';
import { theme } from '@/styles/theme';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner = ({ size = 'md', color = theme.colors.primary[600] }: SpinnerProps) => {
  return <StyledSpinner $size={size} $color={color} />;
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const sizeMap = {
  sm: '16px',
  md: '24px',
  lg: '40px',
};

const StyledSpinner = styled.div<{ $size: 'sm' | 'md' | 'lg'; $color: string }>`
  width: ${(props) => sizeMap[props.$size]};
  height: ${(props) => sizeMap[props.$size]};
  border: 2px solid ${(props) => props.$color}20;
  border-top-color: ${(props) => props.$color};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const PageSpinner = () => {
  return (
    <PageSpinnerContainer>
      <Spinner size="lg" />
    </PageSpinnerContainer>
  );
};

const PageSpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
`;
