import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Pages
import LandingPage from './pages/public/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import ResumePage from './pages/resume/ResumePage.jsx';
import InterviewSetupPage from './pages/interview/InterviewSetupPage.jsx';
import InterviewRoomPage from './pages/interview/InterviewRoomPage.jsx';
import InterviewHistoryPage from './pages/interview/InterviewHistoryPage.jsx';
import InterviewReportPage from './pages/interview/InterviewReportPage.jsx';
import AnalyticsPage from './pages/analytics/AnalyticsPage.jsx';

export const App = () => {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/setup"
              element={
                <ProtectedRoute>
                  <InterviewSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/room/:interviewId"
              element={
                <ProtectedRoute>
                  <InterviewRoomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/report/:interviewId"
              element={
                <ProtectedRoute>
                  <InterviewReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/history"
              element={
                <ProtectedRoute>
                  <InterviewHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
