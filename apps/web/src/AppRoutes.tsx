import { Navigate, Route, Routes } from 'react-router';
import { GuestRoute } from './features/auth/GuestRoute';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { StatusPage } from './pages/StatusPage';

/** Every URL in the app. The router itself is provided by the caller (browser or tests). */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/status" element={<StatusPage />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
