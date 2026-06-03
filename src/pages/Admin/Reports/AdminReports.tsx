import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { supabase } from '../../../services/supabase';
import '../AdminDashboard.css';

interface TeamStat {
  name: string;
  count: number;
}

export default function AdminReports() {
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [membersPerTeam, setMembersPerTeam] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
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
      setMembersPerTeam(formatted);
      setTotalTeams(formatted.length);
    }

    setLoading(false);
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Reports</h1>
          <p>Overview of church statistics</p>
        </div>

        {loading ? (
          <div className="loading-state">Loading reports...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <div>
                  <div className="stat-value">{totalMembers}</div>
                  <div className="stat-label">Total Members</div>
                </div>
              </div>
              <div className="stat-card green">
                <span className="stat-icon">⛪</span>
                <div>
                  <div className="stat-value">{totalTeams}</div>
                  <div className="stat-label">Active Teams</div>
                </div>
              </div>
              <div className="stat-card orange">
                <span className="stat-icon">🆕</span>
                <div>
                  <div className="stat-value">{newThisMonth}</div>
                  <div className="stat-label">New This Month</div>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <h2>Members per Team</h2>
              </div>
              {membersPerTeam.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <p>No team data available</p>
                </div>
              ) : (
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Team Name</th>
                      <th>Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersPerTeam.map((team) => (
                      <tr key={team.name}>
                        <td style={{ fontWeight: 600 }}>{team.name}</td>
                        <td>{team.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}