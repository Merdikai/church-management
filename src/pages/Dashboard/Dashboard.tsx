import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { role, session, loading } = useAuth();

  if (!session) return <Navigate to="/login" />;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        color: '#0f3460'
      }}>
        Loading...
      </div>
    );
  }

  if (role === 'admin') return <Navigate to="/admin" />;
  if (role === 'leader') return <Navigate to="/leader" />;
  return <Navigate to="/member" />;
}