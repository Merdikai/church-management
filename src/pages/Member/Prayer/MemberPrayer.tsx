import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getPrayerRequests, getMyPrayerRequests, submitPrayerRequest, deletePrayerRequest } from '../../../services/prayerService';
import { formatDate } from '../../../utils/helpers';
import './MemberPrayer.css';

interface PrayerRequest {
  id: string; request: string; visibility: string; created_at: string;
  user_id: string; profiles?: { full_name: string };
}

export default function MemberPrayer() {
  const { user } = useAuth();
  const [publicRequests, setPublicRequests] = useState<PrayerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formText, setFormText] = useState('');
  const [formVisibility, setFormVisibility] = useState<'public' | 'private'>('public');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'community' | 'mine'>('community');

  useEffect(() => {
    if (user) {
      loadData().catch(() => { setError(true); setLoading(false); });
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    setError(false);
    const [pubRes, myRes] = await Promise.all([
      getPrayerRequests(),
      getMyPrayerRequests(user!.id),
    ]);
    if (pubRes.data) setPublicRequests(pubRes.data);
    if (myRes.data) setMyRequests(myRes.data);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!formText.trim() || !user) return;
    setSaving(true);
    await submitPrayerRequest(user.id, formText, formVisibility);
    setSaving(false);
    setShowModal(false);
    setFormText('');
    setMessage('🙏 Prayer request submitted');
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  async function handleDelete(id: string) {
    await deletePrayerRequest(id);
    setShowDeleteConfirm(null);
    setMessage('✅ Prayer request removed');
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

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

  const displayed = tab === 'community' ? publicRequests : myRequests;

  if (error) {
    return (
      <Layout>
        <div className="member-prayer-page">
          <div className="page-header"><h1>Prayer Requests</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load prayer requests</p>
            <button className="btn btn-primary" onClick={loadData}>Try Again</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="member-prayer-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>Prayer Requests 🙏</h1>
              <p>Share and pray for one another</p>
            </div>
            <button className="btn btn-prayer" onClick={() => setShowModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Request
            </button>
          </div>
        </div>

        {/* Message */}
        {message && <div className="toast-message">{message}</div>}

        {/* Tabs */}
        <div className="prayer-tabs">
          <button
            className={`prayer-tab ${tab === 'community' ? 'active' : ''}`}
            onClick={() => setTab('community')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Community
            <span className="tab-count">{publicRequests.length}</span>
          </button>
          <button
            className={`prayer-tab ${tab === 'mine' ? 'active' : ''}`}
            onClick={() => setTab('mine')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            My Requests
            <span className="tab-count">{myRequests.length}</span>
          </button>
        </div>

        {/* Prayer Cards */}
        {loading ? (
          <div className="prayer-skeleton">
            {[1,2,3].map(i => (
              <div key={i} className="prayer-skeleton-card">
                <div className="skeleton-circle" />
                <div className="skeleton-lines">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v3.5c0 1.5 1 3 3 3s3-1.5 3-3V5a3 3 0 0 0-3-3z" /><path d="M8 10c-1.5 2-2 5-2 8h12c0-3-.5-6-2-8" />
              </svg>
            </div>
            <h3>{tab === 'community' ? 'No community prayers yet' : 'You haven\'t submitted any prayers'}</h3>
            <p>{tab === 'community' ? 'Be the first to share a prayer request.' : 'Share your prayer request with the community.'}</p>
            <button className="btn btn-prayer" onClick={() => setShowModal(true)}>Share a Prayer</button>
          </div>
        ) : (
          <div className="prayer-cards">
            {displayed.map((req) => (
              <div key={req.id} className={`prayer-card ${req.visibility}`}>
                {/* Prayer Icon */}
                <div className="prayer-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v3.5c0 1.5 1 3 3 3s3-1.5 3-3V5a3 3 0 0 0-3-3z" /><path d="M8 10c-1.5 2-2 5-2 8h12c0-3-.5-6-2-8" />
                  </svg>
                </div>

                {/* Content */}
                <div className="prayer-card-content">
                  <div className="prayer-card-header">
                    {req.profiles && (
                      <div className="prayer-author">
                        <div className="prayer-author-avatar">
                          {req.profiles.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="prayer-author-name">{req.profiles.full_name}</span>
                          <span className="prayer-time">{getTimeAgo(req.created_at)}</span>
                        </div>
                      </div>
                    )}
                    <span className={`visibility-badge ${req.visibility}`}>
                      {req.visibility === 'public' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}
                      {req.visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <p className="prayer-text">{req.request}</p>
                </div>

                {/* Delete button */}
                {req.user_id === user?.id && (
                  <button
                    className="prayer-delete-btn"
                    onClick={() => setShowDeleteConfirm(req.id)}
                    title="Delete prayer request"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3>New Prayer Request</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Your Prayer Request</label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Share your prayer request with the community..."
                  rows={5}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Visibility</label>
                <select value={formVisibility} onChange={(e) => setFormVisibility(e.target.value as 'public' | 'private')}>
                  <option value="public">🌍 Public — Visible to everyone</option>
                  <option value="private">🔒 Private — Only visible to prayer team</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-prayer" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Prayer Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Prayer Request?</h3>
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