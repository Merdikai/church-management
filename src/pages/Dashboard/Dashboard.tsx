import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { role, session, loading } = useAuth();
  const { t } = useTranslation();

  if (!session) return <Navigate to="/login" />;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: 'white', fontSize: '1.2rem', fontFamily: 'sans-serif' }}>
        {t('loading')}
      </div>
    );
  }

  if (role === 'admin') return <Navigate to="/admin" />;
  if (role === 'leader') return <Navigate to="/leader" />;
  return <Navigate to="/member" />;
}