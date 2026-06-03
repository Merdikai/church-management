import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabase';
import './Login.css';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = t('errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('errors.invalidEmail');
    if (!password) newErrors.password = t('errors.passwordRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  }

  return (
    <div className="auth-wrapper">
      <div className="lang-toggle">
        <button
          className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
          onClick={() => i18n.changeLanguage('en')}
        >
          EN
        </button>
        <button
          className={`lang-btn ${i18n.language === 'am' ? 'active' : ''}`}
          onClick={() => i18n.changeLanguage('am')}
        >
          አማ
        </button>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="cross">✝</div>
          <h1>{t('appName')}</h1>
          <p>Welcome back</p>
        </div>

        <div className="auth-form">
          <h2>{t('login')}</h2>

          {authError && <div className="auth-error">{authError}</div>}

          <div className="form-group">
            <label>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="you@example.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'error' : ''}
              placeholder="••••••••"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
            <Link to="/forgot-password" className="forgot-link">
              {t('forgotPasswordLink')}
            </Link>
          </div>

          <button className="auth-btn" onClick={handleLogin} disabled={loading}>
            {loading ? t('loading') : t('login')}
          </button>
        </div>

        <div className="auth-footer">
          <span>{t('noAccount')} </span>
          <Link to="/register">{t('register')}</Link>
        </div>
      </div>
    </div>
  );
}