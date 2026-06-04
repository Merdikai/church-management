import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getAllMembers, searchMembers } from '../../../services/memberService';
import { getInitials, formatDate } from '../../../utils/helpers';
import '../AdminDashboard.css';

interface Member {
  id: string; full_name: string; phone?: string; gender?: string; created_at: string;
  team_roles?: { role: string }[]; team_members?: { teams: { name: string } }[];
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadMembers().catch(() => { setError(true); setLoading(false); });
  }, []);

  async function loadMembers() {
    setLoading(true);
    setError(false);
    const { data } = await getAllMembers();
    if (data) setMembers(data);
    setLoading(false);
  }

  async function handleSearch(value: string) {
    setSearch(value);
    if (value.trim() === '') { loadMembers(); return; }
    const { data } = await searchMembers(value);
    if (data) setMembers(data);
  }

  if (error) {
    return (
      <Layout>
        <div className="admin-page">
          <div className="page-header"><h1>Members</h1></div>
          <div className="empty-state"><div className="empty-icon">⚠️</div><p>Could not load members. Please refresh.</p></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header"><h1>Members</h1><p>Manage all church members</p></div>
        <div className="section-card">
          <div className="section-card-header"><h2>All Members ({members.length})</h2></div>
          <input className="search-bar" placeholder="🔍 Search by name..." value={search} onChange={(e) => handleSearch(e.target.value)} />
          {loading ? <div className="loading-state">Loading...</div> : members.length === 0 ? <div className="empty-state"><div className="empty-icon">👥</div><p>No members found</p></div> : (
            <table className="members-table">
              <thead><tr><th>Member</th><th>Gender</th><th>Phone</th><th>Role</th><th>Teams</th><th>Joined</th></tr></thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td><div className="member-name-cell"><div className="table-avatar">{getInitials(member.full_name)}</div><span style={{ fontWeight: 600 }}>{member.full_name}</span></div></td>
                    <td style={{ textTransform: 'capitalize', color: '#666' }}>{member.gender ?? '—'}</td>
                    <td style={{ color: '#666' }}>{member.phone ?? '—'}</td>
                    <td><span className={`role-badge ${member.team_roles?.[0]?.role ?? 'member'}`}>{member.team_roles?.[0]?.role ?? 'member'}</span></td>
                    <td style={{ color: '#666', fontSize: '0.85rem' }}>{member.team_members?.map(tm => tm.teams?.name).filter(Boolean).join(', ') || '—'}</td>
                    <td style={{ color: '#888', fontSize: '0.85rem' }}>{formatDate(member.created_at)}</td>
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