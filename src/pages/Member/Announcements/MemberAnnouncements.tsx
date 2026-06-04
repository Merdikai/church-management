import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getAnnouncements } from '../../../services/announcementService';
import { formatDate } from '../../../utils/helpers';
import './MemberAnnouncements.css';

interface Announcement {
  id: string; title: string; body: string; scope: string; created_at: string;
  profiles?: { full_name: string };
}

export default function MemberAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'global' | 'team'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData().catch(() => { setError(true); setLoading(false); });
  }, []);

  async function loadData() {
    setLoading(true);
    setError(false);
    const { data } = await getAnnouncements();
    if (data) setAnnouncements(data);
    setLoading(false);
  }

  const filtered = announcements
    .filter(a => filter === 'all' ? true : a.scope === filter)
    .filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase())
    );

  const scopeCounts = {
    all: announcements.length,
    global: announcements.filter(a => a.scope === 'global').length,
    team: announcements.filter(a => a.scope === 'team').length,
  };

  function getTimeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateStr);
  }

  if (error) {
    return (
      <Layout>
        <div className="member-announcements-page">
          <div className="page-header"><h1>Announcements</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load announcements</p>
            <button className="btn btn-primary" onClick={loadData}>Try Again</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="member-announcements-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>Announcements</h1>
              <p>Stay up to date with church news</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="filters-bar">
          <div className="filter-pills">
            {(['all', 'global', 'team'] as const).map(f => (
              <button
                key={f}
                className={`filter-pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'global' ? '🌍 Global' : '👥 Team'}
                <span className="filter-count">{scopeCounts[f]}</span>
              </button>
            ))}
          </div>
          <div className="search-wrapper" style={{ maxWidth: '300px' }}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-bar compact"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '100%' }}
            />
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="announcements-skeleton">
            {[1,2,3].map(i => (
              <div key={i} className="announcement-skeleton-card">
                <div className="skeleton-line medium" />
                <div className="skeleton-line full" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p>No announcements found</p>
            {search && <p className="empty-hint">Try a different search</p>}
          </div>
        ) : (
          <div className="announcements-feed">
            {filtered.map((ann) => (
              <div key={ann.id} className={`announcement-feed-card ${ann.scope}`}>
                {/* Date indicator */}
                <div className="feed-date-badge">
                  <span className="feed-date-day">{new Date(ann.created_at).getDate()}</span>
                  <span className="feed-date-month">
                    {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>

                {/* Content */}
                <div className="feed-content">
                  <div className="feed-header">
                    <h3 className="feed-title">{ann.title}</h3>
                    <span className={`feed-scope-badge ${ann.scope}`}>
                      {ann.scope === 'global' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                      )}
                      {ann.scope === 'global' ? 'Global' : 'Team'}
                    </span>
                  </div>
                  <p className="feed-body">{ann.body}</p>
                  <div className="feed-footer">
                    <div className="feed-author">
                      <div className="feed-author-avatar">
                        {ann.profiles?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <span>{ann.profiles?.full_name || 'Admin'}</span>
                    </div>
                    <span className="feed-time">{getTimeAgo(ann.created_at)}</span>
                  </div>
                </div>

                {/* Top accent line */}
                <div className={`feed-accent ${ann.scope}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}