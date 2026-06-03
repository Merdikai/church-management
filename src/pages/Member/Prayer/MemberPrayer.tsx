import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getPrayerRequests, getMyPrayerRequests, submitPrayerRequest, deletePrayerRequest } from '../../../services/prayerService';
import { formatDate } from '../../../utils/helpers';
import '../../Admin/AdminDashboard.css';

interface PrayerRequest { id: string; request: string; visibility: string; created_at: string; user_id: string; profiles?: { full_name: string }; }

export default function MemberPrayer() {
  const { user } = useAuth();
  const [publicRequests, setPublicRequests] = useState<PrayerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formText, setFormText] = useState('');
  const [formVisibility, setFormVisibility] = useState<'public' | 'private'>('public');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'community' | 'mine'>('community');

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
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
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this prayer request?')) return;
    await deletePrayerRequest(id);
    loadData();
  }

  const displayed = tab === 'community' ? publicRequests : myRequests;

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Prayer Requests 🙏</h1>
          <p>Share and pray for one another</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['community', 'mine'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}>
                {t === 'community' ? '🌍 Community' : '🙏 My Requests'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Request
          </button>
        </div>

        <div className="section-card">
          {loading ? <div className="loading-state">Loading...</div>
          : displayed.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🙏</div><p>No prayer requests yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {displayed.map((req) => (
                <div key={req.id} style={{ border: '1px solid #f0f0f0', borderRadius: '10px', padding: '1.25rem', borderLeft: '4px solid #9b59b6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      {req.profiles && (
                        <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{req.profiles.full_name}</div>
                      )}
                      <p style={{ color: '#444', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>{req.request}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{formatDate(req.created_at)}</span>
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: req.visibility === 'public' ? '#eafaf1' : '#fdecea', color: req.visibility === 'public' ? '#1e8449' : '#c0392b', fontWeight: 600 }}>
                          {req.visibility === 'public' ? '🌍 Public' : '🔒 Private'}
                        </span>
                      </div>
                    </div>
                    {req.user_id === user?.id && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(req.id)}>Delete</button>
                    )}
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
            <h3>New Prayer Request</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Your Prayer Request</label>
                <textarea value={formText} onChange={(e) => setFormText(e.target.value)}
                  placeholder="Share your prayer request..." rows={5}
                  style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div className="form-group">
                <label>Visibility</label>
                <select value={formVisibility} onChange={(e) => setFormVisibility(e.target.value as 'public' | 'private')}>
                  <option value="public">🌍 Public — visible to the community</option>
                  <option value="private">🔒 Private — only visible to prayer team & elders</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}