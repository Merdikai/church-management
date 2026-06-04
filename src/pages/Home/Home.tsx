import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Community',
      description: 'Connect with your church family, join ministries, and grow together.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: 'Events',
      description: 'Stay updated with upcoming church events and activities.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      title: 'Announcements',
      description: 'Never miss important updates from your church leadership.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v3.5c0 1.5 1 3 3 3s3-1.5 3-3V5a3 3 0 0 0-3-3z" /><path d="M8 10c-1.5 2-2 5-2 8h12c0-3-.5-6-2-8" />
        </svg>
      ),
      title: 'Prayer',
      description: 'Share and receive prayer requests with your community.',
    },
  ];

  return (
    <div className="home-wrapper">
      {/* Animated Background */}
      <div className="home-bg">
        <div className="home-bg-circle circle-1" />
        <div className="home-bg-circle circle-2" />
        <div className="home-bg-circle circle-3" />
        <div className="home-bg-grid" />
      </div>

      {/* Navigation */}
      <nav className="home-nav">
        <div className="home-nav-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span>{t('appName')}</span>
        </div>
        <div className="home-nav-actions">
          <Link to="/login" className="home-nav-link">{t('login')}</Link>
          <Link to="/register" className="home-nav-btn">{t('register')}</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="home-hero">
        <div className="home-hero-badge">
          <span className="hero-badge-dot" />
          Built for Ethiopian Churches
        </div>
        <h1 className="home-title">
          Manage Your Church
          <span className="home-title-highlight"> Beautifully</span>
        </h1>
        <p className="home-subtitle">
          A complete church management platform to connect your community, 
          organize teams, share announcements, and grow together in faith.
        </p>
        <div className="home-buttons">
          <Link to="/register" className="home-btn home-btn-primary">
            Get Started Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link to="/login" className="home-btn home-btn-outline">
            Sign In
          </Link>
        </div>
      </main>

      {/* Features Grid */}
      <section className="home-features">
        <div className="home-features-header">
          <h2>Everything You Need</h2>
          <p>Powerful tools to serve your church community</p>
        </div>
        <div className="home-features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="home-feature-card">
              <div className="home-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="home-stats">
        <div className="home-stat-item">
          <span className="home-stat-value">Amharic</span>
          <span className="home-stat-label">Language Support</span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat-item">
          <span className="home-stat-value">Teams</span>
          <span className="home-stat-label">Ministry Management</span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat-item">
          <span className="home-stat-value">Secure</span>
          <span className="home-stat-label">Role-Based Access</span>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta-card">
          <h2>Ready to get started?</h2>
          <p>Join your church community today and experience the difference.</p>
          <Link to="/register" className="home-btn home-btn-primary">
            Create Free Account
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-content">
          <p>© {new Date().getFullYear()} {t('appName')}. All rights reserved.</p>
          <div className="home-footer-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}