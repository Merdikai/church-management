import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabase';
import './Login.css';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email) { setError(t('errors.emailRequired')); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError(t('errors.invalidEmail')); return; }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="cross">✝</div>
          <h1>{t('appName')}</h1>
        </div>

        <div className="auth-form">
          <h2>{t('forgotPassword')}</h2>

          {error && <div className="auth-error">{error}</div>}

          {success ? (
            <div style={{
              background: '#eafaf1',
              border: '1px solid #2ecc71',
              color: '#27ae60',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {t('resetSent')}
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? 'error' : ''}
                  placeholder="you@example.com"
                />
              </div>
              <button className="auth-btn" onClick={handleReset} disabled={loading}>
                {loading ? t('loading') : t('resetPassword')}
              </button>
            </>
          )}
        </div>

        <div className="auth-footer">
          <Link to="/login">{t('backToLogin')}</Link>
        </div>
      </div>
    </div>
  );
}