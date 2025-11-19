import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner = ({ size = 'md', color = '#2563eb' }: SpinnerProps) => {
  const style = {
    borderColor: `${color}20`,
    borderTopColor: color,
    borderStyle: 'solid',
  };

  return <div className={`${styles.spinner} ${styles[size]}`} style={style} />;
};

export const PageSpinner = () => {
  return (
    <div className={styles.pageSpinnerContainer}>
      <Spinner size="lg" />
    </div>
  );
};
