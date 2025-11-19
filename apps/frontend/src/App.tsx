import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { GlobalStyles } from '@/styles/GlobalStyles';
import { LayoutGrid, Calendar } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Pages - будут созданы далее
import { AdminPage } from '@/pages/AdminPage';
import { BookingPage } from '@/pages/BookingPage';

const App = () => {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <AppContainer>
        <Navigation>
          <NavBrand>
            <BrandIcon>🍽️</BrandIcon>
            <BrandText>Hostes</BrandText>
          </NavBrand>

          <NavLinks>
            <NavLink to="/admin" $active={location.pathname === '/admin'}>
              <LayoutGrid size={20} />
              <span>Дизайн залов</span>
            </NavLink>
            <NavLink to="/booking" $active={location.pathname === '/booking'}>
              <Calendar size={20} />
              <span>Бронирование</span>
            </NavLink>
          </NavLinks>
        </Navigation>

        <Main>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Main>
      </AppContainer>
    </ErrorBoundary>
  );
};

export default App;

// Styled Components
const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${theme.colors.surface};
`;

const Navigation = styled.nav`
  background: white;
  border-bottom: 1px solid ${theme.colors.border};
  padding: 0 ${theme.spacing[6]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[12]};
  height: 64px;
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
`;

const NavBrand = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const BrandIcon = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
`;

const BrandText = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.secondary[600]});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  text-decoration: none;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${(props) => (props.$active ? theme.colors.primary[600] : theme.colors.text.secondary)};
  background: ${(props) => (props.$active ? theme.colors.primary[50] : 'transparent')};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${(props) => (props.$active ? theme.colors.primary[100] : theme.colors.gray[100])};
    color: ${(props) => (props.$active ? theme.colors.primary[700] : theme.colors.text.primary)};
  }

  svg {
    flex-shrink: 0;
  }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};
`;
