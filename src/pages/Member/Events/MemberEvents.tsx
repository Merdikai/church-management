import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getAllEvents } from '../../../services/eventService';
import './MemberEvents.css';

interface Event {
  id: string; title: string; description?: string; location?: string; event_date: string;
}

export default function MemberEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData().catch(() => { setError(true); setLoading(false); });
  }, []);

  async function loadData() {
    setLoading(true);
    setError(false);
    const { data } = await getAllEvents();
    if (data) setEvents(data.sort((a: Event, b: Event) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
    setLoading(false);
  }

  function isUpcoming(dateStr: string) { return new Date(dateStr) >= new Date(); }
  function isToday(dateStr: string) { return new Date(dateStr).toDateString() === new Date().toDateString(); }
  function isThisWeek(dateStr: string) {
    const now = new Date();
    const event = new Date(dateStr);
    const diffDays = Math.ceil((event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }

  const filtered = events
    .filter(e => {
      if (filter === 'upcoming') return isUpcoming(e.event_date);
      if (filter === 'past') return !isUpcoming(e.event_date);
      return true;
    })
    .filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(search.toLowerCase())
    );

  const upcomingCount = events.filter(e => isUpcoming(e.event_date)).length;
  const pastCount = events.filter(e => !isUpcoming(e.event_date)).length;

  function getDayNumber(dateStr: string) { return new Date(dateStr).getDate(); }
  function getMonthShort(dateStr: string) { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }); }
  function getDayName(dateStr: string) { return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }); }
  function getTime(dateStr: string) { return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }

  if (error) {
    return (
      <Layout>
        <div className="member-events-page">
          <div className="page-header"><h1>Events</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load events</p>
            <button className="btn btn-primary" onClick={loadData}>Try Again</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="member-events-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>Events</h1>
              <p>Church events and activities</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="quick-stat-value">{events.length}</div>
            <div className="quick-stat-label">Total</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value upcoming">{upcomingCount}</div>
            <div className="quick-stat-label">Upcoming</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{pastCount}</div>
            <div className="quick-stat-label">Past</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="filters-bar">
          <div className="filter-pills">
            {(['upcoming', 'past', 'all'] as const).map(f => (
              <button
                key={f}
                className={`filter-pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'upcoming' ? '📅 Upcoming' : f === 'past' ? '🕐 Past' : 'All Events'}
                <span className="filter-count">
                  {f === 'all' ? events.length : f === 'upcoming' ? upcomingCount : pastCount}
                </span>
              </button>
            ))}
          </div>
          <div className="search-wrapper" style={{ maxWidth: '280px' }}>
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

        {/* Events Timeline */}
        {loading ? (
          <div className="events-skeleton">
            {[1,2,3].map(i => (
              <div key={i} className="event-skeleton-item">
                <div className="skeleton-circle" />
                <div className="skeleton-lines">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line xshort" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p>No {filter} events found</p>
            {search && <p className="empty-hint">Try a different search</p>}
          </div>
        ) : (
          <div className="events-timeline-list">
            {filtered.map((ev) => {
              const upcoming = isUpcoming(ev.event_date);
              const today = isToday(ev.event_date);
              return (
                <div key={ev.id} className={`event-timeline-card ${!upcoming ? 'past' : ''} ${today ? 'today' : ''}`}>
                  {/* Date Badge */}
                  <div className="event-date-block">
                    <span className="event-date-month">{getMonthShort(ev.event_date)}</span>
                    <span className="event-date-day">{getDayNumber(ev.event_date)}</span>
                    <span className="event-date-weekday">{getDayName(ev.event_date)}</span>
                  </div>

                  {/* Timeline Dot & Line */}
                  <div className="event-timeline-connector">
                    <div className="event-timeline-dot" style={{ background: today ? '#ef4444' : upcoming ? '#10b981' : '#ccc' }} />
                    <div className="event-timeline-line" />
                  </div>

                  {/* Event Card */}
                  <div className="event-info-card">
                    <div className="event-info-header">
                      <h3>{ev.title}</h3>
                      <div className="event-badges">
                        {today && <span className="event-badge today">Today</span>}
                        {!upcoming && !today && <span className="event-badge past">Past</span>}
                        {upcoming && !today && isThisWeek(ev.event_date) && <span className="event-badge this-week">This Week</span>}
                      </div>
                    </div>
                    {ev.description && <p className="event-info-desc">{ev.description}</p>}
                    <div className="event-info-details">
                      <div className="event-info-detail">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {getTime(ev.event_date)}
                      </div>
                      {ev.location && (
                        <div className="event-info-detail">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                          {ev.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}