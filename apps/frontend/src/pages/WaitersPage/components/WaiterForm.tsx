import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '@/components/ui';
import { useCreateWaiter, useUpdateWaiter } from '@/hooks/useWaiters';
import { X, Plus } from 'lucide-react';
import type { Waiter } from '@hostes/shared';
import styled from 'styled-components';
import { theme } from '@/styles/theme';

interface WaiterFormProps {
  onClose: () => void;
  waiter?: Waiter;
}

const COMMON_LANGUAGES = ['Русский', 'Английский', 'Турецкий', 'Немецкий', 'Французский', 'Испанский', 'Итальянский', 'Китайский', 'Арабский'];

export const WaiterForm = ({ onClose, waiter }: WaiterFormProps) => {
  const [languages, setLanguages] = useState<string[]>(waiter?.languages || []);
  const [newLanguage, setNewLanguage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      firstName: waiter?.firstName || '',
      lastName: waiter?.lastName || '',
      birthYear: waiter?.birthYear || '',
      isActive: waiter?.isActive ?? true,
    },
  });

  const createWaiter = useCreateWaiter();
  const updateWaiter = useUpdateWaiter();

  useEffect(() => {
    if (waiter) {
      reset({
        firstName: waiter.firstName,
        lastName: waiter.lastName,
        birthYear: waiter.birthYear || '',
        isActive: waiter.isActive,
      });
      setLanguages(waiter.languages || []);
    }
  }, [waiter, reset]);

  const addLanguage = (lang: string) => {
    if (lang && !languages.includes(lang)) {
      setLanguages([...languages, lang]);
    }
    setNewLanguage('');
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const onSubmit = async (data: any) => {
    try {
      const waiterData = {
        firstName: data.firstName,
        lastName: data.lastName,
        birthYear: data.birthYear ? Number(data.birthYear) : undefined,
        languages,
        isActive: data.isActive,
      };

      if (waiter) {
        await updateWaiter.mutateAsync({ id: waiter.id, data: waiterData });
      } else {
        await createWaiter.mutateAsync(waiterData);
      }
      onClose();
    } catch (error) {
      console.error('Form error:', error);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormHeader>
        <FormTitle>
          {waiter ? 'Редактировать официанта' : 'Новый официант'}
        </FormTitle>
        <CloseButton onClick={onClose} type="button">
          <X size={20} />
        </CloseButton>
      </FormHeader>

      <FormContent>
        <NameRow>
          <Input
            label="Фамилия"
            placeholder="Иванов"
            error={errors.lastName?.message}
            {...register('lastName', {
              required: 'Введите фамилию',
              minLength: { value: 2, message: 'Минимум 2 символа' },
            })}
          />

          <Input
            label="Имя"
            placeholder="Иван"
            error={errors.firstName?.message}
            {...register('firstName', {
              required: 'Введите имя',
              minLength: { value: 2, message: 'Минимум 2 символа' },
            })}
          />
        </NameRow>

        <Input
          label="Год рождения"
          type="number"
          placeholder="1990"
          error={errors.birthYear?.message}
          {...register('birthYear', {
            min: { value: 1950, message: 'Год должен быть не менее 1950' },
            max: { value: currentYear - 16, message: `Минимальный возраст 16 лет` },
          })}
        />

        <LanguagesSection>
          <LanguagesLabel>Знание языков</LanguagesLabel>

          <LanguagesList>
            {languages.map((lang) => (
              <LanguageTag key={lang}>
                {lang}
                <LanguageRemove type="button" onClick={() => removeLanguage(lang)}>
                  <X size={14} />
                </LanguageRemove>
              </LanguageTag>
            ))}
          </LanguagesList>

          <LanguageInputRow>
            <LanguageInput
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Добавить язык..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLanguage(newLanguage);
                }
              }}
            />
            <AddLanguageButton
              type="button"
              onClick={() => addLanguage(newLanguage)}
              disabled={!newLanguage}
            >
              <Plus size={16} />
            </AddLanguageButton>
          </LanguageInputRow>

          <QuickLanguages>
            {COMMON_LANGUAGES.filter(l => !languages.includes(l)).slice(0, 5).map((lang) => (
              <QuickLanguageButton
                key={lang}
                type="button"
                onClick={() => addLanguage(lang)}
              >
                + {lang}
              </QuickLanguageButton>
            ))}
          </QuickLanguages>
        </LanguagesSection>

        <CheckboxRow>
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
          />
          <CheckboxLabel htmlFor="isActive">Активный официант</CheckboxLabel>
        </CheckboxRow>
      </FormContent>

      <FormFooter>
        <Button variant="ghost" type="button" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {waiter ? 'Сохранить' : 'Создать'}
        </Button>
      </FormFooter>
    </Form>
  );
};

// Styled Components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
  min-width: 520px;

  @media (max-width: 640px) {
    min-width: unset;
    width: 100%;
  }
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const FormTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.text.primary};
  }
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[4]};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const LanguagesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const LanguagesLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const LanguagesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing[2]};
  min-height: 32px;
`;

const LanguageTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #5b21b6;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
`;

const LanguageRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #7c3aed;
  cursor: pointer;
  padding: 0;
  margin-left: 2px;

  &:hover {
    color: #dc2626;
  }
`;

const LanguageInputRow = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
`;

const LanguageInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const AddLanguageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${theme.colors.gray[300]};
  background: white;
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${theme.colors.gray[50]};
    border-color: #667eea;
    color: #667eea;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickLanguages = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing[2]};
`;

const QuickLanguageButton = styled.button`
  padding: 4px 10px;
  border: 1px dashed ${theme.colors.gray[300]};
  background: transparent;
  color: ${theme.colors.text.secondary};
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: #667eea;
    color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #667eea;
    cursor: pointer;
  }
`;

const CheckboxLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  cursor: pointer;
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing[3]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.gray[200]};

  @media (max-width: 640px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;
