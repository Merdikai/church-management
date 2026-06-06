import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getAllMembers } from '../../services/memberService';
import { getAllTeams } from '../../services/teamService';
import { getInitials, formatDate } from '../../utils/helpers';
import './AdminDashboard.css';


interface Member {
  id: string; full_name: string; email?: string; gender?: string; created_at: string;
  team_roles?: { role: string }[]; team_members?: { teams: { name: string } }[];
}

interface Team {
  id: string; name: string; team_members?: { count: number }[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const fullName = user?.user_metadata?.full_name ?? 'Admin';
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members'>('overview');

  useEffect(() => {
    loadData().catch(() => {
      setError(true);
      setLoading(false);
    });
  }, []);

  async function loadData() {
    setLoading(true);
    setError(false);
    const [membersRes, teamsRes] = await Promise.all([
      getAllMembers(),
      getAllTeams(),
    ]);
    if (membersRes.data) setMembers(membersRes.data);
    if (teamsRes.data) setTeams(teamsRes.data);
    setLoading(false);
  }

  async function handleSearch(value: string) {
    setSearch(value);
    if (value.trim() === '') { loadData(); return; }
    const { data } = await import('../../services/memberService').then(m => m.searchMembers(value));
    if (data) setMembers(data);
  }

  function getMemberRole(member: Member) {
    return member.team_roles?.[0]?.role ?? 'member';
  }

  const newThisMonth = members.filter(m => {
    const d = new Date(m.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const leaderCount = members.filter(m => getMemberRole(m) === 'leader').length;

  if (error) {
    return (
      <Layout>
        <div className="admin-page">
          <div className="page-header">
            <h1>{t('welcomeBack')}, {fullName} 👋</h1>
          </div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load dashboard data</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              {t('refresh')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>{t('welcomeBack')}, {fullName} 👋</h1>
              <p>Here's what's happening in your church today.</p>
            </div>
            <div className="page-header-actions">
              <button className="btn btn-primary" onClick={loadData}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {t('refresh')}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {t('overview')}
          </button>
          <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {t('members')}
          </button>
        </div>

        {loading ? (
          /* Skeleton Loading */
          <div className="skeleton-container">
            <div className="stats-grid">
              {[1,2,3,4].map(i => (
                <div key={i} className="stat-card skeleton">
                  <div className="skeleton-icon" />
                  <div>
                    <div className="skeleton-line short" />
                    <div className="skeleton-line xshort" />
                  </div>
                </div>
              ))}
            </div>
            <div className="section-card skeleton-card">
              <div className="skeleton-line medium" />
              <div className="skeleton-line full" />
              <div className="skeleton-line full" />
              <div className="skeleton-line full" />
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{members.length}</div>
                  <div className="stat-label">{t('totalMembers')}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{teams.length}</div>
                  <div className="stat-label">{t('activeTeams')}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" /><path d="M12 12c-4 0-7 2-7 5h14c0-3-3-5-7-5z" /><polygon points="12 2 15 6 13 7 11 7 9 6" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{leaderCount}</div>
                  <div className="stat-label">{t('teamLeaders')}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper red">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{newThisMonth}</div>
                  <div className="stat-label">{t('newThisMonth')}</div>
                </div>
              </div>
            </div>

            {/* Teams Overview */}
            <div className="section-card">
              <div className="section-card-header">
                <h2>{t('teams')} Overview</h2>
                <span className="badge-count">{teams.length} {t('teams').toLowerCase()}</span>
              </div>
              <div className="teams-grid">
                {teams.map((team) => {
                  const count = (team.team_members as unknown as {count:number}[])?.[0]?.count ?? 0;
                  return (
                    <div key={team.id} className="team-chip">
                      <div className="team-chip-icon">⛪</div>
                      <div className="team-chip-info">
                        <div className="team-chip-name">{team.name}</div>
                        <div className="team-chip-count">{count} member{count !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Members Tab */
          <div className="section-card">
            <div className="section-card-header">
              <h2>{t('members')}</h2>
              <span className="badge-count">{members.length} total</span>
            </div>
            <div className="search-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input className="search-bar" placeholder={`${t('search')} ${t('members').toLowerCase()}...`} value={search} onChange={(e) => handleSearch(e.target.value)} />
            </div>
            <div className="table-responsive">
              <table className="members-table">
                <thead>
                  <tr><th>{t('members')}</th><th>{t('roles')}</th><th>{t('teams')}</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr><td colSpan={4}><div className="empty-state"><p>{t('noData')}</p></div></td></tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div className="member-name-cell">
                            <div className="table-avatar">{getInitials(member.full_name)}</div>
                            <div>
                              <div className="member-name">{member.full_name}</div>
                              <div className="member-email">{member.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`role-badge ${getMemberRole(member)}`}>{getMemberRole(member)}</span></td>
                        <td className="teams-cell">{member.team_members?.map(tm => tm.teams?.name).filter(Boolean).join(', ') || '—'}</td>
                        <td className="date-cell">{formatDate(member.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}