import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Button, Card, Input, Spinner } from '@/components/ui';
import { Plus, Trash2, Edit2, X, Check, AlertTriangle, Utensils, BookOpen } from 'lucide-react';
import {
  useStoplist,
  useCreateStoplistItem,
  useUpdateStoplistItem,
  useDeleteStoplistItem,
} from '@/hooks/useStoplist';
import {
  useDishesOfDay,
  useCreateDishOfDay,
  useUpdateDishOfDay,
  useDeleteDishOfDay,
} from '@/hooks/useDishesOfDay';
import {
  useStaffRules,
  useCreateStaffRule,
  useUpdateStaffRule,
  useDeleteStaffRule,
} from '@/hooks/useStaffRules';
import type { StopListItem, DishOfDay, StaffRule } from '@hostes/shared';

type Tab = 'stoplist' | 'dishes' | 'rules';

export const MenuManagementPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('stoplist');

  return (
    <Container>
      <Header>
        <Title>Управление меню</Title>
        <Subtitle>Стоп-лист, блюда дня и правила для сотрудников</Subtitle>
      </Header>

      <Tabs>
        <TabButton $active={activeTab === 'stoplist'} onClick={() => setActiveTab('stoplist')}>
          <AlertTriangle size={18} />
          Стоп-лист
        </TabButton>
        <TabButton $active={activeTab === 'dishes'} onClick={() => setActiveTab('dishes')}>
          <Utensils size={18} />
          Блюда дня
        </TabButton>
        <TabButton $active={activeTab === 'rules'} onClick={() => setActiveTab('rules')}>
          <BookOpen size={18} />
          Правила
        </TabButton>
      </Tabs>

      <Content>
        {activeTab === 'stoplist' && <StoplistSection />}
        {activeTab === 'dishes' && <DishesSection />}
        {activeTab === 'rules' && <RulesSection />}
      </Content>
    </Container>
  );
};

// ===== СТОП-ЛИСТ =====
const StoplistSection = () => {
  const { data: items, isLoading } = useStoplist(true);
  const createItem = useCreateStoplistItem();
  const updateItem = useUpdateStoplistItem();
  const deleteItem = useDeleteStoplistItem();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', reason: '', category: '' });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      updateItem.mutate(
        { id: editingId, data: formData },
        { onSuccess: () => { setEditingId(null); setFormData({ name: '', reason: '', category: '' }); } }
      );
    } else {
      createItem.mutate(formData, {
        onSuccess: () => { setShowForm(false); setFormData({ name: '', reason: '', category: '' }); }
      });
    }
  };

  const startEdit = (item: StopListItem) => {
    setEditingId(item.id);
    setFormData({ name: item.name, reason: item.reason || '', category: item.category || '' });
    setShowForm(false);
  };

  if (isLoading) return <Spinner />;

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <AlertTriangle size={20} color={theme.colors.error[500]} />
          Стоп-лист
        </SectionTitle>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          Добавить
        </Button>
      </SectionHeader>

      {showForm && (
        <FormCard>
          <FormTitle>Добавить в стоп-лист</FormTitle>
          <FormGrid>
            <Input
              label="Название блюда"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Стейк Рибай"
            />
            <Input
              label="Причина"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Закончилось, нет ингредиентов..."
            />
            <Input
              label="Категория"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Горячее, Салаты..."
            />
          </FormGrid>
          <FormActions>
            <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim()}>Добавить</Button>
          </FormActions>
        </FormCard>
      )}

      <ItemsList>
        {items?.map((item) => (
          <ItemCard key={item.id} $inactive={!item.isActive}>
            {editingId === item.id ? (
              <EditForm>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Причина"
                />
                <EditActions>
                  <IconButton onClick={handleSubmit}><Check size={16} /></IconButton>
                  <IconButton onClick={() => setEditingId(null)}><X size={16} /></IconButton>
                </EditActions>
              </EditForm>
            ) : (
              <>
                <ItemInfo>
                  <ItemName>{item.name}</ItemName>
                  {item.reason && <ItemReason>{item.reason}</ItemReason>}
                  {item.category && <ItemCategory>{item.category}</ItemCategory>}
                </ItemInfo>
                <ItemActions>
                  <IconButton onClick={() => updateItem.mutate({ id: item.id, data: { isActive: !item.isActive } })}>
                    {item.isActive ? <Check size={16} color={theme.colors.success[500]} /> : <X size={16} color={theme.colors.gray[400]} />}
                  </IconButton>
                  <IconButton onClick={() => startEdit(item)}><Edit2 size={16} /></IconButton>
                  <IconButton onClick={() => deleteItem.mutate(item.id)}><Trash2 size={16} color={theme.colors.error[500]} /></IconButton>
                </ItemActions>
              </>
            )}
          </ItemCard>
        ))}
        {items?.length === 0 && <EmptyState>Стоп-лист пуст</EmptyState>}
      </ItemsList>
    </Section>
  );
};

// ===== БЛЮДА ДНЯ =====
const DishesSection = () => {
  const { data: items, isLoading } = useDishesOfDay(true);
  const createItem = useCreateDishOfDay();
  const updateItem = useUpdateDishOfDay();
  const deleteItem = useDeleteDishOfDay();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '' });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      category: formData.category || undefined,
    };

    if (editingId) {
      updateItem.mutate({ id: editingId, data }, {
        onSuccess: () => { setEditingId(null); setFormData({ name: '', description: '', price: '', category: '' }); }
      });
    } else {
      createItem.mutate(data, {
        onSuccess: () => { setShowForm(false); setFormData({ name: '', description: '', price: '', category: '' }); }
      });
    }
  };

  const startEdit = (item: DishOfDay) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || '',
    });
    setShowForm(false);
  };

  if (isLoading) return <Spinner />;

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <Utensils size={20} color={theme.colors.success[500]} />
          Блюда дня
        </SectionTitle>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          Добавить
        </Button>
      </SectionHeader>

      {showForm && (
        <FormCard>
          <FormTitle>Добавить блюдо дня</FormTitle>
          <FormGrid>
            <Input
              label="Название"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Цена"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <Input
              label="Категория"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </FormGrid>
          <TextAreaWrapper>
            <label>Описание</label>
            <TextArea
              rows={3}
              placeholder="Введите описание блюда..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </TextAreaWrapper>
          <FormActions>
            <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim()}>Добавить</Button>
          </FormActions>
        </FormCard>
      )}

      <ItemsList>
        {items?.map((item) => (
          <ItemCard key={item.id} $inactive={!item.isActive}>
            <ItemInfo>
              <ItemName>{item.name}</ItemName>
              {item.description && <ItemReason>{item.description}</ItemReason>}
              {item.price && <ItemPrice>{item.price} сом</ItemPrice>}
              {item.category && <ItemCategory>{item.category}</ItemCategory>}
            </ItemInfo>
            <ItemActions>
              <IconButton onClick={() => updateItem.mutate({ id: item.id, data: { isActive: !item.isActive } })}>
                {item.isActive ? <Check size={16} color={theme.colors.success[500]} /> : <X size={16} color={theme.colors.gray[400]} />}
              </IconButton>
              <IconButton onClick={() => startEdit(item)}><Edit2 size={16} /></IconButton>
              <IconButton onClick={() => deleteItem.mutate(item.id)}><Trash2 size={16} color={theme.colors.error[500]} /></IconButton>
            </ItemActions>
          </ItemCard>
        ))}
        {items?.length === 0 && <EmptyState>Нет блюд дня</EmptyState>}
      </ItemsList>
    </Section>
  );
};

// ===== ПРАВИЛА =====
const RulesSection = () => {
  const { data: rules, isLoading } = useStaffRules(true);
  const createRule = useCreateStaffRule();
  const updateRule = useUpdateStaffRule();
  const deleteRule = useDeleteStaffRule();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', priority: '0', category: '' });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    const data = {
      title: formData.title,
      content: formData.content,
      priority: parseInt(formData.priority) || 0,
      category: formData.category || undefined,
    };

    if (editingId) {
      updateRule.mutate({ id: editingId, data }, {
        onSuccess: () => { setEditingId(null); setFormData({ title: '', content: '', priority: '0', category: '' }); }
      });
    } else {
      createRule.mutate(data, {
        onSuccess: () => { setShowForm(false); setFormData({ title: '', content: '', priority: '0', category: '' }); }
      });
    }
  };

  const startEdit = (rule: StaffRule) => {
    setEditingId(rule.id);
    setFormData({
      title: rule.title,
      content: rule.content,
      priority: rule.priority?.toString() || '0',
      category: rule.category || '',
    });
    setShowForm(false);
  };

  if (isLoading) return <Spinner />;

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <BookOpen size={20} color={theme.colors.primary[500]} />
          Правила для сотрудников
        </SectionTitle>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          Добавить
        </Button>
      </SectionHeader>

      {showForm && (
        <FormCard>
          <FormTitle>Добавить правило</FormTitle>
          <FormGrid>
            <Input
              label="Заголовок"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              label="Категория"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Общие, Безопасность..."
            />
            <Input
              label="Приоритет"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />
          </FormGrid>
          <TextAreaWrapper>
            <label>Содержание</label>
            <TextArea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
            />
          </TextAreaWrapper>
          <FormActions>
            <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
            <Button onClick={handleSubmit} disabled={!formData.title.trim() || !formData.content.trim()}>
              Добавить
            </Button>
          </FormActions>
        </FormCard>
      )}

      <ItemsList>
        {rules?.map((rule) => (
          <RuleCard key={rule.id} $inactive={!rule.isActive}>
            <RuleHeader>
              <RuleTitle>{rule.title}</RuleTitle>
              {rule.priority > 0 && <PriorityBadge>Приоритет: {rule.priority}</PriorityBadge>}
            </RuleHeader>
            <RuleContent>{rule.content}</RuleContent>
            {rule.category && <ItemCategory>{rule.category}</ItemCategory>}
            <ItemActions>
              <IconButton onClick={() => updateRule.mutate({ id: rule.id, data: { isActive: !rule.isActive } })}>
                {rule.isActive ? <Check size={16} color={theme.colors.success[500]} /> : <X size={16} color={theme.colors.gray[400]} />}
              </IconButton>
              <IconButton onClick={() => startEdit(rule)}><Edit2 size={16} /></IconButton>
              <IconButton onClick={() => deleteRule.mutate(rule.id)}><Trash2 size={16} color={theme.colors.error[500]} /></IconButton>
            </ItemActions>
          </RuleCard>
        ))}
        {rules?.length === 0 && <EmptyState>Нет правил</EmptyState>}
      </ItemsList>
    </Section>
  );
};

// ===== STYLED COMPONENTS =====
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};

  @media (max-width: 768px) {
    padding: ${theme.spacing[4]};
  }
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing[6]};

  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing[4]};
  }
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing[2]};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: ${theme.spacing[2]};
  overflow-x: auto;

  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing[4]};
    gap: ${theme.spacing[1]};
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: none;
  background: ${({ $active }) => $active ? theme.colors.primary[50] : 'transparent'};
  color: ${({ $active }) => $active ? theme.colors.primary[700] : theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    background: ${({ $active }) => $active ? theme.colors.primary[100] : theme.colors.gray[100]};
  }

  @media (max-width: 768px) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const Content = styled.div``;

const Section = styled.div``;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.spacing[3]};
  }
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const FormCard = styled(Card)`
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
  background: ${theme.colors.gray[50]};

  @media (max-width: 768px) {
    padding: ${theme.spacing[3]};
  }
`;

const FormTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[4]};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.base};
    margin-bottom: ${theme.spacing[3]};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[3]};
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[4]};

  @media (max-width: 768px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const ItemCard = styled(Card)<{ $inactive?: boolean }>`
  padding: ${theme.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: ${({ $inactive }) => $inactive ? 0.6 : 1};
  background: ${({ $inactive }) => $inactive ? theme.colors.gray[100] : 'white'};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[3]};
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const ItemReason = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing[1]};
`;

const ItemCategory = styled.span`
  display: inline-block;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.primary[600]};
  background: ${theme.colors.primary[50]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  margin-top: ${theme.spacing[2]};
`;

const ItemPrice = styled.span`
  display: inline-block;
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.success[600]};
  margin-top: ${theme.spacing[1]};
`;

const ItemActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: ${theme.colors.gray[100]};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.gray[200]};
  }
`;

const EditForm = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  flex: 1;
  align-items: center;
`;

const EditActions = styled.div`
  display: flex;
  gap: ${theme.spacing[1]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]};
  color: ${theme.colors.text.secondary};
`;

const RuleCard = styled(ItemCard)`
  flex-direction: column;
  align-items: flex-start;
`;

const RuleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  width: 100%;
`;

const RuleTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.lg};
`;

const RuleContent = styled.div`
  margin-top: ${theme.spacing[2]};
  color: ${theme.colors.text.secondary};
  white-space: pre-wrap;
`;

const PriorityBadge = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.warning[700]};
  background: ${theme.colors.warning[100]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
`;

const TextAreaWrapper = styled.div`
  margin-top: ${theme.spacing[4]};

  label {
    display: block;
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing[2]};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
  }
`;

export default MenuManagementPage;
