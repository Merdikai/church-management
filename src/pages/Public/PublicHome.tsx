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

/* ── SVG icon components ─────────────────────────────────────── */
const IconPray = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9 7l-7 3 7 3 3 7 3-7 7-3-7-3-3-5z"/>
  </svg>
);
const IconFamily = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconChurch = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22V12l9-9 9 9v10"/><path d="M9 22v-6h6v6"/><line x1="12" y1="3" x2="12" y2="7"/>
    <line x1="10" y1="5" x2="14" y2="5"/>
  </svg>
);
const IconChild = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="6" r="3"/><path d="M6 22v-2a6 6 0 0 1 12 0v2"/>
    <path d="M12 9v4"/><path d="M9 13h6"/>
  </svg>
);
const IconFlame = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5c0 0 5-4.5 5-9.5C16 2.5 12 1 12 1S5 4 5 9.5C5 13 7 15.5 8.5 14.5z"/>
    <path d="M12 17v4"/>
  </svg>
);
const IconHands = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const IconBook = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconMusic = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);
const IconCross = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="8" x2="19" y2="8"/>
  </svg>
);
const IconGift = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);
const IconCrown = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20"/><path d="M5 20V10l5 5 4-9 4 9 5-5v10"/>
  </svg>
);
const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.12 6.12l1.99-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const IconYoutube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);
const IconTelegram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconCrossSmall = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="8" x2="19" y2="8"/>
  </svg>
);

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

  const about    = getSetting('about');
  const contact  = getSetting('contact');
  const donation = getSetting('donation');

  if (loading) {
    return (
      <div className="public-loading">
        <div className="loading-spinner">
          <div className="spinner-ring" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-home">

      {/* ── NAVIGATION ── */}
      <nav className={`public-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="public-nav-container">
          <Link to="/" className="public-nav-logo">
            <div className="nav-logo-wrapper">
              <img src="/images/church-logo.png" alt="Logo" className="church-logo-img" />
            </div>
            <div className="nav-brand">
              <span className="nav-brand-name">Bethel Anfo Congregation</span>
              <span className="nav-brand-tagline">House of God</span>
            </div>
          </Link>

          <div className={`public-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <a href="#home"       onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#about"      onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#ministries" onClick={() => setMobileMenuOpen(false)}>Ministries</a>
            <a href="#heritage"   onClick={() => setMobileMenuOpen(false)}>Heritage</a>
            <a href="#contact"    onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <a href="#donation"   onClick={() => setMobileMenuOpen(false)} className="nav-donate-link">Donate</a>
            <Link to={session ? '/dashboard' : '/login'} className="nav-cta-btn">
              {session ? 'Dashboard' : 'Member Login'}
            </Link>
          </div>

          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="hero-section">
        <div className="hero-parallax">
          <img src="/images/church-hero.jpg" alt="Church" className="hero-bg-image" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-particles">
          {[...Array(22)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay:    `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
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
            <span className="hero-highlight">Congregation</span>
          </h1>

          <p className="hero-description">
            Join us in worship, community, and spiritual growth. Experience the transformative
            power of faith in a welcoming family of believers.
          </p>

          <div className="hero-actions">
            <a href="#about" className="hero-btn primary">
              <span>Discover More</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8l4 4-4 4"/>
              </svg>
            </a>
            <Link to="/register" className="hero-btn outline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
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

          <a href="#about" className="scroll-indicator" aria-label="Scroll down">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 13l5 5 5-5"/><path d="M7 6l5 5 5-5"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="public-section about-section">
        <div className="public-section-container">
          <div className="section-image-wrapper">
            <div className="section-image-main">
              <img src={about?.image_url || '/images/church-about.jpg'} alt="About our church" />
            </div>
            <div className="section-image-accent" />
            <div className="section-image-badge">Since 2004</div>
          </div>

          <div className="section-content">
            <span className="section-tag">About Us</span>
            <h2>{about?.title || 'A Church That Loves God & People'}</h2>
            <p className="section-subtitle">
              {about?.subtitle || 'Building a community of faith, hope, and love since 2004.'}
            </p>
            <div className="section-text" dangerouslySetInnerHTML={{ __html: (about?.content || '').replace(/\n/g, '<br/>') }} />

            <div className="about-features">
              <div className="about-feature">
                <div className="feature-icon"><IconPray /></div>
                <div><strong>Authentic Worship</strong><p>Experience heartfelt worship that connects you to God.</p></div>
              </div>
              <div className="about-feature">
                <div className="feature-icon"><IconFamily /></div>
                <div><strong>Family Focused</strong><p>Programs for every age group to grow together in faith.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MINISTRIES ── */}
      <section id="ministries" className="public-section ministries-section">
        <div className="public-section-container">
          <div className="section-header">
            <span className="section-tag">What We Do</span>
            <h2>Our Programs</h2>
            <p className="section-header-subtitle">Serving our community through various ministries that meet spiritual and practical needs.</p>
          </div>
         <div className="ministries-grid">
  {[
    { Icon: IconChurch, title: 'Worship Service',     desc: 'Dynamic worship experiences that bring you closer to God every Sunday.',          color: '#2563eb' },
    { Icon: IconChild,  title: "Children's Church",   desc: 'Fun, engaging, and safe environment for kids to learn about Jesus.',              color: '#059669' },
    { Icon: IconFlame,  title: 'Youth Program',       desc: 'Empowering the next generation through mentorship and fellowship.',               color: '#d97706' },
    { Icon: IconHands,  title: 'Community Outreach',  desc: 'Serving our local community through food drives and support programs.',           color: '#dc2626' },
    { Icon: IconBook,   title: 'Bible Study',         desc: 'Deep dive into Scripture with small group discussions and teachings.',            color: '#7c3aed' },
    { Icon: IconMusic,  title: 'Choir & Music',       desc: 'Use your musical and spiritual gifts to lead the congregation in worship.',       color: '#db2777' },
  ].map((m) => (
    <div key={m.title} className="ministry-card" style={{ '--accent': m.color } as React.CSSProperties}>
      <div className="ministry-icon-wrap" style={{ background: m.color + '18', color: m.color }}>
        <span className="ministry-icon"><m.Icon /></span>
      </div>
      <h3>{m.title}</h3>
      <p>{m.desc}</p>
      <Link to="/login" className="ministry-link">
        Learn more
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </Link>
    </div>
  ))}
</div>
        </div>
      </section>

      {/* ── HERITAGE / FIVE SOLAS ── */}
<section id="heritage" className="public-section heritage-section">
  <div className="public-section-container heritage-container">
    <div className="section-header">
      <span className="section-tag heritage-tag">Our Heritage</span>
      <h2>The Five Solas</h2>
      <p className="section-header-subtitle">The foundational principles of the Lutheran Reformation that guide our faith.</p>
    </div>

    {/* Unified Container: Image + Solas Side by Side */}
    <div className="heritage-unified">
      {/* Left: Image */}
      <div className="heritage-unified-image">
        <img src="/images/five-solas.jpg" alt="The Five Solas" />
        <div className="heritage-unified-overlay">
          <IconStar />
          <span>Soli Deo Gloria</span>
        </div>
      </div>

      {/* Right: Solas Cards */}
      <div className="heritage-unified-solas">
        <h3 className="heritage-unified-title">What Are the Five Solas?</h3>
        <div className="solas-inline-grid">
          {[
            { Icon: IconBook,  latin: 'Sola Scriptura', english: 'Scripture Alone', verse: '2 Timothy 3:16-17', desc: 'The Bible alone is our highest authority — inspired, inerrant, and sufficient.', color: '#2563eb' },
            { Icon: IconCross, latin: 'Sola Fide',      english: 'Faith Alone',     verse: 'Romans 3:28',       desc: 'We are justified before God through faith in Jesus Christ alone.', color: '#059669' },
            { Icon: IconGift,  latin: 'Sola Gratia',    english: 'Grace Alone',     verse: 'Ephesians 2:8-9',   desc: 'Salvation is a gift of God\'s unmerited favor — we cannot earn it.', color: '#d97706' },
            { Icon: IconCrown, latin: 'Solus Christus', english: 'Christ Alone',    verse: 'Acts 4:12',          desc: 'Jesus Christ is the one mediator between God and humanity.', color: '#dc2626' },
            { Icon: IconStar,  latin: 'Soli Deo Gloria',english: 'Glory to God Alone',verse: 'Romans 11:36',    desc: 'All of life is to be lived for God\'s glory alone.', color: '#7c3aed' },
          ].map((sola) => (
            <div key={sola.latin} className="sola-inline-card" style={{ '--sola-color': sola.color } as React.CSSProperties}>
              <div className="sola-inline-accent" style={{ background: sola.color }} />
              <div className="sola-inline-icon" style={{ background: sola.color + '18', color: sola.color }}>
                <sola.Icon />
              </div>
              <div className="sola-inline-content">
                <h4 className="sola-inline-latin">{sola.latin}</h4>
                <span className="sola-inline-english" style={{ color: sola.color }}>{sola.english}</span>
                <span className="sola-inline-verse" style={{ color: sola.color }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  {sola.verse}
                </span>
                <p className="sola-inline-desc">{sola.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Quote */}
    <div className="heritage-quote">
      <div className="heritage-quote-icon"><IconCrossSmall /></div>
      <blockquote>The Five Solas are the pillars upon which our faith stands. They remind us that salvation is a work of God from beginning to end.</blockquote>
      <cite>— Bethel Anfo EECMY Congregation</cite>
    </div>
  </div>
</section>

      {/* ── CONTACT ── */}
      <section id="contact" className="public-section contact-section">
        <div className="public-section-container contact-layout">
          <div className="section-content">
            <span className="section-tag">Get In Touch</span>
            <h2>{contact?.title || "We'd Love to Hear From You"}</h2>
            <p className="section-subtitle">Reach out to us for prayer requests, questions, or just to say hello.</p>

            {/* Contact Cards */}
            <div className="contact-card">
  <div className="contact-card-icon"><IconPhone /></div>
  <div className="contact-card-text">
    <h4>Call Us</h4>
    <a href="tel:+251911111111" className="contact-link">+251 911 111 111</a>
  </div>
</div>
<div className="contact-card">
  <div className="contact-card-icon"><IconMail /></div>
  <div className="contact-card-text">
    <h4>Email Us</h4>
    <a href="mailto:bethelanfoeecmy@gmail.com" className="contact-link">bethelanfoeecmy@gmail.com</a>
  </div>
</div>
<div className="contact-card">
  <div className="contact-card-icon"><IconTelegram /></div>
  <div className="contact-card-text">
    <h4>Telegram</h4>
    <a href="https://t.me/EECMYBethelAnfoCongregation" target="_blank" rel="noopener noreferrer" className="contact-link">@EECMYBethelAnfo</a>
  </div>
</div>

            {/* Service Times */}
            <div className="service-times">
              <h3><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Service Times</h3>
              {[
                { day: 'Sunday Morning Worship', time: '4:00 AM – 6:30 AM', badge: 'Main' },
                { day: 'Sunday Youth Service',   time: '11:00 AM – 1:00 PM', badge: '' },
                { day: 'Wednesday Bible Study',  time: '11:00 AM – 1:00 PM', badge: '' },
                { day: 'Friday Fasting Prayer',  time: '4:00 AM – 7:00 PM', badge: '' },
              ].map(s => (<div key={s.day} className="service-time-item"><div><span className="day">{s.day}</span><span className="time">{s.time}</span></div>{s.badge && <span className="service-badge">{s.badge}</span>}</div>))}
            </div>
          </div>

          {/* Google Map — replaces the contact image */}
          <div className="contact-map-box">
            <iframe
              title="Church Location"
              src="https://www.google.com/maps?q=2M4Q%2BH6R%2C+Addis+Ababa&output=embed&z=16"
              width="100%"
              height="420"
              style={{ border: 0, borderRadius: '20px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href="https://www.google.com/maps/place/2M4Q+H6R,+Addis+Ababa" target="_blank" rel="noopener noreferrer" className="contact-map-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* ── DONATION ── */}
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
              <div className="donation-card-header"><div className="donation-card-icon-wrap"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div><h3>Bank Transfer</h3></div>
              <div className="bank-details">
                <div className="bank-item"><span className="bank-name">Commercial Bank of Ethiopia</span><span className="bank-account">1000123456789</span></div>
                <div className="bank-item"><span className="bank-name">Birhan Bank</span><span className="bank-account">0134567890123</span></div>
              </div>
            </div>
            <div className="donation-card featured">
              <div className="donation-card-header"><div className="donation-card-icon-wrap"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div><h3>TeleBirr</h3></div>
              <div className="telebirr-number"><span className="telebirr-label">Send to</span><span className="telebirr-value">+251 911 111 111</span></div>
              <p className="donation-note">Quick and easy mobile money transfer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-content">
          <span className="section-tag light">Join Us</span>
          <h2>Ready to Be Part of Our Community?</h2>
          <p>We'd love to welcome you. Come visit us this Sunday or join online.</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn primary">Get Started Today<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></Link>
            <a href="#contact" className="cta-btn outline">Contact Us</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
<footer className="public-footer">
  <div className="footer-wave">
    <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="#030d1e"/>
    </svg>
  </div>

  <div className="footer-content">
    {/* Brand Column */}
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
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <IconFacebook />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <IconYoutube />
        </a>
        <a href="https://t.me/EECMYBethelAnfoCongregation" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
          <IconTelegram />
        </a>
      </div>
    </div>

    {/* Quick Links */}
    <div className="footer-col">
      <h4>Quick Links</h4>
      <a href="#home">Home</a>
      <a href="#about">About Us</a>
      <a href="#ministries">Ministries</a>
      <a href="#heritage">Five Solas</a>
      <a href="#contact">Contact</a>
      <a href="#donation">Donate</a>
    </div>

    {/* Service Times */}
    <div className="footer-col">
      <h4>Service Times</h4>
      <div className="footer-service">
        <span>Sunday Morning</span>
        <span className="footer-time">3:00 AM – 7:00 AM</span>
      </div>
      <div className="footer-service">
        <span>Sunday Youth</span>
        <span className="footer-time">11:00 AM – 1:00 PM</span>
      </div>
      <div className="footer-service">
        <span>Wednesday Study</span>
        <span className="footer-time">11:00 AM – 1:00 PM</span>
      </div>
      <div className="footer-service">
        <span>Friday Prayer</span>
        <span className="footer-time">4:00 AM – 7:00 PM</span>
      </div>
    </div>

    {/* Contact Info */}
    <div className="footer-col">
      <h4>Contact</h4>
      <span>
        <IconPin />
        Addis Ababa, Bethel 40 Meter
      </span>
      <a href="tel:+251911111111" className="footer-contact-link">
        <IconPhone />
        +251 911 111 111
      </a>
      <a href="mailto:bethelanfoeecmy@gmail.com" className="footer-contact-link">
        <IconMail />
        bethelanfoeecmy@gmail.com
      </a>
      <a href="https://t.me/EECMYBethelAnfoCongregation" target="_blank" rel="noopener noreferrer" className="footer-contact-link">
        <IconTelegram />
        Telegram Channel
      </a>
    </div>
  </div>

  <div className="footer-bottom">
    <p>© {new Date().getFullYear()} <strong>Bethel Church</strong>. All rights reserved. Soli Deo Gloria.</p>
  </div>
</footer>
    </div>
  );
}