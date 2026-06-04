import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getAllMembers, searchMembers } from '../../../services/memberService';
import { getInitials, formatDate } from '../../../utils/helpers';
import '../AdminDashboard.css';

interface Member {
  id: string; full_name: string; phone?: string; gender?: string; created_at: string;
  address?: string;
  emergency_contact?: string;
  team_roles?: { role: string }[]; team_members?: { teams: { name: string } }[];
}

type FilterRole = 'all' | 'admin' | 'leader' | 'member';

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadMembers().catch(() => { setError(true); setLoading(false); });
  }, []);

  async function loadMembers() {
    setLoading(true);
    setError(false);
    const { data } = await getAllMembers();
    if (data) setMembers(data);
    setLoading(false);
  }

  async function handleSearch(value: string) {
    setSearch(value);
    if (value.trim() === '') { loadMembers(); return; }
    const { data } = await searchMembers(value);
    if (data) setMembers(data);
  }

  function getMemberRole(member: Member) {
    return member.team_roles?.[0]?.role ?? 'member';
  }

  function getMemberTeams(member: Member) {
    return member.team_members?.map(tm => tm.teams?.name).filter(Boolean) || [];
  }

  function openDetailModal(member: Member) {
    setSelectedMember(member);
    setShowDetailModal(true);
  }

  // Apply filters
  const filteredMembers = members
    .filter(m => filterRole === 'all' ? true : getMemberRole(m) === filterRole)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return a.full_name.localeCompare(b.full_name);
    });

  const roleCounts = {
    all: members.length,
    admin: members.filter(m => getMemberRole(m) === 'admin').length,
    leader: members.filter(m => getMemberRole(m) === 'leader').length,
    member: members.filter(m => getMemberRole(m) === 'member').length,
  };

  const totalMen = members.filter(m => m.gender === 'male').length;
  const totalWomen = members.filter(m => m.gender === 'female').length;
  const withAddress = members.filter(m => m.address).length;
  const withEmergency = members.filter(m => m.emergency_contact).length;

  if (error) {
    return (
      <Layout>
        <div className="admin-page">
          <div className="page-header">
            <h1>Members</h1>
          </div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load members</p>
            <button className="btn btn-primary" onClick={loadMembers}>Try Again</button>
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
              <h1>Members</h1>
              <p>Manage all church members</p>
            </div>
            <div className="page-header-actions">
              <button className="btn btn-primary" onClick={loadMembers}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="quick-stat-value">{roleCounts.all}</div>
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
          <div className="quick-stat">
            <div className="quick-stat-value">{roleCounts.leader}</div>
            <div className="quick-stat-label">Leaders</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{withAddress}</div>
            <div className="quick-stat-label">Addresses</div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-value">{withEmergency}</div>
            <div className="quick-stat-label">Emergency</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="filters-bar">
          <div className="filter-pills">
            {(['all', 'admin', 'leader', 'member'] as FilterRole[]).map(role => (
              <button
                key={role}
                className={`filter-pill ${filterRole === role ? 'active' : ''}`}
                onClick={() => setFilterRole(role)}
              >
                {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                <span className="filter-count">{roleCounts[role]}</span>
              </button>
            ))}
          </div>

          <div className="filters-right">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">By Name</option>
            </select>

            <div className="search-wrapper">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-bar compact"
                placeholder="Search members..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>
              {filterRole === 'all' ? 'All Members' : filterRole.charAt(0).toUpperCase() + filterRole.slice(1) + 's'}
            </h2>
            <span className="badge-count">{filteredMembers.length} found</span>
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
          ) : filteredMembers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p>No members found</p>
              {search && <p className="empty-hint">Try a different search term</p>}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Emergency</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th>Teams</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} onClick={() => openDetailModal(member)} className="clickable-row">
                      <td>
                        <div className="member-name-cell">
                          <div className="table-avatar">{getInitials(member.full_name)}</div>
                          <div>
                            <div className="member-name">{member.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`gender-badge ${member.gender || 'none'}`}>
                          {member.gender === 'male' ? '♂ Male' : member.gender === 'female' ? '♀ Female' : '—'}
                        </span>
                      </td>
                      <td className="phone-cell">{member.phone ? (
                        <a href={`tel:${member.phone}`} className="phone-link" onClick={(e) => e.stopPropagation()}>{member.phone}</a>
                      ) : '—'}</td>
                      <td className="emergency-cell">{member.emergency_contact ? (
                        <a href={`tel:${member.emergency_contact}`} className="phone-link emergency" onClick={(e) => e.stopPropagation()}>{member.emergency_contact}</a>
                      ) : '—'}</td>
                      <td className="address-cell">{member.address ? (
                        <span className="address-text" title={member.address}>{member.address}</span>
                      ) : '—'}</td>
                      <td>
                        <span className={`role-badge ${getMemberRole(member)}`}>
                          {getMemberRole(member)}
                        </span>
                      </td>
                      <td className="teams-cell">
                        {getMemberTeams(member).length > 0
                          ? getMemberTeams(member).slice(0, 2).map(name => (
                              <span key={name} className="team-tag">{name}</span>
                            ))
                          : '—'}
                        {getMemberTeams(member).length > 2 && (
                          <span className="team-tag more">+{getMemberTeams(member).length - 2}</span>
                        )}
                      </td>
                      <td className="date-cell">{formatDate(member.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <div className="member-detail-avatar">{getInitials(selectedMember.full_name)}</div>
              <div>
                <h3>{selectedMember.full_name}</h3>
                <span className={`role-badge ${getMemberRole(selectedMember)}`}>{getMemberRole(selectedMember)}</span>
              </div>
            </div>

            <div className="member-detail-grid">
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{selectedMember.gender || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <span className="detail-value">
                  {selectedMember.phone ? (
                    <a href={`tel:${selectedMember.phone}`} className="phone-link">{selectedMember.phone}</a>
                  ) : 'Not specified'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Emergency Contact</span>
                <span className="detail-value">
                  {selectedMember.emergency_contact ? (
                    <a href={`tel:${selectedMember.emergency_contact}`} className="phone-link emergency">{selectedMember.emergency_contact}</a>
                  ) : 'Not specified'}
                </span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Address</span>
                <span className="detail-value">{selectedMember.address || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Teams</span>
                <span className="detail-value">
                  {getMemberTeams(selectedMember).length > 0
                    ? getMemberTeams(selectedMember).join(', ')
                    : 'No teams'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Joined</span>
                <span className="detail-value">{formatDate(selectedMember.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}