import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getAllEvents, createEvent, deleteEvent } from '../../../services/eventService';
import { formatDate } from '../../../utils/helpers';
import '../AdminDashboard.css';

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  event_date: string;
  profiles?: { full_name: string };
}

export default function AdminEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    const { data } = await getAllEvents();
    if (data) setEvents(data);
    setLoading(false);
  }

  async function handleCreate() {
    if (!formTitle.trim() || !formDate || !user) return;
    setSaving(true);
    await createEvent(formTitle, formDesc, formLocation, formDate, user.id);
    setSaving(false);
    setShowModal(false);
    setFormTitle(''); setFormDesc('');
    setFormLocation(''); setFormDate('');
    loadEvents();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    await deleteEvent(id);
    loadEvents();
  }

  function isUpcoming(dateStr: string) {
    return new Date(dateStr) >= new Date();
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Events</h1>
          <p>Manage church events and activities</p>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <h2>All Events ({events.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + New Event
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>No events yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map((event) => (
                <div key={event.id} style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  borderLeft: `4px solid ${isUpcoming(event.event_date) ? '#27ae60' : '#ccc'}`,
                  opacity: isUpcoming(event.event_date) ? 1 : 0.6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>
                          {event.title}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.6rem',
                          borderRadius: '20px',
                          background: isUpcoming(event.event_date) ? '#eafaf1' : '#f5f5f5',
                          color: isUpcoming(event.event_date) ? '#1e8449' : '#999',
                          fontWeight: 600,
                        }}>
                          {isUpcoming(event.event_date) ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                      {event.description && (
                        <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                          {event.description}
                        </p>
                      )}
                      <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', gap: '1rem' }}>
                        <span>📅 {formatDate(event.event_date)}</span>
                        {event.location && <span>📍 {event.location}</span>}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New Event</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Event title" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Short description" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="e.g. Main Hall" />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Saving...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}