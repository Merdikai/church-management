import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getMyTeam, getTeamMembers, removeMemberFromTeam } from '../../../services/teamService';
import { getInitials, formatDate } from '../../../utils/helpers';
import './LeaderMembers.css';

interface Member {
  user_id: string;
  joined_at: string;
  profiles: { id: string; full_name: string; phone?: string; gender?: string; emergency_contact?: string; created_at: string };
}

export default function LeaderMembers() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{ id: string; name: string } | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    setError(false);
    try {
      const { data: team } = await getMyTeam(user!.id);
      if (team) {
        setTeamId(team.id);
        setTeamName(team.name);
        const { data } = await getTeamMembers(team.id);
        if (data) setMembers(data as unknown as Member[]);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  async function handleRemove(userId: string) {
    await removeMemberFromTeam(userId, teamId);
    setShowRemoveConfirm(null);
    setMessage('✅ Member removed from team');
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  function openDetailModal(member: Member) {
    setSelectedMember(member);
    setShowDetailModal(true);
  }

  const filteredMembers = members.filter(m =>
    m.profiles.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalMen = members.filter(m => m.profiles.gender === 'male').length;
  const totalWomen = members.filter(m => m.profiles.gender === 'female').length;

  if (error) {
    return (
      <Layout>
        <div className="leader-page">
          <div className="page-header"><h1>Team Members</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load team members</p>
            <button className="btn btn-primary" onClick={loadData}>Try Again</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="leader-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>Team Members</h1>
              <p>Manage members of <strong>{teamName || 'your team'}</strong></p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && <div className="toast-message">{message}</div>}

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="quick-stat-value">{members.length}</div>
            <div className="quick-stat-label">Total</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{totalMen}</div>
            <div className="quick-stat-label">Men</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{totalWomen}</div>
            <div className="quick-stat-label">Women</div>
          </div>
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

        {/* Members Grid */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Members</h2>
            <span className="badge-count">{filteredMembers.length} of {members.length}</span>
          </div>

          {loading ? (
            <div className="members-skeleton">
              {[1,2,3,4].map(i => (
                <div key={i} className="member-skeleton-card">
                  <div className="skeleton-circle" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line xshort" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <p>{search ? 'No members found' : 'No members yet'}</p>
              {search && <p className="empty-hint">Try a different search</p>}
            </div>
          ) : (
            <div className="members-grid">
              {filteredMembers.map((m) => (
                <div key={m.user_id} className="member-card" onClick={() => openDetailModal(m)}>
                  <div className="member-card-avatar">
                    {getInitials(m.profiles.full_name)}
                  </div>
                  <div className="member-card-info">
                    <h3 className="member-card-name">{m.profiles.full_name}</h3>
                    <div className="member-card-meta">
                      <span className={`gender-badge ${m.profiles.gender || 'none'}`}>
                        {m.profiles.gender === 'male' ? '♂' : m.profiles.gender === 'female' ? '♀' : ''}
                      </span>
                      <span className="member-card-joined">Joined {formatDate(m.joined_at)}</span>
                    </div>
                    {m.profiles.phone && (
                      <a href={`tel:${m.profiles.phone}`} className="member-card-phone" onClick={(e) => e.stopPropagation()}>
                        {m.profiles.phone}
                      </a>
                    )}
                  </div>
                  <button
                    className="member-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRemoveConfirm({ id: m.user_id, name: m.profiles.full_name });
                    }}
                    title="Remove member"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Member Detail Modal */}
      {showDetailModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal member-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="member-detail-header">
              <div className="member-detail-avatar">
                {getInitials(selectedMember.profiles.full_name)}
              </div>
              <div>
                <h3>{selectedMember.profiles.full_name}</h3>
                <span className="member-detail-joined">Joined {formatDate(selectedMember.joined_at)}</span>
              </div>
            </div>
            <div className="member-detail-grid">
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>{selectedMember.profiles.gender || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <span className="detail-value">
                  {selectedMember.profiles.phone ? (
                    <a href={`tel:${selectedMember.profiles.phone}`} className="phone-link">{selectedMember.profiles.phone}</a>
                  ) : 'Not specified'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Emergency Contact</span>
                <span className="detail-value">
                  {selectedMember.profiles.emergency_contact ? (
                    <a href={`tel:${selectedMember.profiles.emergency_contact}`} className="phone-link emergency">{selectedMember.profiles.emergency_contact}</a>
                  ) : 'Not specified'}
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowRemoveConfirm({ id: selectedMember.user_id, name: selectedMember.profiles.full_name });
                }}
              >
                Remove from Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation */}
      {showRemoveConfirm && (
        <div className="modal-overlay" onClick={() => setShowRemoveConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Member?</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to remove <strong>{showRemoveConfirm.name}</strong> from the team?
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRemoveConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleRemove(showRemoveConfirm.id)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}