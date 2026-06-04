import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getAnnouncements } from '../../services/announcementService';
import { getAllEvents } from '../../services/eventService';
import { formatDate } from '../../utils/helpers';
import './MemberDashboard.css';

interface Announcement {
  id: string; title: string; body: string; scope: string; created_at: string;
  profiles?: { full_name: string };
}

interface Event {
  id: string; title: string; description?: string; event_date: string; location?: string;
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name ?? 'Member';
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData().catch(() => { setError(true); setLoading(false); });
  }, []);

  async function loadData() {
    setLoading(true);
    setError(false);
    const [annRes, evRes] = await Promise.all([
      getAnnouncements(),
      getAllEvents(),
    ]);
    if (annRes.data) setAnnouncements(annRes.data.slice(0, 4));
    if (evRes.data) setEvents(evRes.data.filter((e: Event) => new Date(e.event_date) >= new Date()).slice(0, 4));
    setLoading(false);
  }

  function isToday(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }

  function getDayNumber(dateStr: string) {
    return new Date(dateStr).getDate();
  }

  function getMonthShort(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });
  }

  const quickLinks = [
    {
      to: '/member/teams',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      label: 'Teams',
      color: '#3b82f6',
    },
    {
      to: '/member/announcements',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      label: 'News',
      color: '#10b981',
    },
    {
      to: '/member/events',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      label: 'Events',
      color: '#f59e0b',
    },
    {
      to: '/member/prayer',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v3.5c0 1.5 1 3 3 3s3-1.5 3-3V5a3 3 0 0 0-3-3z" /><path d="M8 10c-1.5 2-2 5-2 8h12c0-3-.5-6-2-8" />
        </svg>
      ),
      label: 'Prayer',
      color: '#8b5cf6',
    },
  ];

  if (error) {
    return (
      <Layout>
        <div className="member-dashboard">
          <div className="page-header">
            <h1>Welcome, {fullName} 👋</h1>
            <p>Stay connected with your church community.</p>
          </div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load dashboard</p>
            <button className="btn btn-primary" onClick={loadData}>Refresh</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="member-dashboard">
        {/* Welcome Banner */}
        <div className="welcome-banner member-banner">
          <div className="welcome-content">
            <div>
              <h1>Welcome, {fullName} 👋</h1>
              <p>Stay connected with your church community</p>
            </div>
            <div className="welcome-avatar">
              {fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="member-skeleton">
            <div className="quick-links-skeleton">
              {[1,2,3,4].map(i => (
                <div key={i} className="quick-link-skeleton-item" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Quick Links */}
            <div className="member-quick-links">
              {quickLinks.map((link) => (
                <Link key={link.to} to={link.to} className="member-quick-link">
                  <div className="quick-link-icon" style={{ background: link.color + '15', color: link.color }}>
                    {link.icon}
                  </div>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Content Grid */}
            <div className="member-content-grid">
              {/* Announcements */}
              <div className="section-card">
                <div className="section-card-header">
                  <h2>📢 Latest Announcements</h2>
                  <Link to="/member/announcements" className="section-link">View all</Link>
                </div>
                {announcements.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No announcements yet</p>
                  </div>
                ) : (
                  <div className="announcements-mini-list">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="announcement-mini-item">
                        <div className="announcement-mini-scope">
                          <span className={`scope-dot ${ann.scope}`} />
                          {ann.scope === 'global' ? 'Global' : 'Team'}
                        </div>
                        <h3>{ann.title}</h3>
                        <p>{ann.body.length > 80 ? ann.body.slice(0, 80) + '...' : ann.body}</p>
                        <span className="announcement-mini-date">{formatDate(ann.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Events */}
              <div className="section-card">
                <div className="section-card-header">
                  <h2>📅 Upcoming Events</h2>
                  <Link to="/member/events" className="section-link">View all</Link>
                </div>
                {events.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  <div className="events-mini-list">
                    {events.map((ev) => (
                      <div key={ev.id} className="event-mini-item">
                        <div className="event-mini-date">
                          <span className="event-mini-month">{getMonthShort(ev.event_date)}</span>
                          <span className="event-mini-day">{getDayNumber(ev.event_date)}</span>
                          {isToday(ev.event_date) && <span className="event-today-badge">Today</span>}
                        </div>
                        <div className="event-mini-info">
                          <h3>{ev.title}</h3>
                          <div className="event-mini-meta">
                            <span>{formatDate(ev.event_date)}</span>
                            {ev.location && <span>📍 {ev.location}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}