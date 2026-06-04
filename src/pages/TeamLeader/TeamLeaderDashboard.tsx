import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getMyTeam } from '../../services/teamService';
import { getTeamJoinRequests } from '../../services/joinRequestService';
import { getTeamAnnouncements } from '../../services/announcementService';
import { getTeamFeedback } from '../../services/feedbackService';
import './TeamLeaderDashboard.css';

interface Team { id: string; name: string; description?: string; team_members?: { count: number }[]; }

export default function TeamLeaderDashboard() {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name ?? 'Leader';
  const [team, setTeam] = useState<Team | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (user) {
      loadData().catch(() => { setError(true); setLoading(false); });
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    setError(false);
    const { data: teamData } = await getMyTeam(user!.id);
    if (teamData) {
      setTeam(teamData);
      setMemberCount((teamData.team_members as unknown as { count: number }[])?.[0]?.count ?? 0);
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

  const quickActions = [
    {
      to: '/leader/members',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      label: 'Team Members',
      color: '#3b82f6',
    },
    {
      to: '/leader/requests',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
      label: 'Join Requests',
      color: '#f59e0b',
      badge: requestCount > 0 ? requestCount : undefined,
    },
    {
      to: '/leader/announcements',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      label: 'Announcements',
      color: '#10b981',
    },
    {
      to: '/leader/feedback',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      label: 'Feedback',
      color: '#8b5cf6',
    },
  ];

  if (error) {
    return (
      <Layout>
        <div className="leader-dashboard">
          <div className="page-header"><h1>Dashboard</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load dashboard</p>
            <button className="btn btn-primary" onClick={loadData}>Try Again</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="leader-dashboard">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-content">
            <div>
              <h1>Welcome back, {fullName} 👋</h1>
              {team ? (
                <p>You're managing <strong>{team.name}</strong></p>
              ) : (
                <p>You don't have a team assigned yet. Contact an admin.</p>
              )}
            </div>
            <div className="welcome-avatar">
              {fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        </div>

        {loading ? (
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
        ) : team ? (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{memberCount}</div>
                  <div className="stat-label">Team Members</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{requestCount}</div>
                  <div className="stat-label">Pending Requests</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{announcementCount}</div>
                  <div className="stat-label">Announcements</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{feedbackCount}</div>
                  <div className="stat-label">Feedback</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card">
              <div className="section-card-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions-grid">
                {quickActions.map((action) => (
                  <Link key={action.to} to={action.to} className="quick-action-card">
                    <div className="quick-action-icon" style={{ background: action.color + '15', color: action.color }}>
                      {action.icon}
                      {action.badge && (
                        <span className="quick-action-badge">{action.badge}</span>
                      )}
                    </div>
                    <span className="quick-action-label">{action.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="quick-action-arrow">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Team Info */}
            <div className="section-card">
              <div className="section-card-header">
                <h2>Team Information</h2>
              </div>
              <div className="team-info-grid">
                <div className="team-info-item">
                  <span className="team-info-label">Team Name</span>
                  <span className="team-info-value">{team.name}</span>
                </div>
                <div className="team-info-item">
                  <span className="team-info-label">Description</span>
                  <span className="team-info-value">{team.description || 'No description'}</span>
                </div>
                <div className="team-info-item">
                  <span className="team-info-label">Total Members</span>
                  <span className="team-info-value">{memberCount}</span>
                </div>
                <div className="team-info-item">
                  <span className="team-info-label">Status</span>
                  <span className="team-info-value status-active">Active</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h3>No Team Assigned</h3>
            <p>Contact your church administrator to be assigned to a team.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}