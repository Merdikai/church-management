import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabase';
import '../Auth/Login.css';
import './Register.css';

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!fullName) newErrors.fullName = t('errors.fullNameRequired');
    if (!email) newErrors.email = t('errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('errors.invalidEmail');
    if (!password) newErrors.password = t('errors.passwordRequired');
    else if (password.length < 6) newErrors.password = t('errors.passwordShort');
    if (password !== confirmPassword) newErrors.confirmPassword = t('errors.passwordMismatch');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/login'), 3000);
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

      <div className="auth-card register-card">
        <div className="auth-logo">
          <div className="cross">✝</div>
          <h1>{t('appName')}</h1>
          <p>Join our community</p>
        </div>

        <div className="auth-form">
          <h2>{t('register')}</h2>

          {authError && <div className="auth-error">{authError}</div>}
          {success && (
            <div className="success-box">
              Registration successful! Check your email to confirm your account.
              Redirecting to login...
            </div>
          )}

          <div className="form-group">
            <label>{t('fullName')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={errors.fullName ? 'error' : ''}
              placeholder="Abebe Kebede"
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

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
          </div>

          <div className="form-group">
            <label>{t('confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <button className="auth-btn" onClick={handleRegister} disabled={loading || success}>
            {loading ? t('loading') : t('register')}
          </button>
        </div>

        <div className="auth-footer">
          <span>{t('hasAccount')} </span>
          <Link to="/login">{t('login')}</Link>
        </div>
      </div>
    </div>
  );
}