import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSiteSettings } from '../../services/siteSettingsService';
import { useAuth } from '../../context/AuthContext';
import './PublicHome.css';

interface SiteSetting {
  section: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string | null;
}

export default function PublicHome() {
  const { session } = useAuth();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    loadSettings();
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function loadSettings() {
    const { data } = await getSiteSettings();
    if (data) setSettings(data);
    setLoading(false);
  }

  function getSetting(section: string): SiteSetting | undefined {
    return settings.find(s => s.section === section);
  }

  const about = getSetting('about');
  const contact = getSetting('contact');
  const donation = getSetting('donation');

  if (loading) {
    return (
      <div className="public-loading">
        <div className="loading-spinner">
          <div className="spinner-ring" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-home">
      {/* Navigation */}
      <nav className={`public-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="public-nav-container">
          <Link to="/" className="public-nav-logo">
            <div className="nav-logo-wrapper">
              <img src="/images/church-logo.png" alt="Logo" className="church-logo-img" />
            </div>
            <div className="nav-brand">
              <span className="nav-brand-name">Bethel Anfo congregation</span>
              <span className="nav-brand-tagline">House of God</span>
            </div>
          </Link>
          <div className={`public-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#ministries" onClick={() => setMobileMenuOpen(false)}>Ministries</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <a href="#donation" onClick={() => setMobileMenuOpen(false)} className="nav-donate-link">Donate</a>
            <Link to={session ? '/dashboard' : '/login'} className="nav-cta-btn">
              {session ? 'Dashboard' : 'Member Login'}
            </Link>
          </div>
          <button className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-parallax">
          <img src="/images/church-hero.jpg" alt="Church" className="hero-bg-image" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }} />
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Welcome to Our Church
          </div>
          <h1>
            EECMY Bethel Anfo 
            <span className="hero-highlight"> Congregation</span>
          </h1>
          <p className="hero-description">
            Join us in worship, community, and spiritual growth. Experience the transformative 
            power of faith in a welcoming family of believers.
          </p>
          <div className="hero-actions">
            <a href="#about" className="hero-btn primary">
              <span>Discover More</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8l4 4-4 4" />
              </svg>
            </a>
            <Link to="/register" className="hero-btn outline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              <span>Join Us</span>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">10+</span>
              <span className="stat-label">Years Serving</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-number">200+</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-number">5</span>
              <span className="stat-label">Weekly Services</span>
            </div>
          </div>
          <a href="#about" className="scroll-indicator">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 13l5 5 5-5" /><path d="M7 6l5 5 5-5" />
            </svg>
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="public-section about-section">
        <div className="public-section-container">
          <div className="section-image-wrapper">
            <div className="section-image-main">
              <img src={about?.image_url || '/images/church-about.jpg'} alt="About" />
            </div>
            <div className="section-image-accent" />
            <div className="section-image-badge">
              <span>Since 2004</span>
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">About Us</span>
            <h2>{about?.title || 'A Church That Loves God & People'}</h2>
            <p className="section-subtitle">{about?.subtitle || 'Building a community of faith, hope, and love since 2004.'}</p>
            <div className="section-text" dangerouslySetInnerHTML={{ __html: (about?.content || '').replace(/\n/g, '<br/>') }} />
            <div className="about-features">
              <div className="about-feature">
                <div className="feature-icon">🙏</div>
                <div>
                  <strong>Authentic Worship</strong>
                  <p>Experience heartfelt worship that connects you to God.</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="feature-icon">👨‍👩‍👧‍👦</div>
                <div>
                  <strong>Family Focused</strong>
                  <p>Programs for every age group to grow together in faith.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ministries Section */}
      <section id="ministries" className="public-section ministries-section">
        <div className="public-section-container">
          <div className="section-header">
            <span className="section-tag">What We Do</span>
            <h2>Our  Programs</h2>
            <p className="section-header-subtitle">Serving our community through various ministries that meet spiritual and practical needs.</p>
          </div>
          <div className="ministries-grid">
            {[
              { icon: '⛪', title: 'Worship Service', desc: 'Dynamic worship experiences that bring you closer to God every Sunday.', color: '#3b82f6' },
              { icon: '👶', title: "Children's Church", desc: 'Fun, engaging, and safe environment for kids to learn about Jesus.', color: '#10b981' },
              { icon: '🔥', title: 'Youth Program', desc: 'Empowering the next generation through mentorship and fellowship.', color: '#f59e0b' },
              { icon: '🤝', title: 'Community Outreach', desc: 'Serving our local community through food drives and support programs.', color: '#ef4444' },
              { icon: '📖', title: 'Bible Study', desc: 'Deep dive into Scripture with small group discussions and teachings.', color: '#8b5cf6' },
              { icon: '🎵', title: 'Choir & Music', desc: 'Use your musical ans spiritual gifts to lead the congregation in worship.', color: '#ec4899' },
            ].map((m) => (
              <div key={m.title} className="ministry-card" style={{ '--accent': m.color } as React.CSSProperties}>
                <div className="ministry-icon-wrap" style={{ background: m.color + '15', color: m.color }}>
                  <span className="ministry-icon">{m.icon}</span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <span className="ministry-link">
                  Learn more
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="public-section contact-section">
        <div className="public-section-container">
          <div className="section-content">
            <span className="section-tag">Get In Touch</span>
            <h2>{contact?.title || "We'd Love to Hear From You"}</h2>
            <p className="section-subtitle">Reach out to us for prayer requests, questions, or just to say hello.</p>
            
            <div className="contact-cards">
              <div className="contact-card">
                <div className="contact-card-icon">📍</div>
                <h4>Visit Us</h4>
                <p>Addis Ababa, Bethel 40 Meter</p>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon">📞</div>
                <h4>Call Us</h4>
                <p>+251 911 111 111</p>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon">📧</div>
                <h4>Email Us</h4>
                <p>bethelanfoeecmy@gmail.com</p>
              </div>
            </div>

            <div className="service-times">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Service Times
              </h3>
              <div className="service-time-item">
                <div>
                  <span className="day">Sunday Morning Worship</span>
                  <span className="time">3:00 AM - 7:00 AM</span>
                </div>
                <span className="service-badge">Main</span>
              </div>
              <div className="service-time-item">
                <div>
                  <span className="day">Sunday Youth Service</span>
                  <span className="time">11:00 PM - 1:00 PM</span>
                </div>
              </div>
              <div className="service-time-item">
                <div>
                  <span className="day">Wednesday Bible Study</span>
                  <span className="time">11:00 PM - 1:00 PM</span>
                </div>
               
              </div>
              <div className="service-time-item">
                <div>
                  <span className="day">Friday FAsting Pray</span>
                  <span className="time">4:00 AM - 7:00 PM</span>
                </div>
                
              </div>
            </div>
          </div>
          <div className="section-image-wrapper">
            <div className="section-image-main">
              <img src={contact?.image_url || '/images/church-contact.jpg'} alt="Contact" />
            </div>
            <div className="section-image-accent right" />
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section id="donation" className="public-section donation-section">
        <div className="donation-bg-pattern" />
        <div className="public-section-container">
          <div className="section-header">
            <span className="section-tag">Give</span>
            <h2>{donation?.title || 'Support Our Church'}</h2>
            <p className="section-header-subtitle">Your generosity enables us to serve our community and spread the gospel.</p>
          </div>
          <div className="donation-cards">
            <div className="donation-card">
              <div className="donation-card-header">
                <div className="donation-card-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <h3>Bank Transfer</h3>
              </div>
              <div className="bank-details">
                <div className="bank-item">
                  <span className="bank-name">Commercial Bank of Ethiopia</span>
                  <span className="bank-account">1000123456789</span>
                </div>
                <div className="bank-item">
                  <span className="bank-name">Birhan Bank</span>
                  <span className="bank-account">0134567890123</span>
                </div>
              </div>
            </div>
            <div className="donation-card featured">
              <div className="donation-card-header">
                <div className="donation-card-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <h3>TeleBirr</h3>
              </div>
              <div className="telebirr-number">
                <span className="telebirr-label">Send to:</span>
                <span className="telebirr-value">+251 911 111 111</span>
              </div>
              <p className="donation-note">Quick and easy mobile money transfer</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <span className="section-tag light">Join Us</span>
          <h2>Ready to Be Part of Our Community?</h2>
          <p>We'd love to welcome you. Come visit us this Sunday or join online.</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn primary">
              Get Started Today
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a href="#contact" className="cta-btn outline">Contact Us</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="public-footer">
        <div className="footer-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z" fill="#0f172a"/>
          </svg>
        </div>
        <div className="footer-content">
          <div className="footer-col main">
            <div className="footer-logo">
              <img src="/images/church-logo.png" alt="Logo" className="church-logo-img" />
              <div>
                <span className="footer-brand">Bethel Church</span>
                <span className="footer-tagline">House of God</span>
              </div>
            </div>
            <p>A place where faith comes alive. Join us in worship and experience the love of Christ.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><span>📘</span></a>
              <a href="#" aria-label="YouTube"><span>▶️</span></a>
              <a href="#" aria-label="Telegram"><span>📱</span></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#about">About Us</a>
            <a href="#ministries">Ministries</a>
            <a href="#contact">Contact</a>
            <a href="#donation">Donate</a>
          </div>
          <div className="footer-col">
            <h4>Service Times</h4>
            <div className="footer-service">
              <span>Sunday Morning</span>
              <span className="footer-time">3:00 AM - 7:00 AM</span>
            </div>
            <div className="footer-service">
              <span>Sunday Youth Service</span>
              <span className="footer-time">11:00 PM - 1:00 PM</span>
            </div>
            <div className="footer-service">
              <span>Wednesday Study</span>
              <span className="footer-time">11:00 PM - 1:00 PM</span>
            </div>
            <div className="footer-service">
              <span>Friday Fasting Pray</span>
              <span className="footer-time">4:00 AM - 7:00 PM</span>
            </div>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <span>📍 Addis Ababa, Bethel 40 Meter</span>
            <span>📞 +251 911 111 111</span>
            <span>📧 bethelanfoeecmy@gmail.com</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Bethel Church. All rights reserved. Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
}