import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/shared/Toast';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/logs"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <LogsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <LeaderboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ProfilePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SettingsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
