import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getAllMembers } from '../../../services/memberService';
import { getAllTeams } from '../../../services/teamService';
import { assignRole, assignTeamLeader, removeTeamLeader } from '../../../services/memberService';
import { getInitials } from '../../../utils/helpers';
import '../AdminDashboard.css';

interface Member {
  id: string;
  full_name: string;
  email?: string;
  team_roles?: { role: string }[];
  team_members?: { teams: { name: string; id: string } }[];
}

interface Team {
  id: string;
  name: string;
  leader_id?: string;
}

type FilterRole = 'all' | 'admin' | 'leader' | 'member';

export default function AdminRoles() {
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'leader' | 'member'>('member');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [activeTab, setActiveTab] = useState<'members' | 'teams'>('members');

  useEffect(() => {
    loadData().catch(() => { setError(true); setLoading(false); });
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

  function getMemberRole(member: Member) {
    return member.team_roles?.[0]?.role ?? 'member';
  }

  function getLeaderName(team: Team) {
    const leader = members.find(m => m.id === team.leader_id);
    return leader?.full_name ?? 'None';
  }

  function getLeaderEmail(team: Team) {
    const leader = members.find(m => m.id === team.leader_id);
    return leader?.email ?? '';
  }

  function openRoleModal(member: Member) {
    setSelectedMember(member);
    setSelectedRole(getMemberRole(member) as 'admin' | 'leader' | 'member');
    setShowRoleModal(true);
  }

  function openLeaderModal(member: Member) {
    setSelectedMember(member);
    setSelectedTeamId('');
    setShowLeaderModal(true);
  }

  async function handleAssignRole() {
    if (!selectedMember) return;
    setSaving(true);
    await assignRole(selectedMember.id, selectedRole);
    setSaving(false);
    setShowRoleModal(false);
    setMessage(`✅ Role updated to "${selectedRole}" for ${selectedMember.full_name}`);
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  async function handleAssignLeader() {
    if (!selectedMember || !selectedTeamId) return;
    setSaving(true);
    const teamName = teams.find(t => t.id === selectedTeamId)?.name || 'team';
    await assignTeamLeader(selectedMember.id, selectedTeamId);
    setSaving(false);
    setShowLeaderModal(false);
    setMessage(`✅ ${selectedMember.full_name} is now leader of ${teamName}`);
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  async function handleRemoveLeader(teamId: string) {
    setSaving(true);
    const team = teams.find(t => t.id === teamId);
    await removeTeamLeader(teamId);
    setSaving(false);
    setShowRemoveConfirm(null);
    setMessage(`✅ Leader removed from ${team?.name || 'team'}`);
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  const filteredMembers = members
    .filter(m => filterRole === 'all' ? true : getMemberRole(m) === filterRole)
    .filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()));

  const roleCounts = {
    all: members.length,
    admin: members.filter(m => getMemberRole(m) === 'admin').length,
    leader: members.filter(m => getMemberRole(m) === 'leader').length,
    member: members.filter(m => getMemberRole(m) === 'member').length,
  };

  if (error) {
    return (
      <Layout>
        <div className="admin-page">
          <div className="page-header"><h1>Role Management</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load data</p>
            <button className="btn btn-primary" onClick={loadData}>Try Again</button>
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
              <h1>Role Management</h1>
              <p>Assign roles and manage team leaders</p>
            </div>
            <div className="page-header-actions">
              <button className="btn btn-primary" onClick={loadData}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && <div className="toast-message">{message}</div>}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
            Members & Roles
          </button>
          <button className={`tab ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Team Leaders
          </button>
        </div>

        {loading ? (
          <div className="skeleton-container">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="skeleton-row">
                <div className="skeleton-avatar" />
                <div className="skeleton-lines">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line xshort" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'members' ? (
          <>
            {/* Members & Roles */}
            <div className="quick-stats">
              {(['all', 'admin', 'leader', 'member'] as FilterRole[]).map(role => (
                <div
                  key={role}
                  className={`quick-stat clickable ${filterRole === role ? 'active' : ''}`}
                  onClick={() => setFilterRole(role)}
                >
                  <div className="quick-stat-value">{roleCounts[role]}</div>
                  <div className="quick-stat-label">{role === 'all' ? 'Total' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="filters-bar">
              <div className="search-wrapper" style={{ flex: 1, maxWidth: '400px' }}>
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="search-bar compact"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ maxWidth: '100%' }}
                />
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <h2>{filterRole === 'all' ? 'All Members' : filterRole.charAt(0).toUpperCase() + filterRole.slice(1) + 's'}</h2>
                <span className="badge-count">{filteredMembers.length} found</span>
              </div>

              {filteredMembers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <p>No members found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="members-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Current Role</th>
                        <th>Teams</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => (
                        <tr key={member.id}>
                          <td>
                            <div className="member-name-cell">
                              <div className="table-avatar">{getInitials(member.full_name)}</div>
                              <div>
                                <div className="member-name">{member.full_name}</div>
                                <div className="member-email">{member.email || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`role-badge ${getMemberRole(member)}`}>
                              {getMemberRole(member)}
                            </span>
                          </td>
                          <td className="teams-cell">
                            {member.team_members?.map(tm => (
                              <span key={tm.teams?.name} className="team-tag">{tm.teams?.name}</span>
                            )) || '—'}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn btn-sm btn-primary" onClick={() => openRoleModal(member)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="8" r="4" /><path d="M12 12c-4 0-7 2-7 5h14c0-3-3-5-7-5z" />
                                </svg>
                                Role
                              </button>
                              <button className="btn btn-sm btn-success" onClick={() => openLeaderModal(member)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                Leader
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Team Leaders */}
            <div className="quick-stats">
              <div className="quick-stat">
                <div className="quick-stat-value">{teams.length}</div>
                <div className="quick-stat-label">Teams</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-value">{teams.filter(t => t.leader_id).length}</div>
                <div className="quick-stat-label">Assigned</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-value">{teams.filter(t => !t.leader_id).length}</div>
                <div className="quick-stat-label">Vacant</div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <h2>Team Leaders</h2>
                <span className="badge-count">{teams.length} teams</span>
              </div>
              <div className="table-responsive">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Leader</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => {
                      const hasLeader = !!team.leader_id;
                      return (
                        <tr key={team.id}>
                          <td>
                            <div className="member-name-cell">
                              <div className="table-avatar team-avatar">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                </svg>
                              </div>
                              <span className="member-name">{team.name}</span>
                            </div>
                          </td>
                          <td>
                            {hasLeader ? (
                              <div>
                                <div className="leader-name">{getLeaderName(team)}</div>
                                <div className="member-email">{getLeaderEmail(team)}</div>
                              </div>
                            ) : (
                              <span className="no-leader-badge">Vacant</span>
                            )}
                          </td>
                          <td>
                            {hasLeader && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => setShowRemoveConfirm(team.id)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                Remove
                              </button>
                            )}
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

      {/* Change Role Modal */}
      {showRoleModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRoleModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3>Change Role</h3>
            <div className="member-detail-header">
              <div className="member-detail-avatar" style={{ width: '48px', height: '48px', fontSize: '1rem' }}>
                {getInitials(selectedMember.full_name)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>{selectedMember.full_name}</div>
                <span className={`role-badge ${getMemberRole(selectedMember)}`}>
                  Current: {getMemberRole(selectedMember)}
                </span>
              </div>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>New Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'leader' | 'member')}
                >
                  <option value="admin">🔴 Admin — Full access</option>
                  <option value="leader">🔵 Leader — Manage a team</option>
                  <option value="member">🟢 Member — Standard access</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssignRole} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Make Team Leader Modal */}
      {showLeaderModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowLeaderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLeaderModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3>Assign Team Leader</h3>
            <div className="member-detail-header">
              <div className="member-detail-avatar" style={{ width: '48px', height: '48px', fontSize: '1rem' }}>
                {getInitials(selectedMember.full_name)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>{selectedMember.full_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Select which team they will lead</div>
              </div>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Team</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  <option value="">Choose a team...</option>
                  {teams
                    .filter(t => !t.leader_id || t.leader_id === selectedMember.id)
                    .map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} {team.leader_id && team.leader_id !== selectedMember.id ? '(has leader)' : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowLeaderModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssignLeader} disabled={saving || !selectedTeamId}>
                {saving ? 'Assigning...' : 'Assign as Leader'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Leader Confirmation */}
      {showRemoveConfirm && (
        <div className="modal-overlay" onClick={() => setShowRemoveConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Leader?</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This will remove the leader from <strong>{teams.find(t => t.id === showRemoveConfirm)?.name}</strong> and set their role back to Member.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRemoveConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleRemoveLeader(showRemoveConfirm)} disabled={saving}>
                {saving ? 'Removing...' : 'Remove Leader'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}