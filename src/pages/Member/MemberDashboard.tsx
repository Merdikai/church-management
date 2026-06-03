import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getAnnouncements } from '../../services/announcementService';
import { getAllEvents } from '../../services/eventService';
import { formatDate } from '../../utils/helpers';
import '../Admin/AdminDashboard.css';

interface Announcement { id: string; title: string; body: string; scope: string; created_at: string; }
interface Event { id: string; title: string; event_date: string; location?: string; }

export default function MemberDashboard() {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name ?? 'Member';
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [annRes, evRes] = await Promise.all([getAnnouncements(), getAllEvents()]);
    if (annRes.data) setAnnouncements(annRes.data.slice(0, 3));
    if (evRes.data) setEvents(evRes.data.filter((e: Event) => new Date(e.event_date) >= new Date()).slice(0, 3));
    setLoading(false);
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Welcome, {fullName} 👋</h1>
          <p>Stay connected with your church community.</p>
        </div>

        {loading ? <div className="loading-state">Loading...</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="section-card">
              <div className="section-card-header"><h2>📢 Latest Announcements</h2></div>
              {announcements.length === 0 ? (
                <div className="empty-state"><p>No announcements</p></div>
              ) : announcements.map((ann) => (
                <div key={ann.id} style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{ann.title}</div>
                  <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.3rem' }}>{ann.body}</p>
                  <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{formatDate(ann.created_at)}</span>
                </div>
              ))}
            </div>

            <div className="section-card">
              <div className="section-card-header"><h2>📅 Upcoming Events</h2></div>
              {events.length === 0 ? (
                <div className="empty-state"><p>No upcoming events</p></div>
              ) : events.map((ev) => (
                <div key={ev.id} style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{ev.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>
                    📅 {formatDate(ev.event_date)} {ev.location && `· 📍 ${ev.location}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}