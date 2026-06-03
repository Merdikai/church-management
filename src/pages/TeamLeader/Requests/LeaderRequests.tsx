import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getMyTeam } from '../../../services/teamService';
import { getTeamJoinRequests, updateJoinRequest } from '../../../services/joinRequestService';
import { getInitials, formatDate } from '../../../utils/helpers';
import '../../Admin/AdminDashboard.css';

interface JoinRequest {
  id: string; user_id: string; team_id: string; created_at: string;
  profiles: { full_name: string; phone?: string; gender?: string };
}

export default function LeaderRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const { data: team } = await getMyTeam(user!.id);
    if (team) {
      const { data } = await getTeamJoinRequests(team.id);
      if (data) setRequests(data as unknown as JoinRequest[]);
    }
    setLoading(false);
  }

  async function handleAction(req: JoinRequest, status: 'approved' | 'rejected') {
    setProcessing(req.id);
    await updateJoinRequest(req.id, status, req.user_id, req.team_id);
    setProcessing(null);
    loadData();
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Join Requests</h1>
          <p>Approve or reject membership requests</p>
        </div>
        <div className="section-card">
          <div className="section-card-header">
            <h2>Pending Requests ({requests.length})</h2>
          </div>
          {loading ? <div className="loading-state">Loading...</div>
          : requests.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><p>No pending requests</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((req) => (
                <div key={req.id} style={{ border: '1px solid #f0f0f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="member-name-cell">
                    <div className="table-avatar">{getInitials(req.profiles.full_name)}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{req.profiles.full_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        {req.profiles.gender ?? ''} · Requested {formatDate(req.created_at)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={processing === req.id}
                      onClick={() => handleAction(req, 'approved')}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={processing === req.id}
                      onClick={() => handleAction(req, 'rejected')}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}