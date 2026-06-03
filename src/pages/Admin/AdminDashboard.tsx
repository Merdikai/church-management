import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getAllMembers, searchMembers } from '../../services/memberService';
import { getAllTeams } from '../../services/teamService';
import { getInitials, formatDate } from '../../utils/helpers';
import './AdminDashboard.css';

interface Member {
  id: string;
  full_name: string;
  email?: string;
  gender?: string;
  created_at: string;
  team_roles?: { role: string }[];
  team_members?: { teams: { name: string } }[];
}

interface Team {
  id: string;
  name: string;
  team_members?: { count: number }[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name ?? 'Admin';

  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingMembers(true);
    const [membersRes, teamsRes] = await Promise.all([
      getAllMembers(),
      getAllTeams(),
    ]);
    if (membersRes.data) setMembers(membersRes.data);
    if (teamsRes.data) setTeams(teamsRes.data);
    setLoadingMembers(false);
  }

  async function handleSearch(value: string) {
    setSearch(value);
    if (value.trim() === '') {
      loadData();
      return;
    }
    const { data } = await searchMembers(value);
    if (data) setMembers(data);
  }

  function getMemberRole(member: Member) {
    return member.team_roles?.[0]?.role ?? 'member';
  }

  function getMemberTeams(member: Member) {
    return member.team_members
      ?.map((tm) => tm.teams?.name)
      .filter(Boolean)
      .join(', ') || '—';
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Welcome back, {fullName} 👋</h1>
          <p>Here's what's happening in your church today.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div>
              <div className="stat-value">{members.length}</div>
              <div className="stat-label">Total Members</div>
            </div>
          </div>
          <div className="stat-card green">
            <span className="stat-icon">⛪</span>
            <div>
              <div className="stat-value">{teams.length}</div>
              <div className="stat-label">Active Teams</div>
            </div>
          </div>
          <div className="stat-card orange">
            <span className="stat-icon">👑</span>
            <div>
              <div className="stat-value">
                {members.filter(m => getMemberRole(m) === 'leader').length}
              </div>
              <div className="stat-label">Team Leaders</div>
            </div>
          </div>
          <div className="stat-card red">
            <span className="stat-icon">🆕</span>
            <div>
              <div className="stat-value">
                {members.filter(m => {
                  const d = new Date(m.created_at);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <div className="stat-label">New This Month</div>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>All Members</h2>
          </div>

          <input
            className="search-bar"
            placeholder="🔍 Search members by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {loadingMembers ? (
            <div className="loading-state">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>No members found</p>
            </div>
          ) : (
            <table className="members-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Teams</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-name-cell">
                        <div className="table-avatar">
                          {getInitials(member.full_name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{member.full_name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${getMemberRole(member)}`}>
                        {getMemberRole(member)}
                      </span>
                    </td>
                    <td style={{ color: '#666', fontSize: '0.85rem' }}>
                      {getMemberTeams(member)}
                    </td>
                    <td style={{ color: '#888', fontSize: '0.85rem' }}>
                      {formatDate(member.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Teams Overview */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Teams Overview</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            {teams.map((team) => (
              <div key={team.id} style={{
                background: '#f8f9fa',
                borderRadius: '10px',
                padding: '1rem',
                borderLeft: '3px solid #0f3460'
              }}>
                <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '0.3rem' }}>
                  {team.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                  {(team.team_members as unknown as { count: number }[])?.[0]?.count ?? 0} members
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}