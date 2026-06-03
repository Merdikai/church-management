import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const adminLinks = [
  { to: '/admin', icon: '🏠', label: 'Dashboard' },
  { to: '/admin/members', icon: '👥', label: 'Members' },
  { to: '/admin/teams', icon: '⛪', label: 'Teams' },
  { to: '/admin/announcements', icon: '📢', label: 'Announcements' },
  { to: '/admin/events', icon: '📅', label: 'Events' },
  { to: '/admin/reports', icon: '📊', label: 'Reports' },
  { to: '/admin/roles', icon: '👑', label: 'Roles' },
];

const leaderLinks = [
  { to: '/leader', icon: '🏠', label: 'Dashboard' },
  { to: '/leader/members', icon: '👥', label: 'My Team' },
  { to: '/leader/announcements', icon: '📢', label: 'Announcements' },
  { to: '/leader/requests', icon: '📋', label: 'Join Requests' },
  { to: '/leader/feedback', icon: '💬', label: 'Feedback' },
];

const memberLinks = [
  { to: '/member', icon: '🏠', label: 'Dashboard' },
  { to: '/member/teams', icon: '⛪', label: 'Teams' },
  { to: '/member/announcements', icon: '📢', label: 'Announcements' },
  { to: '/member/events', icon: '📅', label: 'Events' },
  { to: '/member/prayer', icon: '🙏', label: 'Prayer Requests' },
];

const sharedLinks = [
  { to: '/profile', icon: '👤', label: 'My Profile' },
];

export default function Sidebar({ isOpen, onClose }: Props) {
  const { role } = useAuth();

  const links =
    role === 'admin' ? adminLinks :
    role === 'leader' ? leaderLinks :
    memberLinks;

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-section">
          <div className="sidebar-section-title">Main Menu</div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Account</div>
          {sharedLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          Church Management System v1.0
        </div>
      </aside>
    </>
  );
}