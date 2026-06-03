import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getAllTeams } from '../../../services/teamService';
import { submitJoinRequest } from '../../../services/joinRequestService';
import { supabase } from '../../../services/supabase';
import '../../Admin/AdminDashboard.css';

interface Team { id: string; name: string; description?: string; team_members?: {count:number}[]; }

export default function MemberTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const [teamsRes, memberRes, requestRes] = await Promise.all([
      getAllTeams(),
      supabase.from('team_members').select('team_id').eq('user_id', user!.id),
      supabase.from('join_requests').select('team_id').eq('user_id', user!.id).eq('status', 'pending'),
    ]);
    if (teamsRes.data) setTeams(teamsRes.data);
    if (memberRes.data) setMyTeamIds(memberRes.data.map((r: {team_id: string}) => r.team_id));
    if (requestRes.data) setPendingIds(requestRes.data.map((r: {team_id: string}) => r.team_id));
    setLoading(false);
  }

  async function handleJoin(teamId: string) {
    if (!user) return;
    setJoining(teamId);
    await submitJoinRequest(user.id, teamId);
    setJoining(null);
    loadData();
  }

  async function handleLeave(teamId: string) {
    if (!confirm('Leave this team?') || !user) return;
    await supabase.from('team_members').delete().eq('user_id', user.id).eq('team_id', teamId);
    loadData();
  }

  function getTeamStatus(teamId: string) {
    if (myTeamIds.includes(teamId)) return 'member';
    if (pendingIds.includes(teamId)) return 'pending';
    return 'none';
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Teams & Ministries</h1>
          <p>Browse and join church teams</p>
        </div>
        {loading ? <div className="loading-state">Loading...</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {teams.map((team) => {
              const status = getTeamStatus(team.id);
              const count = (team.team_members as unknown as {count:number}[])?.[0]?.count ?? 0;
              return (
                <div key={team.id} className="section-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e' }}>{team.name}</h3>
                    {status === 'member' && (
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: '#eafaf1', color: '#1e8449', fontWeight: 600 }}>
                        ✓ Member
                      </span>
                    )}
                    {status === 'pending' && (
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: '#fff3cd', color: '#856404', fontWeight: 600 }}>
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    {team.description ?? 'No description available'}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                    👥 {count} members
                  </div>
                  {status === 'none' && (
                    <button className="btn btn-primary" style={{ width: '100%' }}
                      onClick={() => handleJoin(team.id)} disabled={joining === team.id}>
                      {joining === team.id ? 'Requesting...' : 'Request to Join'}
                    </button>
                  )}
                  {status === 'member' && (
                    <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => handleLeave(team.id)}>
                      Leave Team
                    </button>
                  )}
                  {status === 'pending' && (
                    <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                      Request Sent
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}