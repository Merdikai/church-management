import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getMyTeam } from '../../services/teamService';
import { getTeamJoinRequests } from '../../services/joinRequestService';
import { getTeamAnnouncements } from '../../services/announcementService';
import { getTeamFeedback } from '../../services/feedbackService';
import '../Admin/AdminDashboard.css';

interface Team { id: string; name: string; description?: string; team_members?: {count:number}[]; }

export default function TeamLeaderDashboard() {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name ?? 'Leader';
  const [team, setTeam] = useState<Team | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const { data: teamData } = await getMyTeam(user!.id);
    if (teamData) {
      setTeam(teamData);
      const [reqRes, annRes, feedRes] = await Promise.all([
        getTeamJoinRequests(teamData.id),
        getTeamAnnouncements(teamData.id),
        getTeamFeedback(teamData.id),
      ]);
      setRequestCount(reqRes.data?.length ?? 0);
      setAnnouncementCount(annRes.data?.length ?? 0);
      setFeedbackCount(feedRes.data?.length ?? 0);
    }
    setLoading(false);
  }

  const memberCount = (team?.team_members as unknown as {count:number}[])?.[0]?.count ?? 0;

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Welcome back, {fullName} 👋</h1>
          <p>{team ? `Managing: ${team.name}` : 'No team assigned yet'}</p>
        </div>

        {loading ? <div className="loading-state">Loading...</div> : (
          <div className="stats-grid">
            {[
              { label: 'Team Members', value: memberCount, icon: '👥', color: '' },
              { label: 'Pending Requests', value: requestCount, icon: '📋', color: 'orange' },
              { label: 'Announcements', value: announcementCount, icon: '📢', color: 'green' },
              { label: 'Feedback', value: feedbackCount, icon: '💬', color: 'red' },
            ].map((card) => (
              <div key={card.label} className={`stat-card ${card.color}`}>
                <span className="stat-icon">{card.icon}</span>
                <div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}