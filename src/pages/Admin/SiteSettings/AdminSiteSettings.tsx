import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { getSiteSettings, updateSiteSetting } from '../../../services/siteSettingsService';
import './AdminSiteSettings.css';

interface SiteSetting {
  section: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string | null;
}

const sectionIcons: Record<string, string> = {
  about: '🏛️',
  contact: '📞',
  donation: '💝',
};

const sectionColors: Record<string, string> = {
  about: '#3b82f6',
  contact: '#10b981',
  donation: '#f59e0b',
};

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    setLoading(true);
    const { data } = await getSiteSettings();
    if (data) setSettings(data);
    setLoading(false);
  }

  function openEdit(section: SiteSetting) {
    setEditingSection(section.section);
    setFormTitle(section.title);
    setFormSubtitle(section.subtitle || '');
    setFormContent(section.content);
  }

  async function handleSave() {
    if (!editingSection) return;
    if (!formTitle.trim()) {
      setMessage('⚠️ Title is required');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setSaving(true);
    const { error } = await updateSiteSetting(editingSection, {
      title: formTitle,
      subtitle: formSubtitle,
      content: formContent,
    });
    setSaving(false);
    if (error) {
      setMessage('❌ Failed to update section');
      setMessageType('error');
    } else {
      setEditingSection(null);
      setMessage('✅ Section updated successfully');
      setMessageType('success');
    }
    setTimeout(() => setMessage(''), 3000);
    loadSettings();
  }

  function getPreviewContent(content: string, maxLength: number = 120) {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  }

  if (loading) {
    return (
      <Layout>
        <div className="site-settings-page">
          <div className="settings-skeleton">
            {[1, 2, 3].map(i => (
              <div key={i} className="settings-skeleton-card">
                <div className="skeleton-line medium" />
                <div className="skeleton-line full" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="site-settings-page">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-content">
            <div>
              <h1>Site Settings</h1>
              <p>Customize the content displayed on your public website</p>
            </div>
            <div className="settings-header-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Public Website
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`settings-toast ${messageType}`}>
            {message}
          </div>
        )}

        {/* Quick Info */}
        <div className="settings-info-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Changes made here will appear on your public website immediately.</span>
        </div>

        {/* Settings Cards */}
        <div className="settings-cards-grid">
          {settings.map((s) => (
            <div key={s.section} className="settings-card">
              {/* Card Header */}
              <div className="settings-card-header" style={{ borderLeftColor: sectionColors[s.section] || '#3b82f6' }}>
                <div className="settings-card-icon" style={{ background: (sectionColors[s.section] || '#3b82f6') + '15', color: sectionColors[s.section] }}>
                  {sectionIcons[s.section] || '📄'}
                </div>
                <div className="settings-card-title-area">
                  <h3 className="settings-card-title">
                    {s.section.charAt(0).toUpperCase() + s.section.slice(1)} Section
                  </h3>
                  <span className="settings-card-badge" style={{ color: sectionColors[s.section] }}>
                    {s.section === 'about' ? 'Homepage' : s.section === 'contact' ? 'Footer' : 'Giving'}
                  </span>
                </div>
                <button className="settings-edit-btn" onClick={() => openEdit(s)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              </div>

              {/* Card Preview */}
              <div className="settings-card-body">
                <div className="settings-field">
                  <span className="settings-field-label">Title</span>
                  <span className="settings-field-value">{s.title}</span>
                </div>
                {s.subtitle && (
                  <div className="settings-field">
                    <span className="settings-field-label">Subtitle</span>
                    <span className="settings-field-value secondary">{s.subtitle}</span>
                  </div>
                )}
                <div className="settings-field">
                  <span className="settings-field-label">Content</span>
                  <span className="settings-field-value content-preview">
                    {getPreviewContent(s.content)}
                  </span>
                </div>
                {s.image_url && (
                  <div className="settings-image-preview">
                    <span className="settings-field-label">Image</span>
                    <img src={s.image_url} alt={s.section} />
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="settings-card-footer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Last updated: Today</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="modal-overlay" onClick={() => setEditingSection(null)}>
          <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="settings-modal-header" style={{ background: (sectionColors[editingSection] || '#3b82f6') + '08' }}>
              <div className="settings-modal-icon" style={{ background: (sectionColors[editingSection] || '#3b82f6') + '15', color: sectionColors[editingSection] }}>
                {sectionIcons[editingSection] || '📄'}
              </div>
              <div>
                <h3>Edit {editingSection.charAt(0).toUpperCase() + editingSection.slice(1)} Section</h3>
                <p>Update the content displayed on your public website</p>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingSection(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <div className="settings-modal-form">
              <div className="form-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
                  </svg>
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Section title"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  Subtitle (optional)
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Brief subtitle"
                />
              </div>
              <div className="form-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
                  </svg>
                  Content
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the section content here..."
                  rows={8}
                />
                <span className="form-hint">
                  {formContent.length} characters · Use line breaks for separate paragraphs
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="settings-modal-actions">
              <button className="btn-cancel" onClick={() => setEditingSection(null)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-small" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}