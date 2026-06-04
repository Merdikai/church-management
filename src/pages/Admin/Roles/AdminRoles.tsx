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

export default function AdminRoles() {
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'leader' | 'member'>('member');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
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
    await assignTeamLeader(selectedMember.id, selectedTeamId);
    setSaving(false);
    setShowLeaderModal(false);
    setMessage(`✅ ${selectedMember.full_name} is now leader of the team`);
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  async function handleRemoveLeader(teamId: string) {
    if (!confirm('Remove leader from this team?')) return;
    setSaving(true);
    await removeTeamLeader(teamId);
    setSaving(false);
    setMessage('✅ Leader removed from team');
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  function getLeaderName(team: Team) {
    const leader = members.find(m => m.id === team.leader_id);
    return leader?.full_name ?? 'None';
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Role Management</h1>
          <p>Assign roles and team leaders</p>
        </div>

        {message && (
          <div style={{
            background: '#eafaf1',
            border: '1px solid #2ecc71',
            color: '#27ae60',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: 600,
          }}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : (
          <>
            {/* Members & Roles Table */}
            <div className="section-card">
              <div className="section-card-header">
                <h2>Members & Roles ({members.length})</h2>
              </div>
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Current Role</th>
                    <th>Actions</th>
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
                          <span style={{ fontWeight: 600 }}>{member.full_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${getMemberRole(member)}`}>
                          {getMemberRole(member)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => openRoleModal(member)}
                          >
                            Change Role
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => openLeaderModal(member)}
                            style={{ background: '#27ae60' }}
                          >
                            Make Team Leader
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Teams & Leaders Table */}
            <div className="section-card">
              <div className="section-card-header">
                <h2>Team Leaders ({teams.length} teams)</h2>
              </div>
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Current Leader</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td style={{ fontWeight: 600 }}>{team.name}</td>
                      <td>{getLeaderName(team)}</td>
                      <td>
                        {team.leader_id && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveLeader(team.id)}
                          >
                            Remove Leader
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Change Role Modal */}
      {showRoleModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Change Role</h3>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Change role for <strong>{selectedMember.full_name}</strong>
            </p>
            <div className="modal-form">
              <div className="form-group">
                <label>Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'leader' | 'member')}
                >
                  <option value="admin">Admin</option>
                  <option value="leader">Leader</option>
                  <option value="member">Member</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAssignRole} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Make Team Leader Modal */}
      {showLeaderModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowLeaderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Make Team Leader</h3>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Assign <strong>{selectedMember.full_name}</strong> as leader of a team
            </p>
            <div className="modal-form">
              <div className="form-group">
                <label>Select Team</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  <option value="">Choose a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowLeaderModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssignLeader}
                disabled={saving || !selectedTeamId}
              >
                {saving ? 'Assigning...' : 'Assign as Leader'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}