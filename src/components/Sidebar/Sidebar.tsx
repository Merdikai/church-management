import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/members', label: 'Members', icon: 'members' },
  { to: '/admin/teams', label: 'Teams', icon: 'teams' },
  { to: '/admin/roles', label: 'Roles', icon: 'roles' },
  { to: '/admin/announcements', label: 'Announcements', icon: 'announcements' },
  { to: '/admin/events', label: 'Events', icon: 'events' },
  { to: '/admin/reports', label: 'Reports', icon: 'reports' },
  { to: '/admin/site-settings', icon: '🌐', label: 'Site Settings' },
];

const leaderLinks = [
  { to: '/leader', label: 'Dashboard', icon: 'dashboard' },
  { to: '/leader/members', label: 'My Team', icon: 'members' },
  { to: '/leader/announcements', label: 'Announcements', icon: 'announcements' },
  { to: '/leader/requests', label: 'Join Requests', icon: 'requests' },
  { to: '/leader/feedback', label: 'Feedback', icon: 'feedback' },
];

const memberLinks = [
  { to: '/member', label: 'Dashboard', icon: 'dashboard' },
  { to: '/member/teams', label: 'Teams', icon: 'teams' },
  { to: '/member/announcements', label: 'Announcements', icon: 'announcements' },
  { to: '/member/events', label: 'Events', icon: 'events' },
  { to: '/member/prayer', label: 'Prayer Requests', icon: 'prayer' },
];

const sharedLinks = [
  { to: '/profile', label: 'My Profile', icon: 'profile' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
];

// SVG icons as components for crisp rendering
const icons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  members: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  teams: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  roles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M12 12c-4 0-7 2-7 5h14c0-3-3-5-7-5z" />
      <polygon points="12 2 15 6 13 7 11 7 9 6" />
    </svg>
  ),
  announcements: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  events: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  reports: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  requests: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  feedback: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  prayer: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v3.5c0 1.5 1 3 3 3s3-1.5 3-3V5a3 3 0 0 0-3-3z" />
      <path d="M8 10c-1.5 2-2 5-2 8h12c0-3-.5-6-2-8" />
    </svg>
  ),
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  notifications: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

export default function Sidebar({ isOpen, onClose }: Props) {
  const { role } = useAuth();

  const links =
    role === 'admin' ? adminLinks :
    role === 'leader' ? leaderLinks :
    memberLinks;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">✝</div>
          <div>
            <div className="sidebar-brand-title">Bethel Anfo</div>
            <div className="sidebar-brand-subtitle">EECMY Management</div>
          </div>
        </div>

        {/* Main menu */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Main Menu</div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-icon">{icons[link.icon]}</span>
              <span className="sidebar-label">{link.label}</span>
              <span className="sidebar-indicator" />
            </NavLink>
          ))}
        </div>

        {/* Account */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Account</div>
          {sharedLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-icon">{icons[link.icon]}</span>
              <span className="sidebar-label">{link.label}</span>
              <span className="sidebar-indicator" />
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-version">v1.0</div>
          <div className="sidebar-copyright">© {new Date().getFullYear()}</div>
        </div>
      </aside>
    </>
  );
}