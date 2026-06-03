import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getAllEvents } from '../../../services/eventService';
import { formatDate } from '../../../utils/helpers';
import '../../Admin/AdminDashboard.css';

interface Event { id: string; title: string; description?: string; location?: string; event_date: string; }

export default function MemberEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await getAllEvents();
    if (data) setEvents(data);
    setLoading(false);
  }

  const filtered = events.filter(e =>
    filter === 'upcoming' ? new Date(e.event_date) >= new Date() : new Date(e.event_date) < new Date()
  );

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Events</h1>
          <p>Church events and activities</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['upcoming', 'past'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}>
              {f === 'upcoming' ? '📅 Upcoming' : '🕐 Past'}
            </button>
          ))}
        </div>

        <div className="section-card">
          {loading ? <div className="loading-state">Loading...</div>
          : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📅</div><p>No {filter} events</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map((ev) => (
                <div key={ev.id} style={{ border: '1px solid #f0f0f0', borderRadius: '10px', padding: '1.25rem', borderLeft: `4px solid ${filter === 'upcoming' ? '#27ae60' : '#ccc'}` }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e', marginBottom: '0.4rem' }}>{ev.title}</div>
                  {ev.description && <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{ev.description}</p>}
                  <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', gap: '1.25rem' }}>
                    <span>📅 {formatDate(ev.event_date)}</span>
                    {ev.location && <span>📍 {ev.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}