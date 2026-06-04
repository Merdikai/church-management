import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getMyTeam } from '../../../services/teamService';
import { getTeamAnnouncements, createAnnouncement, deleteAnnouncement } from '../../../services/announcementService';
import { formatDate } from '../../../utils/helpers';
import './LeaderAnnouncements.css';

interface Announcement {
  id: string; title: string; body: string;
  created_at: string; profiles?: { full_name: string };
}

export default function LeaderAnnouncements() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    setError(false);
    try {
      const { data: team } = await getMyTeam(user!.id);
      if (team) {
        setTeamId(team.id);
        setTeamName(team.name);
        const { data } = await getTeamAnnouncements(team.id);
        if (data) setAnnouncements(data);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!formTitle.trim() || !formBody.trim() || !user) return;
    setSaving(true);
    await createAnnouncement(formTitle, formBody, 'team', user.id, teamId);
    setSaving(false);
    setShowModal(false);
    setFormTitle(''); setFormBody('');
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

  if (error) {
    return (
      <Layout>
        <div className="leader-page">
          <div className="page-header"><h1>Team Announcements</h1></div>
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
      <div className="leader-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>Team Announcements</h1>
              <p>Post and manage announcements for <strong>{teamName || 'your team'}</strong></p>
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

        {/* Announcements List */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Announcements</h2>
            <span className="badge-count">{announcements.length} posts</span>
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
          ) : announcements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p>No announcements yet</p>
              <p className="empty-hint">Post your first announcement to your team</p>
            </div>
          ) : (
            <div className="announcements-list">
              {announcements.map((ann) => (
                <div key={ann.id} className="announcement-card team">
                  <div className="announcement-card-body">
                    <div className="announcement-card-header">
                      <h3 className="announcement-title">{ann.title}</h3>
                      <span className="scope-badge team">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                        {teamName}
                      </span>
                    </div>
                    <p className="announcement-body">{ann.body}</p>
                    <div className="announcement-meta">
                      <div className="announcement-author">
                        <div className="author-avatar-sm">
                          {ann.profiles?.full_name?.charAt(0)?.toUpperCase() || 'L'}
                        </div>
                        <span>{ann.profiles?.full_name || 'Leader'}</span>
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
            <h3>New Team Announcement</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Posting to: <strong>{teamName}</strong>
            </p>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Announcement title"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Write your announcement..."
                  rows={5}
                />
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
              This action cannot be undone.
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