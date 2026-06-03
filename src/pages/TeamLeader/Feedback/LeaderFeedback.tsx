import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getMyTeam } from '../../../services/teamService';
import { getTeamFeedback } from '../../../services/feedbackService';
import { getInitials, formatDate } from '../../../utils/helpers';
import '../../Admin/AdminDashboard.css';

interface Feedback {
  id: string; message: string; created_at: string;
  profiles: { full_name: string };
}

export default function LeaderFeedback() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const { data: team } = await getMyTeam(user!.id);
    if (team) {
      const { data } = await getTeamFeedback(team.id);
      if (data) setFeedback(data as unknown as Feedback[]);
    }
    setLoading(false);
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Team Feedback</h1>
          <p>Read feedback from church members</p>
        </div>
        <div className="section-card">
          <div className="section-card-header">
            <h2>Feedback ({feedback.length})</h2>
          </div>
          {loading ? <div className="loading-state">Loading...</div>
          : feedback.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💬</div><p>No feedback yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {feedback.map((f) => (
                <div key={f.id} style={{ border: '1px solid #f0f0f0', borderRadius: '10px', padding: '1.25rem', borderLeft: '4px solid #0f3460' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="table-avatar">{getInitials(f.profiles.full_name)}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{f.profiles.full_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{formatDate(f.created_at)}</div>
                    </div>
                  </div>
                  <p style={{ color: '#444', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}