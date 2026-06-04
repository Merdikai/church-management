import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getAllEvents, createEvent, deleteEvent } from '../../../services/eventService';
import '../AdminDashboard.css';

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  event_date: string;
  profiles?: { full_name: string };
}

type FilterStatus = 'all' | 'upcoming' | 'past';

export default function AdminEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEvents().catch(() => { setError(true); setLoading(false); });
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError(false);
    const { data } = await getAllEvents();
    if (data) {
      // Sort by date (upcoming first)
      data.sort((a: Event, b: Event) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      setEvents(data);
    }
    setLoading(false);
  }

  function isUpcoming(dateStr: string) {
    return new Date(dateStr) >= new Date();
  }

  function getEventStatus(dateStr: string) {
    const eventDate = new Date(dateStr);
    const now = new Date();
    if (eventDate < now) return 'past';
    const diffMs = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'today';
    if (diffDays <= 7) return 'this-week';
    return 'upcoming';
  }

  function getStatusLabel(dateStr: string) {
    const status = getEventStatus(dateStr);
    switch (status) {
      case 'today': return 'Today';
      case 'this-week': return 'This Week';
      case 'upcoming': return 'Upcoming';
      case 'past': return 'Past';
    }
  }

  function getStatusColor(dateStr: string) {
    const status = getEventStatus(dateStr);
    switch (status) {
      case 'today': return '#ef4444';
      case 'this-week': return '#f59e0b';
      case 'upcoming': return '#10b981';
      case 'past': return '#9ca3af';
    }
  }

  function getDayOfWeek(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  }

  function getDayNumber(dateStr: string) {
    return new Date(dateStr).getDate();
  }

  function getMonth(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });
  }

  function getTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  async function handleCreate() {
    if (!formTitle.trim() || !formDate || !user) return;
    setSaving(true);
    const fullDateTime = formTime ? `${formDate}T${formTime}:00` : formDate;
    await createEvent(formTitle, formDesc, formLocation, fullDateTime, user.id);
    setSaving(false);
    setShowModal(false);
    setFormTitle(''); setFormDesc(''); setFormLocation(''); setFormDate(''); setFormTime('');
    setMessage('✅ Event created successfully');
    setTimeout(() => setMessage(''), 3000);
    loadEvents();
  }

  async function handleDelete(id: string) {
    await deleteEvent(id);
    setShowDeleteConfirm(null);
    setMessage('✅ Event deleted');
    setTimeout(() => setMessage(''), 3000);
    loadEvents();
  }

  const filteredEvents = events
    .filter(e => {
      if (filterStatus === 'upcoming') return isUpcoming(e.event_date);
      if (filterStatus === 'past') return !isUpcoming(e.event_date);
      return true;
    })
    .filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(search.toLowerCase())
    );

  const upcomingCount = events.filter(e => isUpcoming(e.event_date)).length;
  const pastCount = events.filter(e => !isUpcoming(e.event_date)).length;
  const todayCount = events.filter(e => getEventStatus(e.event_date) === 'today').length;

  if (error) {
    return (
      <Layout>
        <div className="admin-page">
          <div className="page-header"><h1>Events</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load events</p>
            <button className="btn btn-primary" onClick={loadEvents}>Try Again</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>Events</h1>
              <p>Manage church events and activities</p>
            </div>
            <div className="page-header-actions">
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Event
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && <div className="toast-message">{message}</div>}

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="quick-stat-value">{events.length}</div>
            <div className="quick-stat-label">Total</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{upcomingCount}</div>
            <div className="quick-stat-label">Upcoming</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{todayCount}</div>
            <div className="quick-stat-label">Today</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{pastCount}</div>
            <div className="quick-stat-label">Past</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-pills">
            {(['all', 'upcoming', 'past'] as FilterStatus[]).map(status => (
              <button
                key={status}
                className={`filter-pill ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status === 'all' ? 'All' : status === 'upcoming' ? '📅 Upcoming' : '🕐 Past'}
                <span className="filter-count">
                  {status === 'all' ? events.length : status === 'upcoming' ? upcomingCount : pastCount}
                </span>
              </button>
            ))}
          </div>

          <div className="search-wrapper" style={{ maxWidth: '300px' }}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-bar compact"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '100%' }}
            />
          </div>
        </div>

        {/* Events List */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>
              {filterStatus === 'all' ? 'All Events' : filterStatus === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
            </h2>
            <span className="badge-count">{filteredEvents.length} events</span>
          </div>

          {loading ? (
            <div className="skeleton-container">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton-card-small">
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line full" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p>No events found</p>
              {search && <p className="empty-hint">Try a different search term</p>}
            </div>
          ) : (
            <div className="events-timeline">
              {filteredEvents.map((event, index) => {
                const status = getEventStatus(event.event_date);
                const isLast = index === filteredEvents.length - 1;
                return (
                  <div key={event.id} className={`event-timeline-item ${status} ${isLast ? 'last' : ''}`}>
                    {/* Date badge */}
                    <div className="event-date-badge">
                      <div className="event-date-month">{getMonth(event.event_date)}</div>
                      <div className="event-date-day">{getDayNumber(event.event_date)}</div>
                      <div className="event-date-weekday">{getDayOfWeek(event.event_date)}</div>
                    </div>

                    {/* Timeline dot & line */}
                    <div className="event-timeline-connector">
                      <div className="event-timeline-dot" style={{ background: getStatusColor(event.event_date) }} />
                      {!isLast && <div className="event-timeline-line" />}
                    </div>

                    {/* Event card */}
                    <div className="event-timeline-card">
                      <div className="event-card-content">
                        <div className="event-card-header">
                          <h3 className="event-card-title">{event.title}</h3>
                          <span className="event-status-badge" style={{
                            background: getStatusColor(event.event_date) + '15',
                            color: getStatusColor(event.event_date),
                          }}>
                            {getStatusLabel(event.event_date)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="event-card-desc">{event.description}</p>
                        )}
                        <div className="event-card-details">
                          <div className="event-detail">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            {getTime(event.event_date)}
                          </div>
                          {event.location && (
                            <div className="event-detail">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                              </svg>
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className="event-delete-btn"
                        onClick={() => setShowDeleteConfirm(event.id)}
                        title="Delete event"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3>Create New Event</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Sunday Service"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Details about the event..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Location (optional)</label>
                <input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Main Sanctuary"
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Time (optional)</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {saving ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Event?</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This action cannot be undone. The event will be permanently removed.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}