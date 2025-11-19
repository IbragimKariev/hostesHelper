import { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Button } from './ui';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorCard>
            <IconWrapper>
              <AlertCircle size={64} />
            </IconWrapper>
            <Title>Что-то пошло не так</Title>
            <Message>
              {this.state.error?.message || 'Произошла неожиданная ошибка'}
            </Message>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <ErrorDetails>
                <DetailsTitle>Детали ошибки:</DetailsTitle>
                <CodeBlock>{this.state.error.stack}</CodeBlock>
              </ErrorDetails>
            )}
            <Actions>
              <Button
                leftIcon={<RefreshCw size={20} />}
                onClick={this.handleReset}
              >
                Попробовать снова
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Перезагрузить страницу
              </Button>
            </Actions>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// Styled Components
const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${theme.spacing[6]};
  background: ${theme.colors.surface};
`;

const ErrorCard = styled.div`
  max-width: 600px;
  width: 100%;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing[8]};
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing[4]};
  color: ${theme.colors.error[500]};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`;

const Message = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[6]};
  line-height: 1.6;
`;

const ErrorDetails = styled.div`
  margin-bottom: ${theme.spacing[6]};
  text-align: left;
`;

const DetailsTitle = styled.h3`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[2]};
`;

const CodeBlock = styled.pre`
  background: ${theme.colors.gray[100]};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.error[700]};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: center;
  flex-wrap: wrap;
`;
