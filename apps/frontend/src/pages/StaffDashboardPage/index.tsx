import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Card, Spinner } from '@/components/ui';
import { AlertTriangle, Utensils, BookOpen, Clock } from 'lucide-react';
import { useStoplistToday } from '@/hooks/useStoplist';
import { useDishesOfDayToday } from '@/hooks/useDishesOfDay';
import { useStaffRules } from '@/hooks/useStaffRules';

export const StaffDashboardPage = () => {
  const { data: stoplist, isLoading: stoplistLoading } = useStoplistToday();
  const { data: dishes, isLoading: dishesLoading } = useDishesOfDayToday();
  const { data: rules, isLoading: rulesLoading } = useStaffRules();

  const isLoading = stoplistLoading || dishesLoading || rulesLoading;

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (isLoading) {
    return (
      <Container>
        <LoadingWrapper>
          <Spinner />
        </LoadingWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderTop>
          <Title>Информация для сотрудников</Title>
          <DateBadge>
            <Clock size={16} />
            {today}
          </DateBadge>
        </HeaderTop>
      </Header>

      <Grid>
        {/* Стоп-лист */}
        <StoplistCard>
          <CardHeader>
            <CardIcon $color={theme.colors.error[500]}>
              <AlertTriangle size={24} />
            </CardIcon>
            <CardTitle>Стоп-лист</CardTitle>
            {stoplist && stoplist.length > 0 && (
              <CountBadge $variant="error">{stoplist.length}</CountBadge>
            )}
          </CardHeader>
          <CardContent>
            {stoplist && stoplist.length > 0 ? (
              <StoplistItems>
                {stoplist.map((item) => (
                  <StoplistItem key={item.id}>
                    <StoplistName>{item.name}</StoplistName>
                    {item.reason && <StoplistReason>{item.reason}</StoplistReason>}
                    {item.category && <StoplistCategory>{item.category}</StoplistCategory>}
                  </StoplistItem>
                ))}
              </StoplistItems>
            ) : (
              <EmptyState>
                <EmptyIcon>✓</EmptyIcon>
                <EmptyText>Все позиции доступны</EmptyText>
              </EmptyState>
            )}
          </CardContent>
        </StoplistCard>

        {/* Блюда дня */}
        <DishesCard>
          <CardHeader>
            <CardIcon $color={theme.colors.success[500]}>
              <Utensils size={24} />
            </CardIcon>
            <CardTitle>Блюда дня</CardTitle>
            {dishes && dishes.length > 0 && (
              <CountBadge $variant="success">{dishes.length}</CountBadge>
            )}
          </CardHeader>
          <CardContent>
            {dishes && dishes.length > 0 ? (
              <DishesList>
                {dishes.map((dish) => (
                  <DishItem key={dish.id}>
                    <DishName>{dish.name}</DishName>
                    {dish.description && <DishDescription>{dish.description}</DishDescription>}
                    {dish.price && <DishPrice>{dish.price} ₽</DishPrice>}
                    {dish.category && <DishCategory>{dish.category}</DishCategory>}
                  </DishItem>
                ))}
              </DishesList>
            ) : (
              <EmptyState>
                <EmptyText>Нет блюд дня</EmptyText>
              </EmptyState>
            )}
          </CardContent>
        </DishesCard>

        {/* Правила */}
        <RulesCard>
          <CardHeader>
            <CardIcon $color={theme.colors.primary[500]}>
              <BookOpen size={24} />
            </CardIcon>
            <CardTitle>Правила и напоминания</CardTitle>
          </CardHeader>
          <CardContent>
            {rules && rules.length > 0 ? (
              <RulesList>
                {rules.map((rule) => (
                  <RuleItem key={rule.id} $priority={rule.priority}>
                    <RuleHeader>
                      <RuleTitle>{rule.title}</RuleTitle>
                      {rule.priority > 0 && (
                        <PriorityBadge $priority={rule.priority}>
                          Важно
                        </PriorityBadge>
                      )}
                    </RuleHeader>
                    <RuleContent>{rule.content}</RuleContent>
                    {rule.category && <RuleCategory>{rule.category}</RuleCategory>}
                  </RuleItem>
                ))}
              </RulesList>
            ) : (
              <EmptyState>
                <EmptyText>Нет правил</EmptyText>
              </EmptyState>
            )}
          </CardContent>
        </RulesCard>
      </Grid>
    </Container>
  );
};

// ===== STYLED COMPONENTS =====
const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.gray[50]};
  padding: ${theme.spacing[6]};
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing[4]};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const DateBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  background: white;
  border-radius: ${theme.borderRadius.full};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  box-shadow: ${theme.shadows.sm};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${theme.spacing[6]};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BaseCard = styled(Card)`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.md};
`;

const StoplistCard = styled(BaseCard)`
  border-top: 4px solid ${theme.colors.error[500]};
`;

const DishesCard = styled(BaseCard)`
  border-top: 4px solid ${theme.colors.success[500]};
`;

const RulesCard = styled(BaseCard)`
  border-top: 4px solid ${theme.colors.primary[500]};
  grid-column: 1 / -1;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  background: ${theme.colors.gray[50]};
  border-bottom: 1px solid ${theme.colors.border};
`;

const CardIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
  border-radius: ${theme.borderRadius.lg};
`;

const CardTitle = styled.h2`
  flex: 1;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const CountBadge = styled.span<{ $variant: 'error' | 'success' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  background: ${({ $variant }) =>
    $variant === 'error' ? theme.colors.error[500] : theme.colors.success[500]};
  color: white;
`;

const CardContent = styled.div`
  padding: ${theme.spacing[5]};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[8]};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing[2]};
`;

const EmptyText = styled.p`
  color: ${theme.colors.text.secondary};
`;

// Стоп-лист стили
const StoplistItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const StoplistItem = styled.div`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: ${theme.colors.error[50]};
  border-left: 3px solid ${theme.colors.error[500]};
  border-radius: ${theme.borderRadius.md};
`;

const StoplistName = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.error[700]};
`;

const StoplistReason = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error[600]};
  margin-top: ${theme.spacing[1]};
`;

const StoplistCategory = styled.span`
  display: inline-block;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.error[600]};
  background: ${theme.colors.error[100]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  margin-top: ${theme.spacing[2]};
`;

// Блюда дня стили
const DishesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const DishItem = styled.div`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: ${theme.colors.success[50]};
  border-left: 3px solid ${theme.colors.success[500]};
  border-radius: ${theme.borderRadius.md};
`;

const DishName = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.success[700]};
`;

const DishDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.success[600]};
  margin-top: ${theme.spacing[1]};
`;

const DishPrice = styled.div`
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.success[700]};
  font-size: ${theme.typography.fontSize.lg};
  margin-top: ${theme.spacing[2]};
`;

const DishCategory = styled.span`
  display: inline-block;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.success[600]};
  background: ${theme.colors.success[100]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  margin-top: ${theme.spacing[2]};
`;

// Правила стили
const RulesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[4]};
`;

const RuleItem = styled.div<{ $priority: number }>`
  padding: ${theme.spacing[4]};
  background: ${({ $priority }) =>
    $priority > 0 ? theme.colors.warning[50] : theme.colors.gray[50]};
  border-left: 3px solid ${({ $priority }) =>
    $priority > 0 ? theme.colors.warning[500] : theme.colors.primary[500]};
  border-radius: ${theme.borderRadius.md};
`;

const RuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing[2]};
`;

const RuleTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const RuleContent = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing[2]};
  white-space: pre-wrap;
`;

const RuleCategory = styled.span`
  display: inline-block;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.primary[600]};
  background: ${theme.colors.primary[50]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  margin-top: ${theme.spacing[3]};
`;

const PriorityBadge = styled.span<{ $priority: number }>`
  flex-shrink: 0;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.warning[700]};
  background: ${theme.colors.warning[100]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
`;

export default StaffDashboardPage;
