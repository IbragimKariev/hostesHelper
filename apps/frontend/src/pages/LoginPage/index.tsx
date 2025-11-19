import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ login: '', password: '' });

  const navigate = useNavigate();
  const loginMutation = useLogin();

  const validate = () => {
    const newErrors = { login: '', password: '' };
    let isValid = true;

    if (!login || login.length < 3) {
      newErrors.login = 'Логин должен содержать минимум 3 символа';
      isValid = false;
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await loginMutation.mutateAsync({ login, password });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🍽️</div>
          <h1 className={styles.logoTitle}>Hostes</h1>
          <p className={styles.logoSubtitle}>Система управления бронированиями</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>
              Логин
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className={`${styles.input} ${errors.login ? styles.error : ''}`}
              placeholder="Введите логин"
              autoComplete="username"
            />
            {errors.login && <span className={styles.errorText}>{errors.login}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Вход...' : (
              <>
                <LogIn size={20} />
                Войти
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Учетные данные для теста:</p>
          <p><strong>Админ:</strong> admin / admin123</p>
          <p><strong>Хостес:</strong> hostess / hostess123</p>
        </div>
      </div>
    </div>
  );
};
