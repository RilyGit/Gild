import { useState } from 'react';
import './Auth.css';

const technicalErrorMessage = 'Сталася технічна проблема. Спробуйте ще раз пізніше.';

function Auth({ onAuthSuccess }) {
const [isLogin, setIsLogin] = useState(true); 
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [message, setMessage] = useState('');

const handleSubmit = async (event) => {
  event.preventDefault();
  setError('');
  setMessage('');

  try {
    const endpoint = isLogin ? 'login' : 'register';
    const res = await fetch(`http://localhost:3100/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: email, Password: password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status >= 500) {
        throw new Error(technicalErrorMessage);
      }

      throw new Error(
        data.message || data.error || 'Не вдалося виконати запит. Перевірте дані та спробуйте ще раз.',
      );
    }

    if (!isLogin) {
      setIsLogin(true);
      setMessage('Реєстрація успішна. Тепер увійдіть.');
    } else {
      localStorage.setItem('token', data.token);
      onAuthSuccess();
    }
  } catch (requestError) {
    if (requestError instanceof TypeError || requestError.message === 'Failed to fetch') {
      setError(technicalErrorMessage);
    } else {
      setError(requestError.message || technicalErrorMessage);
    }
  }
};

return (
  <main className="auth-container">
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>{isLogin ? 'Вхід' : 'Реєстрація'}</h1>
      <div className="auth-field">
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="auth-field">
        <label htmlFor="auth-password">Пароль</label>
        <input
          id="auth-password"
          type="password"
          placeholder="Не менше 8 символів"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
      </div>
      {error && <p className="auth-message auth-message-error" role="alert">{error}</p>}
      {message && <p className="auth-message auth-message-success">{message}</p>}
      <button className="auth-submit" type="submit">{isLogin ? 'Увійти' : 'Зареєструватися'}</button>
      <button
        className="auth-switch"
        type="button"
        onClick={() => {
          setIsLogin(!isLogin);
          setError('');
          setMessage('');
        }}
      >
        {isLogin ? 'Створити акаунт' : 'Увійти в існуючий акаунт'}
      </button>
    </form>
  </main>
);
}

export default Auth;