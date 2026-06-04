import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getCurrentProfile, updateProfile } from '../../services/authService';
import '../Admin/AdminDashboard.css';

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

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [emergency, setEmergency] = useState('');
  const [language, setLanguage] = useState('en');

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    setLoading(true);
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
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await updateProfile(user.id, {
      full_name: fullName,
      phone,
      gender,
      address,
      emergency_contact: emergency,
      preferred_language: language,
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) return <Layout><div className="loading-state">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="admin-page" style={{ maxWidth: '600px' }}>
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Update your personal information</p>
        </div>

        <div className="section-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#0f3460', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
              {fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{fullName}</div>
              <div style={{ color: '#888', fontSize: '0.875rem' }}>{user?.email}</div>
            </div>
          </div>

          {success && (
            <div style={{ background: '#eafaf1', border: '1px solid #2ecc71', color: '#27ae60', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>
              ✅ Profile updated successfully!
            </div>
          )}

          <div className="modal-form">
            {[
              { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'Your full name', type: 'text' },
              { label: 'Phone Number', value: phone, setter: setPhone, placeholder: '+251 9XX XXX XXX', type: 'text' },
              { label: 'Address', value: address, setter: setAddress, placeholder: 'Your address', type: 'text' },
              { label: 'Emergency Contact', value: emergency, setter: setEmergency, placeholder: 'Emergency contact number', type: 'text' },
            ].map((field) => (
              <div key={field.label} className="form-group">
                <label>{field.label}</label>
                <input type={field.type} value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder} />
              </div>
            ))}

            <div className="form-group">
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="am">አማርኛ (Amharic)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: '140px' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}