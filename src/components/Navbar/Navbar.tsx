import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import NotificationBell from '../NotificationBell/NotificationBell';
import './Navbar.css';

interface Props {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: Props) {
  const { user, role, signOut } = useAuth();
  const { i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? 'User';
  const initials = getInitials(fullName);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut(e: React.MouseEvent) {
  e.stopPropagation();
  setDropdownOpen(false);
  await signOut();
    // Navigation to /login is handled automatically by AppRoutes (session becomes null)
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <span />
          <span />
          <span />
        </button>
        <Link to="/dashboard" className="navbar-logo">
          <span className="cross">✝</span>
          <div>
            <span>Church Management</span>
            <small>System</small>
          </div>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="lang-switch">
          <button
            className={i18n.language === 'en' ? 'active' : ''}
            onClick={() => i18n.changeLanguage('en')}
          >
            EN
          </button>
          <button
            className={i18n.language === 'am' ? 'active' : ''}
            onClick={() => i18n.changeLanguage('am')}
          >
            አማ
          </button>
        </div>

        <NotificationBell />

        <div className="navbar-user" ref={dropdownRef}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{fullName.split(' ')[0]}</div>
              <span className={`user-role-badge badge-${role || 'member'}`}>{role || '...'}</span>
            </div>
          </div>

          {dropdownOpen && (
            <div className="user-dropdown">
              <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                👤 My Profile
              </Link>
              <button className="signout-btn" onClick={handleSignOut}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}