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

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formScope, setFormScope] = useState<'global' | 'team'>('global');
  const [formTeamId, setFormTeamId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [annRes, teamsRes] = await Promise.all([
      getAnnouncements(),
      getAllTeams(),
    ]);
    if (annRes.data) setAnnouncements(annRes.data);
    if (teamsRes.data) setTeams(teamsRes.data);
    setLoading(false);
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
          <h1>Announcements</h1>
          <p>Manage church-wide and team announcements</p>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <h2>All Announcements ({announcements.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + New Announcement
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📢</div>
              <p>No announcements yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map((ann) => (
                <div key={ann.id} style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  borderLeft: `4px solid ${ann.scope === 'global' ? '#0f3460' : '#27ae60'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>
                          {ann.title}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.6rem',
                          borderRadius: '20px',
                          background: ann.scope === 'global' ? '#e8f4fd' : '#eafaf1',
                          color: ann.scope === 'global' ? '#1a6fa8' : '#1e8449',
                          fontWeight: 600,
                        }}>
                          {ann.scope === 'global' ? '🌍 Global' : '👥 Team'}
                        </span>
                      </div>
                      <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {ann.body}
                      </p>
                      <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                        {formatDate(ann.created_at)} · by {ann.profiles?.full_name ?? 'Admin'}
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(ann.id)}
                    >
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
            <h3>New Announcement</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Announcement title" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Write your announcement..."
                  rows={4}
                  style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div className="form-group">
                <label>Scope</label>
                <select value={formScope} onChange={(e) => setFormScope(e.target.value as 'global' | 'team')}>
                  <option value="global">Global — visible to everyone</option>
                  <option value="team">Team — visible to one team</option>
                </select>
              </div>
              {formScope === 'team' && (
                <div className="form-group">
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
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}