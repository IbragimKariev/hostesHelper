import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Focus modal after a brief delay to allow render
      setTimeout(() => {
        modalRef.current?.focus();
      }, 10);
    } else {
      document.body.style.overflow = 'unset';

      // Restore focus to previous element
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Backdrop
      onClick={onClose}
      role="presentation"
    >
      <ModalContainer
        ref={modalRef}
        $size={size}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        {title && (
          <ModalHeader>
            <ModalTitle id="modal-title">{title}</ModalTitle>
            <CloseButton
              onClick={onClose}
              aria-label="Закрыть модальное окно"
            >
              <X size={20} />
            </CloseButton>
          </ModalHeader>
        )}
        
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </Backdrop>
  );
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[4]};
  z-index: ${theme.zIndex.modalBackdrop};
  animation: fadeIn ${theme.transitions.base};

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const sizeMap = {
  sm: '400px',
  md: '600px',
  lg: '800px',
  xl: '1000px',
};

const ModalContainer = styled.div<{ $size: 'sm' | 'md' | 'lg' | 'xl' }>`
  position: relative;
  width: 100%;
  max-width: ${(props) => sizeMap[props.$size]};
  max-height: 90vh;
  background: white;
  border-radius: ${theme.borderRadius['2xl']};
  box-shadow: ${theme.shadows['2xl']};
  display: flex;
  flex-direction: column;
  animation: slideUp ${theme.transitions.base};
  z-index: ${theme.zIndex.modal};

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.divider};
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.text.primary};
  }
`;

const CloseButtonAbsolute = styled(CloseButton)`
  position: absolute;
  top: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  z-index: 1;
`;

const ModalBody = styled.div`
  flex: 1;
  padding: ${theme.spacing[6]};
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[6]};
  border-top: 1px solid ${theme.colors.divider};
`;
