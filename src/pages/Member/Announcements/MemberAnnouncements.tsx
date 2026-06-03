import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getAnnouncements } from '../../../services/announcementService';
import { formatDate } from '../../../utils/helpers';
import '../../Admin/AdminDashboard.css';

interface Announcement { id: string; title: string; body: string; scope: string; created_at: string; profiles?: { full_name: string }; }

export default function MemberAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'global' | 'team'>('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await getAnnouncements();
    if (data) setAnnouncements(data);
    setLoading(false);
  }

  const filtered = filter === 'all' ? announcements : announcements.filter(a => a.scope === filter);

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Announcements</h1>
          <p>Stay up to date with church news</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['all', 'global', 'team'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}>
              {f === 'all' ? 'All' : f === 'global' ? '🌍 Global' : '👥 Team'}
            </button>
          ))}
        </div>

        <div className="section-card">
          {loading ? <div className="loading-state">Loading...</div>
          : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📢</div><p>No announcements</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map((ann) => (
                <div key={ann.id} style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>{ann.title}</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '20px', background: ann.scope === 'global' ? '#e8f4fd' : '#eafaf1', color: ann.scope === 'global' ? '#1a6fa8' : '#1e8449', fontWeight: 600 }}>
                      {ann.scope === 'global' ? '🌍 Global' : '👥 Team'}
                    </span>
                  </div>
                  <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{ann.body}</p>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                    {formatDate(ann.created_at)} {ann.profiles && `· by ${ann.profiles.full_name}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}