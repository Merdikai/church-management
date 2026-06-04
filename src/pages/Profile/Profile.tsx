import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getCurrentProfile, updateProfile } from '../../services/authService';
import { getInitials } from '../../utils/helpers';
import './Profile.css';

interface Profile {
  id: string; full_name: string; phone?: string;
  gender?: string; address?: string; preferred_language?: string;
  emergency_contact?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'emergency' | 'security'>('personal');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [emergency, setEmergency] = useState('');
  const [language, setLanguage] = useState('en');

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await getCurrentProfile();
      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setGender(data.gender ?? '');
        setAddress(data.address ?? '');
        setEmergency(data.emergency_contact ?? '');
        setLanguage(data.preferred_language ?? 'en');
      }
    } catch {
      setError('Failed to load profile');
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateProfile(user.id, {
        full_name: fullName,
        phone,
        gender,
        address,
        emergency_contact: emergency,
        preferred_language: language,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to update profile');
    }
    setSaving(false);
  }

  const initials = getInitials(fullName || user?.email || 'User');
  const completionPercentage = [fullName, phone, address, emergency].filter(Boolean).length / 4 * 100;

  if (loading) {
    return (
      <Layout>
        <div className="profile-page">
          <div className="profile-loading">
            <div className="profile-skeleton-avatar" />
            <div className="profile-skeleton-line" />
            <div className="profile-skeleton-line short" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-page">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <h1>My Profile</h1>
            <p>Manage your personal information and account settings</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {initials}
              </div>
              <div className="profile-avatar-status" />
            </div>
            <div className="profile-avatar-info">
              <h2>{fullName || 'Your Name'}</h2>
              <span className="profile-email">{user?.email}</span>
              <div className="profile-completion">
                <div className="profile-completion-bar">
                  <div className="profile-completion-fill" style={{ width: `${completionPercentage}%` }} />
                </div>
                <span className="profile-completion-text">{Math.round(completionPercentage)}% complete</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="profile-message success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="profile-message error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Personal Info
            </button>
            <button
              className={`profile-tab ${activeTab === 'emergency' ? 'active' : ''}`}
              onClick={() => setActiveTab('emergency')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Emergency
            </button>
            <button
              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Preferences
            </button>
          </div>

          {/* Form */}
          <div className="profile-form">
            {activeTab === 'personal' && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Your full address"
                    rows={3}
                  />
                </div>
              </>
            )}

            {activeTab === 'emergency' && (
              <>
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input
                    type="text"
                    value=""
                    readOnly
                    placeholder="Coming soon"
                  />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Number</label>
                  <input
                    type="text"
                    value={emergency}
                    onChange={(e) => setEmergency(e.target.value)}
                    placeholder="Emergency contact number"
                  />
                </div>
                <div className="form-group">
                  <label>Relationship</label>
                  <select defaultValue="">
                    <option value="" disabled>Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <div className="form-group">
                  <label>Preferred Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="am">አማርኛ (Amharic)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="readonly-input"
                  />
                  <span className="form-hint">Contact admin to change your email</span>
                </div>
                <div className="form-group">
                  <label>Account Created</label>
                  <input
                    type="text"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                    readOnly
                    className="readonly-input"
                  />
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button className="btn btn-secondary" onClick={loadProfile}>
              Reset
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}