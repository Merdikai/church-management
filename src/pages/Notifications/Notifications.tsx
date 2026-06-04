import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllAsRead, markAsRead, deleteNotification } from '../../services/notificationService';
import { formatDate } from '../../utils/helpers';
import './Notifications.css';

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadData().catch(() => { setError(true); setLoading(false); });
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    setError(false);
    const { data } = await getNotifications(user!.id);
    if (data) setNotifications(data);
    setLoading(false);
  }

  async function handleMarkAllRead() {
    if (!user) return;
    await markAllAsRead(user.id);
    setMessage('✅ All notifications marked as read');
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    loadData();
  }

  async function handleDelete(id: string) {
    // Delete from state immediately for responsiveness
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteNotification(id);
    } catch {
      loadData(); // Reload if delete fails
    }
  }

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  function getTimeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  }

  function getNotificationIcon(message: string) {
    if (message.includes('approved') || message.includes('Approved')) return '✅';
    if (message.includes('rejected') || message.includes('not approved')) return '❌';
    if (message.includes('leader') || message.includes('Leader')) return '👑';
    if (message.includes('team') || message.includes('Team')) return '👥';
    if (message.includes('event') || message.includes('Event')) return '📅';
    return '🔔';
  }

  if (error) {
    return (
      <Layout>
        <div className="notifications-page">
          <div className="notifications-header">
            <h1>Notifications</h1>
          </div>
          <div className="notifications-empty">
            <div className="empty-icon-lg">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load notifications</p>
            <button className="btn btn-primary" onClick={loadData}>Try Again</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="notifications-page">
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-header-left">
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span className="notifications-unread-badge">{unreadCount} new</span>
            )}
          </div>
          <div className="notifications-header-actions">
            {unreadCount > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Mark all read
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={loadData}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="notifications-toast">{message}</div>
        )}

        {/* Quick Stats */}
        <div className="notifications-stats">
          <button
            className={`notifications-stat ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="notifications-stat-value">{notifications.length}</span>
            <span className="notifications-stat-label">All</span>
          </button>
          <button
            className={`notifications-stat ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            <span className="notifications-stat-value unread">{unreadCount}</span>
            <span className="notifications-stat-label">Unread</span>
          </button>
          <button
            className={`notifications-stat ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            <span className="notifications-stat-value">{readCount}</span>
            <span className="notifications-stat-label">Read</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-card">
          {loading ? (
            <div className="notifications-skeleton">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="notification-skeleton-item">
                  <div className="skeleton-circle" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line xshort" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="notifications-empty">
              <div className="empty-icon-lg">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3>
                {filter === 'unread' ? 'No unread notifications' :
                 filter === 'read' ? 'No read notifications' :
                 'No notifications yet'}
              </h3>
              <p>
                {filter === 'unread' ? "You're all caught up!" :
                 filter === 'read' ? 'Read notifications will appear here' :
                 'Notifications from your church will appear here'}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                >
                  <div className={`notification-icon ${!n.is_read ? 'unread-icon' : ''}`}>
                    {getNotificationIcon(n.message)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{getTimeAgo(n.created_at)}</span>
                  </div>
                  <div className="notification-actions">
                    {!n.is_read && (
                      <button
                        className="notification-mark-btn"
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                        title="Mark as read"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                    )}
                    <button
                      className="notification-delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  {!n.is_read && <div className="notification-dot" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}