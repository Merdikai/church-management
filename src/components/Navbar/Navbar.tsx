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
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? 'User';
  const initials = getInitials(fullName);

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
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <span /><span /><span />
        </button>
        <Link to="/dashboard" className="navbar-logo">
          <div className="logo-icon"><span className="cross">✝</span></div>
          <div className="logo-text">
            <span className="logo-title">EECMY Management</span>
            <span className="logo-subtitle">Bethel Anfo</span>
          </div>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="lang-switch">
          <button className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
            onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('preferred_language', 'en'); }}>EN</button>
          <button className={`lang-btn ${i18n.language === 'am' ? 'active' : ''}`}
            onClick={() => { i18n.changeLanguage('am'); localStorage.setItem('preferred_language', 'am'); }}>አማ</button>
        </div>
        <NotificationBell />
        <div className="navbar-user" ref={dropdownRef}>
          <div className="user-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="user-avatar"><span>{initials}</span></div>
            <div className="user-info">
              <span className="user-name">{fullName.split(' ')[0]}</span>
              <span className={`user-role-badge badge-${role || 'member'}`}>{role || 'member'}</span>
            </div>
            <svg className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{initials}</div>
                <div><div className="dropdown-name">{fullName}</div><div className="dropdown-email">{user?.email}</div></div>
              </div>
              <div className="dropdown-divider" />
              <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {t('myProfile')}
              </Link>
              <Link to="/notifications" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {t('notifications')}
              </Link>
              <div className="dropdown-divider" />
              <button className="dropdown-item signout-item" onClick={handleSignOut}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                {t('signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}