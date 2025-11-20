import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  padding?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Card = ({ children, padding = '6', hoverable = false, onClick, className }: CardProps) => {
  const classNames = [
    styles.card,
    styles[`padding${padding}`],
    hoverable && styles.hoverable,
    onClick && !hoverable && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={onClick}>
      {children}
    </div>
  );
};

// Card subcomponents
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({ title, subtitle, action }: CardHeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.actionContainer}>{action}</div>}
    </div>
  );
};

export const CardContent = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={`${styles.content} ${className || ''}`}>{children}</div>;
};

export const CardFooter = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={`${styles.footer} ${className || ''}`}>{children}</div>;
};
