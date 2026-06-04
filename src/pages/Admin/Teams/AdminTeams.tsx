import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getAllTeams, createTeam, updateTeam } from '../../../services/teamService';
import { getAllMembers } from '../../../services/memberService';
import '../AdminDashboard.css';

interface Team {
  id: string; name: string; description?: string; leader_id?: string;
  team_members?: { count: number }[];
}

interface Member {
  id: string; full_name: string;
  team_roles?: { role: string }[];
}

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData().catch(() => { setError(true); setLoading(false); });
  }, []);

  async function loadData() {
    setLoading(true);
    setError(false);
    const [teamsRes, membersRes] = await Promise.all([
      getAllTeams(),
      getAllMembers(),
    ]);
    if (teamsRes.data) setTeams(teamsRes.data);
    if (membersRes.data) setMembers(membersRes.data);
    setLoading(false);
  }

  function getLeaderName(team: Team) {
    const leader = members.find(m => m.id === team.leader_id);
    return leader?.full_name || 'Unassigned';
  }

  function getMemberCount(team: Team) {
    return (team.team_members as unknown as { count: number }[])?.[0]?.count ?? 0;
  }

  function openCreate() {
    setEditingTeam(null);
    setFormName('');
    setFormDesc('');
    setShowModal(true);
  }

  function openEdit(team: Team) {
    setEditingTeam(team);
    setFormName(team.name);
    setFormDesc(team.description ?? '');
    setShowModal(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    if (editingTeam) {
      await updateTeam(editingTeam.id, { name: formName, description: formDesc });
      setMessage(`✅ "${formName}" updated successfully`);
    } else {
      await createTeam(formName, formDesc);
      setMessage(`✅ "${formName}" created successfully`);
    }
    setSaving(false);
    setShowModal(false);
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }



  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalMembers = teams.reduce((sum, t) => sum + getMemberCount(t), 0);

  if (error) {
    return (
      <Layout>
        <div className="admin-page">
          <div className="page-header"><h1>Teams</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load teams</p>
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
              <h1>Teams</h1>
              <p>Manage church teams and ministries</p>
            </div>
            <div className="page-header-actions">
              <button className="btn btn-primary" onClick={openCreate}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Team
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="toast-message">{message}</div>
        )}

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="quick-stat-value">{teams.length}</div>
            <div className="quick-stat-label">Teams</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{totalMembers}</div>
            <div className="quick-stat-label">Total Members</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{teams.filter(t => t.leader_id).length}</div>
            <div className="quick-stat-label">With Leaders</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{teams.filter(t => !t.leader_id).length}</div>
            <div className="quick-stat-label">Need Leader</div>
          </div>
        </div>

        {/* Search & View Toggle */}
        <div className="filters-bar">
          <div className="search-wrapper" style={{ flex: 1, maxWidth: '400px' }}>
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

          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>All Teams</h2>
            <span className="badge-count">{filteredTeams.length} of {teams.length}</span>
          </div>

          {loading ? (
            <div className="skeleton-container">
              {[1,2,3,4].map(i => (
                <div key={i} className="skeleton-card-small">
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line xshort" />
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
              {search && <p className="empty-hint">Try a different search term</p>}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="teams-card-grid">
              {filteredTeams.map((team) => {
                const count = getMemberCount(team);
                const hasLeader = !!team.leader_id;
                return (
                  <div key={team.id} className="team-card">
                    <div className="team-card-header">
                      <div className="team-card-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <div className="team-card-actions">
                        <button className="icon-btn" onClick={() => openEdit(team)} title="Edit team">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <h3 className="team-card-name">{team.name}</h3>
                    <p className="team-card-desc">{team.description || 'No description'}</p>
                    <div className="team-card-stats">
                      <div className="team-card-stat">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                        {count} member{count !== 1 ? 's' : ''}
                      </div>
                      <div className={`team-card-stat ${hasLeader ? 'has-leader' : 'no-leader'}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="4" /><path d="M12 12c-4 0-7 2-7 5h14c0-3-3-5-7-5z" />
                        </svg>
                        {hasLeader ? getLeaderName(team) : 'No leader'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="table-responsive">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Description</th>
                    <th>Leader</th>
                    <th>Members</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team) => (
                    <tr key={team.id}>
                      <td>
                        <div className="member-name-cell">
                          <div className="table-avatar team-avatar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            </svg>
                          </div>
                          <span style={{ fontWeight: 600 }}>{team.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#666', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {team.description ?? '—'}
                      </td>
                      <td>
                        <span className={team.leader_id ? 'leader-name' : 'no-leader-text'}>
                          {getLeaderName(team)}
                        </span>
                      </td>
                      <td>
                        <span className="member-count-badge">{getMemberCount(team)}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(team)}>
                            Edit
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
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3>{editingTeam ? 'Edit Team' : 'Create New Team'}</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Team Name</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Worship Team" autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Short description of this team..."
                  rows={3}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#f9fafb' }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingTeam ? 'Save Changes' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Team?</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This action cannot be undone. All team members will be unassigned.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}