import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getMyTeam } from '../../../services/teamService';
import { getTeamAnnouncements, createAnnouncement, deleteAnnouncement } from '../../../services/announcementService';
import { formatDate } from '../../../utils/helpers';
import '../../Admin/AdminDashboard.css';

interface Announcement {
  id: string; title: string; body: string;
  created_at: string; profiles?: { full_name: string };
}

export default function LeaderAnnouncements() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const { data: team } = await getMyTeam(user!.id);
    if (team) {
      setTeamId(team.id);
      const { data } = await getTeamAnnouncements(team.id);
      if (data) setAnnouncements(data);
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
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return;
    await deleteAnnouncement(id);
    loadData();
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Team Announcements</h1>
          <p>Post and manage announcements for your team</p>
        </div>
        <div className="section-card">
          <div className="section-card-header">
            <h2>Announcements ({announcements.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New</button>
          </div>
          {loading ? <div className="loading-state">Loading...</div>
          : announcements.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📢</div><p>No announcements yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map((ann) => (
                <div key={ann.id} style={{ border: '1px solid #f0f0f0', borderRadius: '10px', padding: '1.25rem', borderLeft: '4px solid #27ae60' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{ann.title}</div>
                      <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.4rem' }}>{ann.body}</p>
                      <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{formatDate(ann.created_at)}</span>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ann.id)}>Delete</button>
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
            <h3>New Team Announcement</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Title" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea value={formBody} onChange={(e) => setFormBody(e.target.value)} placeholder="Write your message..." rows={4}
                  style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}