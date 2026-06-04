import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { supabase } from '../../../services/supabase';
import '../AdminDashboard.css';

interface TeamStat {
  name: string;
  count: number;
}

interface GenderStat {
  gender: string;
  count: number;
}

interface RoleStat {
  role: string;
  count: number;
}

interface MonthlyStat {
  month: string;
  count: number;
}

export default function AdminReports() {
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [membersPerTeam, setMembersPerTeam] = useState<TeamStat[]>([]);
  const [genderStats, setGenderStats] = useState<GenderStat[]>([]);
  const [roleStats, setRoleStats] = useState<RoleStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadStats().catch(() => { setError(true); setLoading(false); });
  }, []);

  async function loadStats() {
    setLoading(true);
    setError(false);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Total members
    const { count: totalM } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (totalM !== null) setTotalMembers(totalM);

    // New members this month
    const { count: newM } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth);
    if (newM !== null) setNewThisMonth(newM);

    // Teams with member counts
    const { data: teamsData } = await supabase
      .from('teams')
      .select('name, team_members(count)');
    if (teamsData) {
      const formatted: TeamStat[] = teamsData.map((t: any) => ({
        name: t.name,
        count: t.team_members?.[0]?.count ?? 0,
      }));
      setMembersPerTeam(formatted.sort((a, b) => b.count - a.count));
      setTotalTeams(formatted.length);
    }

    // Gender distribution
    const { data: genderData } = await supabase
      .from('profiles')
      .select('gender');
    if (genderData) {
      const maleCount = genderData.filter((p: any) => p.gender === 'male').length;
      const femaleCount = genderData.filter((p: any) => p.gender === 'female').length;
      const unspecified = genderData.length - maleCount - femaleCount;
      setGenderStats([
        { gender: 'Male', count: maleCount },
        { gender: 'Female', count: femaleCount },
        { gender: 'Unspecified', count: unspecified },
      ].filter(g => g.count > 0));
    }

    // Role distribution
    const { data: rolesData } = await supabase
      .from('team_roles')
      .select('role')
      .is('team_id', null);
    if (rolesData) {
      const adminCount = rolesData.filter((r: any) => r.role === 'admin').length;
      const leaderCount = rolesData.filter((r: any) => r.role === 'leader').length;
      const memberCount = rolesData.filter((r: any) => r.role === 'member').length;
      setRoleStats([
        { role: 'Admin', count: adminCount },
        { role: 'Leader', count: leaderCount },
        { role: 'Member', count: memberCount },
      ]);
    }

    // Monthly registrations (last 6 months)
    const monthlyData: MonthlyStat[] = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59).toISOString();
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);
      const monthName = new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleDateString('en-US', { month: 'short' });
      monthlyData.push({ month: monthName, count: count || 0 });
    }
    setMonthlyStats(monthlyData);

    setLoading(false);
  }

  const maxTeamMembers = Math.max(...membersPerTeam.map(t => t.count), 1);
  const maxMonthlyReg = Math.max(...monthlyStats.map(m => m.count), 1);
  const maxGenderCount = Math.max(...genderStats.map(g => g.count), 1);
  const maxRoleCount = Math.max(...roleStats.map(r => r.count), 1);

  if (error) {
    return (
      <Layout>
        <div className="admin-page">
          <div className="page-header"><h1>Reports</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load reports</p>
            <button className="btn btn-primary" onClick={loadStats}>Try Again</button>
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
              <h1>Reports & Analytics</h1>
              <p>Overview of church statistics</p>
            </div>
            <div className="page-header-actions">
              <button className="btn btn-primary" onClick={loadStats}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="skeleton-container">
            <div className="stats-grid">
              {[1,2,3].map(i => (
                <div key={i} className="stat-card skeleton">
                  <div className="skeleton-icon" />
                  <div><div className="skeleton-line short" /><div className="skeleton-line xshort" /></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalMembers}</div>
                  <div className="stat-label">Total Members</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalTeams}</div>
                  <div className="stat-label">Active Teams</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{newThisMonth}</div>
                  <div className="stat-label">New This Month</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper red">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {totalMembers > 0 ? Math.round((newThisMonth / totalMembers) * 100) : 0}%
                  </div>
                  <div className="stat-label">Growth Rate</div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="reports-grid">
              {/* Members per Team */}
              <div className="section-card report-card">
                <div className="section-card-header">
                  <h2>Members per Team</h2>
                  <span className="badge-count">{totalTeams} teams</span>
                </div>
                {membersPerTeam.length === 0 ? (
                  <div className="empty-state"><p>No team data</p></div>
                ) : (
                  <div className="bar-chart">
                    {membersPerTeam.map((team) => (
                      <div key={team.name} className="bar-item">
                        <div className="bar-label">
                          <span className="bar-name">{team.name}</span>
                          <span className="bar-value">{team.count}</span>
                        </div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${(team.count / maxTeamMembers) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Monthly Registrations */}
              <div className="section-card report-card">
                <div className="section-card-header">
                  <h2>Monthly Registrations</h2>
                  <span className="badge-count">Last 6 months</span>
                </div>
                <div className="bar-chart">
                  {monthlyStats.map((month) => (
                    <div key={month.month} className="bar-item">
                      <div className="bar-label">
                        <span className="bar-name">{month.month}</span>
                        <span className="bar-value">{month.count}</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill monthly"
                          style={{ width: `${(month.count / maxMonthlyReg) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="section-card report-card">
                <div className="section-card-header">
                  <h2>Gender Distribution</h2>
                  <span className="badge-count">{totalMembers} members</span>
                </div>
                <div className="bar-chart">
                  {genderStats.map((g) => (
                    <div key={g.gender} className="bar-item">
                      <div className="bar-label">
                        <span className="bar-name">
                          {g.gender === 'Male' ? '♂ Male' : g.gender === 'Female' ? '♀ Female' : '⚬ Unspecified'}
                        </span>
                        <span className="bar-value">{g.count}</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className={`bar-fill gender-${g.gender.toLowerCase()}`}
                          style={{ width: `${(g.count / maxGenderCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Distribution */}
              <div className="section-card report-card">
                <div className="section-card-header">
                  <h2>Role Distribution</h2>
                  <span className="badge-count">{totalMembers} members</span>
                </div>
                <div className="bar-chart">
                  {roleStats.map((r) => (
                    <div key={r.role} className="bar-item">
                      <div className="bar-label">
                        <span className="bar-name">
                          {r.role === 'Admin' ? '🔴 Admin' : r.role === 'Leader' ? '🔵 Leader' : '🟢 Member'}
                        </span>
                        <span className="bar-value">{r.count}</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className={`bar-fill role-${r.role.toLowerCase()}`}
                          style={{ width: `${(r.count / maxRoleCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Members Table */}
            <div className="section-card">
              <div className="section-card-header">
                <h2>Team Breakdown</h2>
              </div>
              <div className="table-responsive">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Members</th>
                      <th>% of Total</th>
                      <th>Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersPerTeam.map((team) => {
                      const percentage = totalMembers > 0 ? Math.round((team.count / totalMembers) * 100) : 0;
                      return (
                        <tr key={team.name}>
                          <td style={{ fontWeight: 600 }}>{team.name}</td>
                          <td>
                            <span className="member-count-badge">{team.count}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{percentage}%</span>
                          </td>
                          <td>
                            <div className="mini-bar-track">
                              <div
                                className="mini-bar-fill"
                                style={{ width: `${(team.count / maxTeamMembers) * 100}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}