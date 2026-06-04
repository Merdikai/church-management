import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { getMyTeam } from '../../../services/teamService';
import { getTeamFeedback } from '../../../services/feedbackService';
import { getInitials, formatDate } from '../../../utils/helpers';
import './LeaderFeedback.css';

interface Feedback {
  id: string; message: string; created_at: string;
  profiles: { full_name: string };
}

export default function LeaderFeedback() {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    setError(false);
    try {
      const { data: team } = await getMyTeam(user!.id);
      if (team) {
        setTeamName(team.name);
        const { data } = await getTeamFeedback(team.id);
        if (data) setFeedback(data as unknown as Feedback[]);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  if (error) {
    return (
      <Layout>
        <div className="leader-page">
          <div className="page-header"><h1>Team Feedback</h1></div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>Could not load feedback</p>
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
              <h1>Team Feedback</h1>
              <p>Read feedback from members about <strong>{teamName || 'your team'}</strong></p>
            </div>
            {feedback.length > 0 && (
              <span className="feedback-count-badge">{feedback.length} messages</span>
            )}
          </div>
        </div>

        {/* Feedback List */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Messages</h2>
            <span className="badge-count">{feedback.length} total</span>
          </div>

          {loading ? (
            <div className="feedback-skeleton">
              {[1,2,3].map(i => (
                <div key={i} className="feedback-skeleton-item">
                  <div className="skeleton-circle" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line full" />
                  </div>
                </div>
              ))}
            </div>
          ) : feedback.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>No Feedback Yet</h3>
              <p>Feedback from church members about your team will appear here.</p>
            </div>
          ) : (
            <div className="feedback-list">
              {feedback.map((f) => {
                const isExpanded = expandedId === f.id;
                const isLong = f.message.length > 200;
                return (
                  <div key={f.id} className={`feedback-card ${isExpanded ? 'expanded' : ''}`}>
                    <div className="feedback-card-header">
                      <div className="feedback-author">
                        <div className="feedback-avatar">
                          {getInitials(f.profiles.full_name)}
                        </div>
                        <div className="feedback-author-info">
                          <h3 className="feedback-author-name">{f.profiles.full_name}</h3>
                          <span className="feedback-date">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            {formatDate(f.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="feedback-sentiment">
                        <span className="sentiment-icon">💬</span>
                      </div>
                    </div>

                    <div className="feedback-body">
                      <p className={`feedback-message ${!isExpanded && isLong ? 'clamped' : ''}`}>
                        {f.message}
                      </p>
                      {isLong && (
                        <button
                          className="feedback-expand-btn"
                          onClick={() => toggleExpand(f.id)}
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    <div className="feedback-card-footer">
                      <span className="feedback-team-tag">{teamName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}