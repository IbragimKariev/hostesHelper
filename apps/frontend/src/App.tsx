import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { GlobalStyles } from '@/styles/GlobalStyles';
import { LayoutGrid, Calendar, Users, LogOut, Utensils, Briefcase, Menu, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

// Pages
import { AdminPage } from '@/pages/AdminPage';
import { BookingPage } from '@/pages/BookingPage';
import { LoginPage } from '@/pages/LoginPage';
import { UsersPage } from '@/pages/UsersPage';
import MenuManagementPage from '@/pages/MenuManagementPage';
import StaffDashboardPage from '@/pages/StaffDashboardPage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoginPage = location.pathname === '/login';
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role?.name === 'admin';

  // Управление классом body для предотвращения скролла
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMobileMenuOpen]);

  // Закрываем меню при изменении маршрута
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Закрываем меню при изменении размера окна на desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
                <NavLink to="/staff" $active={location.pathname === '/staff'}>
                  <Briefcase size={20} />
                  <span>Для официантов</span>
                </NavLink>
                {isAdmin && (
                  <>
                    <NavLink to="/admin" $active={location.pathname === '/admin'}>
                      <LayoutGrid size={20} />
                      <span>Дизайн залов</span>
                    </NavLink>
                    <NavLink to="/menu" $active={location.pathname === '/menu'}>
                      <Utensils size={20} />
                      <span>Управление меню</span>
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

            <MobileMenuButton onClick={toggleMobileMenu} aria-label="Меню">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </MobileMenuButton>

            <MobileMenu $isOpen={isMobileMenuOpen}>
              <MobileMenuContent>
                <MobileUserInfo>
                  <MobileUserName>{currentUser?.name}</MobileUserName>
                  <MobileUserRole>
                    {currentUser?.role?.name === 'admin' ? 'Администратор' : 'Хостес'}
                  </MobileUserRole>
                </MobileUserInfo>

                <MobileNavLinks>
                  <MobileNavLink to="/booking" $active={location.pathname === '/booking'}>
                    <Calendar size={20} />
                    <span>Бронирование</span>
                  </MobileNavLink>
                  <MobileNavLink to="/staff" $active={location.pathname === '/staff'}>
                    <Briefcase size={20} />
                    <span>Для официантов</span>
                  </MobileNavLink>
                  {isAdmin && (
                    <>
                      <MobileNavLink to="/admin" $active={location.pathname === '/admin'}>
                        <LayoutGrid size={20} />
                        <span>Дизайн залов</span>
                      </MobileNavLink>
                      <MobileNavLink to="/menu" $active={location.pathname === '/menu'}>
                        <Utensils size={20} />
                        <span>Управление меню</span>
                      </MobileNavLink>
                      <MobileNavLink to="/users" $active={location.pathname === '/users'}>
                        <Users size={20} />
                        <span>Пользователи</span>
                      </MobileNavLink>
                    </>
                  )}
                </MobileNavLinks>

                <MobileLogoutButton onClick={handleLogout}>
                  <LogOut size={20} />
                  <span>Выйти</span>
                </MobileLogoutButton>
              </MobileMenuContent>
            </MobileMenu>

            {isMobileMenuOpen && <MobileMenuOverlay onClick={toggleMobileMenu} />}
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
            <Route path="/staff" element={<StaffDashboardPage />} />
            <Route
              path="/menu"
              element={
                <ProtectedRoute adminOnly>
                  <MenuManagementPage />
                </ProtectedRoute>
              }
            />
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
  background: ${theme.colors.surface};
`;

const Navigation = styled.nav`
  background: white;
  border-bottom: 1px solid ${theme.colors.border};
  padding: 0 ${theme.spacing[6]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};

  @media (max-width: 768px) {
    padding: 0 ${theme.spacing[4]};
    height: 56px;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[8]};

  @media (max-width: 768px) {
    gap: 0;
  }
`;

const NavBrand = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};

  @media (max-width: 768px) {
    gap: ${theme.spacing[2]};
  }
`;

const BrandIcon = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const BrandText = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.secondary[600]});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};

  @media (max-width: 768px) {
    display: none;
  }
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

const Main = styled.main<{ $isLoginPage: boolean }>`
  flex: 1;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: ${(props) => (props.$isLoginPage ? '0' : theme.spacing[6])};

  @media (max-width: 768px) {
    padding: ${(props) => (props.$isLoginPage ? '0' : theme.spacing[4])};
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
  border: 1px solid ${theme.colors.gray[300]};
  background: white;
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.error[50]};
    border-color: ${theme.colors.error[300]};
    color: ${theme.colors.error[600]};
  }
`;

// Mobile Styles
const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.gray[100]};
    border-radius: ${theme.borderRadius.lg};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenuOverlay = styled.div`
  display: none;
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${theme.zIndex.modal - 1};

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 56px;
  right: 0;
  width: 280px;
  max-width: 80vw;
  height: calc(100vh - 56px);
  background: white;
  box-shadow: ${theme.shadows.xl};
  transform: translateX(${(props) => (props.$isOpen ? '0' : '100%')});
  transition: transform ${theme.transitions.base};
  z-index: ${theme.zIndex.modal};
  overflow-y: auto;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing[4]};
  gap: ${theme.spacing[4]};
`;

const MobileUserInfo = styled.div`
  padding: ${theme.spacing[4]};
  background: ${theme.colors.primary[50]};
  border-radius: ${theme.borderRadius.lg};
  border-left: 4px solid ${theme.colors.primary[500]};
`;

const MobileUserName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const MobileUserRole = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const MobileNavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  text-decoration: none;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${(props) => (props.$active ? theme.colors.primary[600] : theme.colors.text.secondary)};
  background: ${(props) => (props.$active ? theme.colors.primary[50] : 'transparent')};
  transition: all ${theme.transitions.fast};

  &:active {
    background: ${(props) => (props.$active ? theme.colors.primary[100] : theme.colors.gray[100])};
    color: ${(props) => (props.$active ? theme.colors.primary[700] : theme.colors.text.primary)};
  }

  svg {
    flex-shrink: 0;
  }
`;

const MobileLogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.error[300]};
  background: white;
  color: ${theme.colors.error[600]};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all ${theme.transitions.fast};
  margin-top: auto;

  &:active {
    background: ${theme.colors.error[50]};
  }

  svg {
    flex-shrink: 0;
  }
`;
