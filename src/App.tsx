import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireRole } from './components/RequireRole';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { MembersPage } from './pages/MembersPage';
import { PlacesPage } from './pages/PlacesPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { BadgesPage } from './pages/BadgesPage';
import { WeightConfigsPage } from './pages/WeightConfigsPage';
import { AdminsPage } from './pages/AdminsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/members" replace />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="places" element={<PlacesPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="weight-configs" element={<WeightConfigsPage />} />
            <Route
              path="admins"
              element={
                <RequireRole roles={['SUPER_ADMIN']}>
                  <AdminsPage />
                </RequireRole>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
