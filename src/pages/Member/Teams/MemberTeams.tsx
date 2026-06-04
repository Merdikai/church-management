import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getAllTeams } from '../../../services/teamService';
import { submitJoinRequest } from '../../../services/joinRequestService';
import { supabase } from '../../../services/supabase';
import './MemberTeams.css';

interface Team { id: string; name: string; description?: string; team_members?: { count: number }[]; }

export default function MemberTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<Team | null>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined' | 'available'>('all');

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const [teamsRes, memberRes, requestRes] = await Promise.all([
      getAllTeams(),
      supabase.from('team_members').select('team_id').eq('user_id', user!.id),
      supabase.from('join_requests').select('team_id').eq('user_id', user!.id).eq('status', 'pending'),
    ]);
    if (teamsRes.data) setTeams(teamsRes.data);
    if (memberRes.data) setMyTeamIds(memberRes.data.map((r: { team_id: string }) => r.team_id));
    if (requestRes.data) setPendingIds(requestRes.data.map((r: { team_id: string }) => r.team_id));
    setLoading(false);
  }

  async function handleJoin(teamId: string) {
    if (!user) return;
    setJoining(teamId);
    await submitJoinRequest(user.id, teamId);
    setJoining(null);
    setMessage('✅ Request sent successfully!');
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  async function handleLeave(teamId: string) {
    if (!user) return;
    setLeaving(teamId);
    await supabase.from('team_members').delete().eq('user_id', user.id).eq('team_id', teamId);
    setLeaving(null);
    setShowLeaveConfirm(null);
    setMessage('✅ You have left the team');
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  function getTeamStatus(teamId: string) {
    if (myTeamIds.includes(teamId)) return 'member';
    if (pendingIds.includes(teamId)) return 'pending';
    return 'none';
  }

  const filteredTeams = teams
    .filter(t => {
      if (filter === 'joined') return myTeamIds.includes(t.id);
      if (filter === 'available') return !myTeamIds.includes(t.id);
      return true;
    })
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const joinedCount = myTeamIds.length;
  const pendingCount = pendingIds.length;

  return (
    <Layout>
      <div className="member-teams-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>Teams & Ministries</h1>
              <p>Browse and join church teams</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && <div className="toast-message">{message}</div>}

        {/* Stats */}
        <div className="team-stats-row">
          <div className="team-stat-pill">
            <span className="team-stat-number">{teams.length}</span>
            <span className="team-stat-text">Total Teams</span>
          </div>
          <div className="team-stat-pill joined">
            <span className="team-stat-number">{joinedCount}</span>
            <span className="team-stat-text">Joined</span>
          </div>
          <div className="team-stat-pill pending">
            <span className="team-stat-number">{pendingCount}</span>
            <span className="team-stat-text">Pending</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-pills">
            {(['all', 'joined', 'available'] as const).map(f => (
              <button
                key={f}
                className={`filter-pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All Teams' : f === 'joined' ? 'My Teams' : 'Available'}
              </button>
            ))}
          </div>
          <div className="search-wrapper" style={{ maxWidth: '280px' }}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-bar compact"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '100%' }}
            />
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="teams-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="team-card-skeleton">
                <div className="skeleton-line medium" />
                <div className="skeleton-line full" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <p>No teams found</p>
            {search && <p className="empty-hint">Try a different search</p>}
          </div>
        ) : (
          <div className="teams-grid">
            {filteredTeams.map((team) => {
              const status = getTeamStatus(team.id);
              const count = (team.team_members as unknown as { count: number }[])?.[0]?.count ?? 0;
              return (
                <div key={team.id} className={`team-card-member ${status === 'member' ? 'joined' : ''} ${status === 'pending' ? 'pending-card' : ''}`}>
                  {/* Icon */}
                  <div className="team-card-icon-wrap">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>

                  {/* Status Badge */}
                  <div className="team-card-status">
                    {status === 'member' && <span className="status-badge member">✓ Member</span>}
                    {status === 'pending' && <span className="status-badge pending">⏳ Pending</span>}
                  </div>

                  {/* Info */}
                  <h3 className="team-card-title">{team.name}</h3>
                  <p className="team-card-desc">{team.description || 'No description available'}</p>

                  {/* Member count */}
                  <div className="team-card-members">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                    <span>{count} member{count !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Action */}
                  <div className="team-card-action">
                    {status === 'none' && (
                      <button
                        className="btn btn-join"
                        onClick={() => handleJoin(team.id)}
                        disabled={joining === team.id}
                      >
                        {joining === team.id ? (
                          <><span className="spinner-small" /> Requesting...</>
                        ) : (
                          'Request to Join'
                        )}
                      </button>
                    )}
                    {status === 'member' && (
                      <button
                        className="btn btn-leave"
                        onClick={() => setShowLeaveConfirm(team)}
                      >
                        Leave Team
                      </button>
                    )}
                    {status === 'pending' && (
                      <button className="btn btn-pending" disabled>
                        Request Sent
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Confirmation */}
      {showLeaveConfirm && (
        <div className="modal-overlay" onClick={() => setShowLeaveConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h3>Leave Team?</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to leave <strong>{showLeaveConfirm.name}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowLeaveConfirm(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => handleLeave(showLeaveConfirm.id)}
                disabled={leaving === showLeaveConfirm.id}
              >
                {leaving === showLeaveConfirm.id ? 'Leaving...' : 'Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}