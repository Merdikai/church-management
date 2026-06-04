import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../../../services/announcementService';
import { getAllTeams } from '../../../services/teamService';
import { formatDate } from '../../../utils/helpers';
import '../AdminDashboard.css';

interface Announcement {
  id: string;
  title: string;
  body: string;
  scope: string;
  team_id?: string;
  created_at: string;
  profiles?: { full_name: string };
}

interface Team { id: string; name: string; }

type FilterScope = 'all' | 'global' | 'team';

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formScope, setFormScope] = useState<'global' | 'team'>('global');
  const [formTeamId, setFormTeamId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filterScope, setFilterScope] = useState<FilterScope>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData().catch(() => { setError(true); setLoading(false); });
  }, []);

  async function loadData() {
    setLoading(true);
    setError(false);
    const [annRes, teamsRes] = await Promise.all([
      getAnnouncements(),
      getAllTeams(),
    ]);
    if (annRes.data) setAnnouncements(annRes.data);
    if (teamsRes.data) setTeams(teamsRes.data);
    setLoading(false);
  }

  function getTeamName(teamId?: string) {
    if (!teamId) return null;
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  }

  async function handleCreate() {
    if (!formTitle.trim() || !formBody.trim() || !user) return;
    setSaving(true);
    await createAnnouncement(
      formTitle, formBody, formScope, user.id,
      formScope === 'team' ? formTeamId : undefined
    );
    setSaving(false);
    setShowModal(false);
    setFormTitle(''); setFormBody('');
    setFormScope('global'); setFormTeamId('');
    setMessage('✅ Announcement posted successfully');
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  async function handleDelete(id: string) {
    await deleteAnnouncement(id);
    setShowDeleteConfirm(null);
    setMessage('✅ Announcement deleted');
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  const filteredAnnouncements = announcements
    .filter(a => filterScope === 'all' ? true : a.scope === filterScope)
    .filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase())
    );

  const scopeCounts = {
    all: announcements.length,
    global: announcements.filter(a => a.scope === 'global').length,
    team: announcements.filter(a => a.scope === 'team').length,
  };

  if (error) {
    return (
      <Layout>
        <div className="admin-page">
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
      <div className="admin-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>Announcements</h1>
              <p>Manage church-wide and team announcements</p>
            </div>
            <div className="page-header-actions">
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Announcement
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && <div className="toast-message">{message}</div>}

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="quick-stat-value">{scopeCounts.all}</div>
            <div className="quick-stat-label">Total</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{scopeCounts.global}</div>
            <div className="quick-stat-label">Global</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{scopeCounts.team}</div>
            <div className="quick-stat-label">Team</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-pills">
            {(['all', 'global', 'team'] as FilterScope[]).map(scope => (
              <button
                key={scope}
                className={`filter-pill ${filterScope === scope ? 'active' : ''}`}
                onClick={() => setFilterScope(scope)}
              >
                {scope === 'all' ? 'All' : scope === 'global' ? '🌍 Global' : '👥 Team'}
                <span className="filter-count">{scopeCounts[scope]}</span>
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
        <div className="section-card">
          <div className="section-card-header">
            <h2>
              {filterScope === 'all' ? 'All Announcements' : filterScope === 'global' ? 'Global Announcements' : 'Team Announcements'}
            </h2>
            <span className="badge-count">{filteredAnnouncements.length} posts</span>
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
          ) : filteredAnnouncements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p>No announcements found</p>
              {search && <p className="empty-hint">Try a different search term</p>}
            </div>
          ) : (
            <div className="announcements-list">
              {filteredAnnouncements.map((ann) => (
                <div key={ann.id} className={`announcement-card ${ann.scope}`}>
                  <div className="announcement-card-body">
                    <div className="announcement-card-header">
                      <h3 className="announcement-title">{ann.title}</h3>
                      <div className="announcement-badges">
                        <span className={`scope-badge ${ann.scope}`}>
                          {ann.scope === 'global' ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            </svg>
                          )}
                          {ann.scope === 'global' ? 'Global' : getTeamName(ann.team_id) || 'Team'}
                        </span>
                      </div>
                    </div>
                    <p className="announcement-body">{ann.body}</p>
                    <div className="announcement-meta">
                      <div className="announcement-author">
                        <div className="author-avatar-sm">
                          {ann.profiles?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <span>{ann.profiles?.full_name || 'Admin'}</span>
                      </div>
                      <div className="announcement-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {formatDate(ann.created_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    className="announcement-delete-btn"
                    onClick={() => setShowDeleteConfirm(ann.id)}
                    title="Delete announcement"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
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
            <h3>New Announcement</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Sunday Service Update"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Write your announcement message..."
                  rows={5}
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Scope</label>
                  <select value={formScope} onChange={(e) => setFormScope(e.target.value as 'global' | 'team')}>
                    <option value="global">🌍 Global — Visible to everyone</option>
                    <option value="team">👥 Team — Visible to one team</option>
                  </select>
                </div>
                {formScope === 'team' && (
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Select Team</label>
                    <select value={formTeamId} onChange={(e) => setFormTeamId(e.target.value)}>
                      <option value="">Choose a team...</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {saving ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Announcement?</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This action cannot be undone. The announcement will be permanently removed.
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