// ==========================================
// EcoSphere AI — Main App with Routing
// ==========================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { GamificationProvider } from './providers/GamificationProvider';
import { DataProvider } from './providers/DataProvider';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import AICoachPage from './pages/AICoachPage';
import TimelinePage from './pages/TimelinePage';
import GoalsPage from './pages/GoalsPage';
import ChallengesPage from './pages/ChallengesPage';
import CommunityPage from './pages/CommunityPage';
import MapPage from './pages/MapPage';
import MarketplacePage from './pages/MarketplacePage';
import ScannerPage from './pages/ScannerPage';
import OffsetPage from './pages/OffsetPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import EcoCityPage from './pages/EcoCityPage';
import HomeEnergyPage from './pages/HomeEnergyPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="calculator" element={<CalculatorPage />} />
        <Route path="ai-coach" element={<AICoachPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="challenges" element={<ChallengesPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="scanner" element={<ScannerPage />} />
        <Route path="offset" element={<OffsetPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="ecocity" element={<EcoCityPage />} />
        <Route path="home-energy" element={<HomeEnergyPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <GamificationProvider>
              <DataProvider>
                <AppRoutes />
              </DataProvider>
            </GamificationProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
