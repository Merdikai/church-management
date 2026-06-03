import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../services/notificationService';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  async function loadUnread() {
    const { data } = await getNotifications(user!.id);
    if (data) setUnreadCount(data.filter((n: {is_read: boolean}) => !n.is_read).length);
  }

  return (
    <button
      onClick={() => navigate('/notifications')}
      style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: '#555', padding: '4px' }}
    >
      🔔
      {unreadCount > 0 && (
        <span style={{ position: 'absolute', top: '0', right: '0', background: '#e74c3c', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}