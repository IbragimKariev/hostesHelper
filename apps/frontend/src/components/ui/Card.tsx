import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  padding?: keyof typeof theme.spacing;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Card = ({ children, padding = '6', hoverable = false, onClick, className }: CardProps) => {
  return (
    <StyledCard $padding={padding} $hoverable={hoverable} onClick={onClick} className={className}>
      {children}
    </StyledCard>
  );
};

const StyledCard = styled.div<{ $padding: keyof typeof theme.spacing; $hoverable: boolean }>`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  padding: ${(props) => theme.spacing[props.$padding]};
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.transitions.base};

  ${(props) =>
    props.$hoverable &&
    `
    cursor: pointer;

    &:hover {
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
      border-color: ${theme.colors.primary[300]};
    }
  `}

  ${(props) =>
    props.onClick &&
    !props.$hoverable &&
    `
    cursor: pointer;
  `}
`;

// Card subcomponents
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({ title, subtitle, action }: CardHeaderProps) => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </HeaderContent>
      {action && <ActionContainer>{action}</ActionContainer>}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[4]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.divider};
`;
