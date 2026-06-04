import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import Dashboard from '../pages/Dashboard/Dashboard';

import AdminRoles from '../pages/Admin/Roles/AdminRoles';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminMembers from '../pages/Admin/Members/AdminMembers';
import AdminTeams from '../pages/Admin/Teams/AdminTeams';
import AdminAnnouncements from '../pages/Admin/Announcements/AdminAnnouncements';
import AdminEvents from '../pages/Admin/Events/AdminEvents';
import AdminReports from '../pages/Admin/Reports/AdminReports';

import TeamLeaderDashboard from '../pages/TeamLeader/TeamLeaderDashboard';
import LeaderMembers from '../pages/TeamLeader/Members/LeaderMembers';
import LeaderAnnouncements from '../pages/TeamLeader/Announcements/LeaderAnnouncements';
import LeaderRequests from '../pages/TeamLeader/Requests/LeaderRequests';
import LeaderFeedback from '../pages/TeamLeader/Feedback/LeaderFeedback';

import MemberDashboard from '../pages/Member/MemberDashboard';
import MemberTeams from '../pages/Member/Teams/MemberTeams';
import MemberAnnouncements from '../pages/Member/Announcements/MemberAnnouncements';
import MemberEvents from '../pages/Member/Events/MemberEvents';
import MemberPrayer from '../pages/Member/Prayer/MemberPrayer';

import ProfilePage from '../pages/Profile/Profile';
import NotificationsPage from '../pages/Notifications/Notifications';
import Home from '../pages/Home/Home';
import NotFound from '../pages/NotFound/NotFound';

export default function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading && session === null) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        color: '#0f3460'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Role router */}
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />

        {/* Admin */}
        <Route path="/admin" element={session ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/members" element={session ? <AdminMembers /> : <Navigate to="/login" />} />
        <Route path="/admin/teams" element={session ? <AdminTeams /> : <Navigate to="/login" />} />
        <Route path="/admin/roles" element={session ? <AdminRoles /> : <Navigate to="/login" />} />
        <Route path="/admin/announcements" element={session ? <AdminAnnouncements /> : <Navigate to="/login" />} />
        <Route path="/admin/events" element={session ? <AdminEvents /> : <Navigate to="/login" />} />
        <Route path="/admin/reports" element={session ? <AdminReports /> : <Navigate to="/login" />} />

        {/* Leader */}
        <Route path="/leader" element={session ? <TeamLeaderDashboard /> : <Navigate to="/login" />} />
        <Route path="/leader/members" element={session ? <LeaderMembers /> : <Navigate to="/login" />} />
        <Route path="/leader/announcements" element={session ? <LeaderAnnouncements /> : <Navigate to="/login" />} />
        <Route path="/leader/requests" element={session ? <LeaderRequests /> : <Navigate to="/login" />} />
        <Route path="/leader/feedback" element={session ? <LeaderFeedback /> : <Navigate to="/login" />} />

        {/* Member */}
        <Route path="/member" element={session ? <MemberDashboard /> : <Navigate to="/login" />} />
        <Route path="/member/teams" element={session ? <MemberTeams /> : <Navigate to="/login" />} />
        <Route path="/member/announcements" element={session ? <MemberAnnouncements /> : <Navigate to="/login" />} />
        <Route path="/member/events" element={session ? <MemberEvents /> : <Navigate to="/login" />} />
        <Route path="/member/prayer" element={session ? <MemberPrayer /> : <Navigate to="/login" />} />

        {/* Shared */}
        <Route path="/profile" element={session ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={session ? <NotificationsPage /> : <Navigate to="/login" />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}