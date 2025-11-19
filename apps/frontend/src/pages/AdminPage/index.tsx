import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Card, CardHeader, Button, PageSpinner } from '@/components/ui';
import { useHalls, useCreateHall, useDeleteHall, useUpdateHall } from '@/hooks/useHalls';
import { Plus, Trash2, Edit, Grid3x3 } from 'lucide-react';
import { Toolbar, type ToolMode, type TableShape } from './components/Toolbar';
import { HallCanvas } from './components/HallCanvas';
import { CreateHallModal } from './components/CreateHallModal';
import { EditHallModal } from './components/EditHallModal';
import type { CreateHallDto, UpdateHallDto } from '@hostes/shared';

export const AdminPage = () => {
  const { data: halls, isLoading } = useHalls();
  const createHall = useCreateHall();
  const deleteHall = useDeleteHall();
  const updateHall = useUpdateHall();

  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [selectedShape, setSelectedShape] = useState<TableShape>('rectangle');
  const [selectedSeats, setSelectedSeats] = useState(4);
  const [isCreateHallModalOpen, setIsCreateHallModalOpen] = useState(false);
  const [isEditHallModalOpen, setIsEditHallModalOpen] = useState(false);

  // Найти выбранный зал из актуального списка halls
  const selectedHall = halls?.find((h) => h.id === selectedHallId) || null;

  const handleCreateHall = (data: CreateHallDto) => {
    createHall.mutate(data, {
      onSuccess: () => {
        setIsCreateHallModalOpen(false);
      },
    });
  };

  const handleDeleteHall = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот зал?')) {
      deleteHall.mutate(id);
      if (selectedHallId === id) {
        setSelectedHallId(null);
      }
    }
  };

  const handleUpdateHall = (data: UpdateHallDto) => {
    if (selectedHallId) {
      updateHall.mutate(
        { id: selectedHallId, data },
        {
          onSuccess: () => {
            setIsEditHallModalOpen(false);
          },
        }
      );
    }
  };

  // Auto-select first hall
  useEffect(() => {
    if (halls && halls.length > 0 && !selectedHallId) {
      setSelectedHallId(halls[0].id);
    }
  }, [halls, selectedHallId]);

  if (isLoading) {
    return <PageSpinner />;
  }
  
  return (
    <Container>
      <CreateHallModal
        isOpen={isCreateHallModalOpen}
        onClose={() => setIsCreateHallModalOpen(false)}
        onCreate={handleCreateHall}
        isLoading={createHall.isPending}
      />

      <EditHallModal
        isOpen={isEditHallModalOpen}
        onClose={() => setIsEditHallModalOpen(false)}
        onUpdate={handleUpdateHall}
        hall={selectedHall}
        isLoading={updateHall.isPending}
      />

      <Header>
        <HeaderContent>
          <Title>Дизайн залов</Title>
          <Subtitle>Создавайте и редактируйте планировку залов ресторана</Subtitle>
        </HeaderContent>
        <Button
          leftIcon={<Plus size={20} />}
          onClick={() => setIsCreateHallModalOpen(true)}
        >
          Создать зал
        </Button>
      </Header>

      <Content>
        <Sidebar>
          <Card padding={4}>
            <CardHeader title="Залы" subtitle={`Всего: ${halls?.length || 0}`} />
            <HallsList>
              {halls?.map((hall) => (
                <HallCard
                  key={hall.id}
                  $active={selectedHall?.id === hall.id}
                  onClick={() => setSelectedHallId(hall.id)}
                >
                  <HallIcon>
                    <Grid3x3 size={24} />
                  </HallIcon>
                  <HallInfo>
                    <HallName>{hall.name}</HallName>
                    <HallMeta>
                      {hall.width}×{hall.height}м • {hall.tables?.length || 0} столов
                    </HallMeta>
                  </HallInfo>
                  <HallActions onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      title="Редактировать"
                      onClick={() => {
                        setSelectedHallId(hall.id);
                        setIsEditHallModalOpen(true);
                      }}
                    >
                      <Edit size={16} />
                    </IconButton>
                    <IconButton
                      title="Удалить"
                      onClick={() => handleDeleteHall(hall.id)}
                      disabled={deleteHall.isPending}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </HallActions>
                </HallCard>
              ))}
            </HallsList>
          </Card>

          {selectedHall && (
            <Toolbar
              mode={toolMode}
              onModeChange={setToolMode}
              selectedShape={selectedShape}
              onShapeChange={setSelectedShape}
              selectedSeats={selectedSeats}
              onSeatsChange={setSelectedSeats}
            />
          )}
        </Sidebar>

        <MainContent>
          {selectedHall ? (
            <Card padding={6}>
              <CardHeader
                title={selectedHall.name}
                subtitle={`Размер: ${selectedHall.width}×${selectedHall.height} метров`}
                action={
                  <Button
                    variant="outline"
                    leftIcon={<Edit size={20} />}
                    onClick={() => setIsEditHallModalOpen(true)}
                  >
                    Настройки зала
                  </Button>
                }
              />

              <CanvasWrapper>
                <HallCanvas
                  hall={selectedHall}
                  mode={toolMode}
                  newTableConfig={{
                    shape: selectedShape,
                    seats: selectedSeats,
                  }}
                />
              </CanvasWrapper>

              <Stats>
                <StatCard>
                  <StatLabel>Столиков</StatLabel>
                  <StatValue>{selectedHall.tables?.length || 0}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Секций</StatLabel>
                  <StatValue>{selectedHall.sections?.length || 0}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Всего мест</StatLabel>
                  <StatValue>
                    {selectedHall.tables?.reduce((sum, t) => sum + t.seats, 0) || 0}
                  </StatValue>
                </StatCard>
              </Stats>
            </Card>
          ) : (
            <EmptyState>
              <EmptyIcon>🏛️</EmptyIcon>
              <EmptyTitle>Выберите зал</EmptyTitle>
              <EmptyText>Выберите зал из списка слева или создайте новый</EmptyText>
            </EmptyState>
          )}
        </MainContent>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
  height: calc(100vh - 64px - ${theme.spacing[6]} * 2);

  @media (max-width: ${theme.breakpoints.lg}) {
    height: auto;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.base};
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${theme.spacing[6]};
  flex: 1;
  min-height: 0;

  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[4]};
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
  overflow: scroll;

  @media (max-width: ${theme.breakpoints.lg}) {
    overflow: visible;
  }
`;

const HallsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
  overflow-y: auto;
  max-height: 400px;

  @media (max-width: ${theme.breakpoints.lg}) {
    max-height: none;
    overflow-y: visible;
  }
`;

const HallCard = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) => (props.$active ? theme.colors.primary[50] : 'transparent')};
  border: 1px solid ${(props) => (props.$active ? theme.colors.primary[200] : 'transparent')};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${(props) => (props.$active ? theme.colors.primary[100] : theme.colors.gray[50])};
  }

  @media (max-width: ${theme.breakpoints.lg}) {
    padding: ${theme.spacing[4]};
  }
`;

const HallIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary[100]};
  color: ${theme.colors.primary[600]};
  border-radius: ${theme.borderRadius.lg};
  flex-shrink: 0;
`;

const HallInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const HallName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const HallMeta = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const HallActions = styled.div`
  display: flex;
  gap: ${theme.spacing[1]};
  opacity: 0;
  transition: opacity ${theme.transitions.fast};

  ${HallCard}:hover & {
    opacity: 1;
  }

  @media (max-width: ${theme.breakpoints.lg}) {
    opacity: 1;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: ${theme.breakpoints.lg}) {
    overflow: visible;
  }
`;

const CanvasWrapper = styled.div`
  margin: ${theme.spacing[6]} 0;
  overflow-x: auto;
  padding: ${theme.spacing[4]};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    margin: ${theme.spacing[4]} 0;
    padding: ${theme.spacing[2]};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[3]};
  }
`;

const StatCard = styled.div`
  padding: ${theme.spacing[4]};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[2]};
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[600]};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: ${theme.spacing[4]};
  text-align: center;
  padding: ${theme.spacing[12]};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[8]};
  }
`;

const EmptyIcon = styled.div`
  font-size: 64px;
`;

const EmptyTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const EmptyText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  max-width: 400px;
`;
