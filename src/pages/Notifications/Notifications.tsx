import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllAsRead, markAsRead } from '../../services/notificationService';
import { formatDate } from '../../utils/helpers';
import '../Admin/AdminDashboard.css';

interface Notification { id: string; message: string; is_read: boolean; created_at: string; }

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const { data } = await getNotifications(user!.id);
    if (data) setNotifications(data);
    setLoading(false);
  }

  async function handleMarkAllRead() {
    if (!user) return;
    await markAllAsRead(user.id);
    loadData();
  }

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    loadData();
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Layout>
      <div className="admin-page" style={{ maxWidth: '700px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="section-card">
          {loading ? <div className="loading-state">Loading...</div>
          : notifications.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🔔</div><p>No notifications yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map((n) => (
                <div key={n.id} onClick={() => !n.is_read && handleMarkRead(n.id)}
                  style={{ padding: '1rem', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: n.is_read ? 'transparent' : '#f0f7ff', cursor: n.is_read ? 'default' : 'pointer', borderRadius: '8px', marginBottom: '4px' }}>
                  <div>
                    <p style={{ color: '#333', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{n.message}</p>
                    <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{formatDate(n.created_at)}</span>
                  </div>
                  {!n.is_read && (
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0f3460', flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}