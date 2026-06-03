import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getMyTeam, getTeamMembers, removeMemberFromTeam } from '../../../services/teamService';
import { getInitials, formatDate } from '../../../utils/helpers';
import '../../Admin/AdminDashboard.css';

interface Member {
  user_id: string;
  joined_at: string;
  profiles: { id: string; full_name: string; phone?: string; gender?: string; created_at: string };
}

export default function LeaderMembers() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const { data: team } = await getMyTeam(user!.id);
    if (team) {
      setTeamId(team.id);
      const { data } = await getTeamMembers(team.id);
      if (data) setMembers(data as unknown as Member[]);
    }
    setLoading(false);
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remove this member from the team?')) return;
    await removeMemberFromTeam(userId, teamId);
    loadData();
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Team Members</h1>
          <p>View and manage your team members</p>
        </div>
        <div className="section-card">
          <div className="section-card-header">
            <h2>Members ({members.length})</h2>
          </div>
          {loading ? <div className="loading-state">Loading...</div>
          : members.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><p>No members yet</p></div>
          ) : (
            <table className="members-table">
              <thead>
                <tr><th>Member</th><th>Gender</th><th>Phone</th><th>Joined</th><th>Action</th></tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.user_id}>
                    <td>
                      <div className="member-name-cell">
                        <div className="table-avatar">{getInitials(m.profiles.full_name)}</div>
                        <span style={{ fontWeight: 600 }}>{m.profiles.full_name}</span>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: '#666' }}>{m.profiles.gender ?? '—'}</td>
                    <td style={{ color: '#666' }}>{m.profiles.phone ?? '—'}</td>
                    <td style={{ color: '#888', fontSize: '0.85rem' }}>{formatDate(m.joined_at)}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleRemove(m.user_id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}