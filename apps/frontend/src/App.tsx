import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { GlobalStyles } from '@/styles/GlobalStyles';
import { LayoutGrid, Calendar, Users, LogOut } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';

// Pages
import { AdminPage } from '@/pages/AdminPage';
import { BookingPage } from '@/pages/BookingPage';
import { LoginPage } from '@/pages/LoginPage';
import { UsersPage } from '@/pages/UsersPage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const logout = useLogout();

  const isLoginPage = location.pathname === '/login';
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role?.name === 'admin';

  // Если не авторизован и не на странице логина, перенаправляем на логин
  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  // Если авторизован и на странице логина, перенаправляем на главную
  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/booking" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <AppContainer>
        {!isLoginPage && (
          <Navigation>
            <NavLeft>
              <NavBrand>
                <BrandIcon>🍽️</BrandIcon>
                <BrandText>Hostes</BrandText>
              </NavBrand>

              <NavLinks>
                <NavLink to="/booking" $active={location.pathname === '/booking'}>
                  <Calendar size={20} />
                  <span>Бронирование</span>
                </NavLink>
                {isAdmin && (
                  <>
                    <NavLink to="/admin" $active={location.pathname === '/admin'}>
                      <LayoutGrid size={20} />
                      <span>Дизайн залов</span>
                    </NavLink>
                    <NavLink to="/users" $active={location.pathname === '/users'}>
                      <Users size={20} />
                      <span>Пользователи</span>
                    </NavLink>
                  </>
                )}
              </NavLinks>
            </NavLeft>

            <NavRight>
              <UserInfo>
                <UserName>{currentUser?.name}</UserName>
                <UserRole>
                  {currentUser?.role?.name === 'admin' ? 'Администратор' : 'Хостес'}
                </UserRole>
              </UserInfo>
              <LogoutButton onClick={handleLogout} title="Выйти">
                <LogOut size={20} />
              </LogoutButton>
            </NavRight>
          </Navigation>
        )}

        <Main $isLoginPage={isLoginPage}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/booking" replace />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/booking" element={<BookingPage />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/booking" replace />} />
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
  background: ${theme.colors.background};
`;

const Navigation = styled.nav`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${theme.colors.border};
  padding: 0 ${theme.spacing[6]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};

  @media (max-width: 768px) {
    padding: 0 ${theme.spacing[4]};
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[8]};

  @media (max-width: 768px) {
    gap: ${theme.spacing[4]};
  }
`;

const NavBrand = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const BrandIcon = styled.div`
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const BrandText = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${theme.spacing[1]};

  @media (max-width: 640px) {
    gap: 0;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  text-decoration: none;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${(props) => (props.$active ? theme.colors.primary[700] : theme.colors.text.secondary)};
  background: ${(props) => (props.$active ? theme.colors.primary[50] : 'transparent')};
  transition: all ${theme.transitions.fast};
  position: relative;

  ${(props) => props.$active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 2px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 1px;
    }
  `}

  &:hover {
    background: ${(props) => (props.$active ? theme.colors.primary[100] : theme.colors.gray[50])};
    color: ${(props) => (props.$active ? theme.colors.primary[800] : theme.colors.text.primary)};
  }

  svg {
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};

    span {
      display: none;
    }
  }
`;

const Main = styled.main<{ $isLoginPage: boolean }>`
  flex: 1;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: ${(props) => (props.$isLoginPage ? '0' : theme.spacing[6])};
  animation: fadeIn 0.3s ease-out;

  @media (max-width: 768px) {
    padding: ${(props) => (props.$isLoginPage ? '0' : theme.spacing[4])};
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};

  @media (max-width: 640px) {
    display: none;
  }
`;

const UserName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const UserRole = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.error[50]};
    color: ${theme.colors.error[600]};
  }

  &:active {
    transform: scale(0.95);
  }
`;
