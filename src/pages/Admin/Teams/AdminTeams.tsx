import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getAllTeams, createTeam, updateTeam } from '../../../services/teamService';
import '../AdminDashboard.css';

interface Team {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  team_members?: { count: number }[];
}

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTeams(); }, []);

  async function loadTeams() {
    setLoading(true);
    const { data } = await getAllTeams();
    if (data) setTeams(data);
    setLoading(false);
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
    } else {
      await createTeam(formName, formDesc);
    }
    setSaving(false);
    setShowModal(false);
    loadTeams();
  }

  function getMemberCount(team: Team) {
    return (team.team_members as unknown as { count: number }[])?.[0]?.count ?? 0;
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Teams</h1>
          <p>Manage church teams and ministries</p>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <h2>All Teams ({teams.length})</h2>
            <button className="btn btn-primary" onClick={openCreate}>
              + New Team
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <table className="members-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Description</th>
                  <th>Members</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td style={{ fontWeight: 600 }}>{team.name}</td>
                    <td style={{ color: '#666' }}>{team.description ?? '—'}</td>
                    <td>{getMemberCount(team)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => openEdit(team)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTeam ? 'Edit Team' : 'Create New Team'}</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Team Name</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Worship Team"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Short description..."
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}