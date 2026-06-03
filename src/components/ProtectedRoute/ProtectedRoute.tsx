import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { RoleName } from '../../types/Role';

interface Props {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { session, role, loading } = useAuth();

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

  if (!session) return <Navigate to="/login" />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}