import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getMyTeam } from '../../../services/teamService';
import { getTeamJoinRequests, updateJoinRequest } from '../../../services/joinRequestService';
import { getInitials, formatDate } from '../../../utils/helpers';
import './LeaderRequests.css';

interface JoinRequest {
  id: string; user_id: string; team_id: string; created_at: string;
  profiles: { full_name: string; phone?: string; gender?: string };
}

export default function LeaderRequests() {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    setError(false);
    try {
      const { data: team } = await getMyTeam(user!.id);
      if (team) {
        setTeamName(team.name);
        const { data } = await getTeamJoinRequests(team.id);
        if (data) setRequests(data as unknown as JoinRequest[]);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  async function handleAction(req: JoinRequest, status: 'approved' | 'rejected') {
    setProcessing(req.id);
    await updateJoinRequest(req.id, status, req.user_id, req.team_id);
    setProcessing(null);
    setMessage(status === 'approved' ? `✅ ${req.profiles.full_name} has been approved` : `❌ ${req.profiles.full_name} has been rejected`);
    setTimeout(() => setMessage(''), 3000);
    loadData();
  }

  if (error) {
    return (
      <Layout>
        <div className="leader-page">
          <div className="page-header"><h1>Join Requests</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load requests</p>
            <button className="btn btn-primary" onClick={loadData}>Try Again</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="leader-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1>Join Requests</h1>
              <p>Review membership requests for <strong>{teamName || 'your team'}</strong></p>
            </div>
            {requests.length > 0 && (
              <span className="requests-pending-badge">{requests.length} pending</span>
            )}
          </div>
        </div>

        {/* Message */}
        {message && <div className="toast-message">{message}</div>}

        {/* Requests */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Pending Requests</h2>
            <span className="badge-count">{requests.length} waiting</span>
          </div>

          {loading ? (
            <div className="requests-skeleton">
              {[1,2,3].map(i => (
                <div key={i} className="request-skeleton-item">
                  <div className="skeleton-circle" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line xshort" />
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>All Caught Up!</h3>
              <p>No pending join requests at the moment.</p>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map((req) => (
                <div key={req.id} className="request-card">
                  <div className="request-card-body">
                    <div className="request-avatar">
                      {getInitials(req.profiles.full_name)}
                    </div>
                    <div className="request-info">
                      <h3 className="request-name">{req.profiles.full_name}</h3>
                      <div className="request-meta">
                        {req.profiles.gender && (
                          <span className={`gender-badge ${req.profiles.gender}`}>
                            {req.profiles.gender === 'male' ? '♂ Male' : req.profiles.gender === 'female' ? '♀ Female' : ''}
                          </span>
                        )}
                        {req.profiles.phone && (
                          <a href={`tel:${req.profiles.phone}`} className="request-phone">
                            {req.profiles.phone}
                          </a>
                        )}
                        <span className="request-date">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                          {formatDate(req.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn btn-approve"
                      disabled={processing === req.id}
                      onClick={() => handleAction(req, 'approved')}
                    >
                      {processing === req.id ? (
                        <span className="spinner-small" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      Approve
                    </button>
                    <button
                      className="btn btn-reject"
                      disabled={processing === req.id}
                      onClick={() => handleAction(req, 'rejected')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}