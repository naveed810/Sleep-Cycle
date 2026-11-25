import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SleepDataProvider } from './context/SleepDataContext';
import { SoundPlayerProvider } from './context/SoundPlayerContext';
import { AlarmProvider } from './context/AlarmContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TrackingPage } from './pages/TrackingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlarmPage } from './pages/AlarmPage';
import { SoundsPage } from './pages/SoundsPage';
import { CoachPage } from './pages/CoachPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <AuthProvider>
      <SleepDataProvider>
        <SoundPlayerProvider>
          <AlarmProvider>
            <HashRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/tracking" element={<TrackingPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/alarm" element={<AlarmPage />} />
                  <Route path="/sounds" element={<SoundsPage />} />
                  <Route path="/coach" element={<CoachPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </HashRouter>
          </AlarmProvider>
        </SoundPlayerProvider>
      </SleepDataProvider>
    </AuthProvider>
  );
}

export default App;
