import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import Admin from './pages/Admin';
import ChatBot from './components/ChatBot';
import CityBackground from './CityBackground';
import Contact from './pages/Contact';
import Guilds from './pages/Guilds';
import Layout from './components/Layout';
import WorkerDashboard from './pages/WorkerDashboard';
import MapView from './pages/MapView';

// ✅ Protects any route that requires login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ✅ Protects admin-only routes — redirects non-admins to dashboard instantly (no flash)
function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CityBackground />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <ChatBot />
          <Routes>
            {/* Public routes — no Layout */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — with Layout (sidebar + navbar) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/map" element={
            <ProtectedRoute>
              <Layout><MapView /></Layout>
            </ProtectedRoute>
          } />
            <Route path="/report" element={
              <ProtectedRoute>
                <Layout><ReportIssue /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/guilds" element={
              <ProtectedRoute>
                <Layout><Guilds /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/worker" element={
              <ProtectedRoute>
                <Layout><WorkerDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/contact" element={
              <ProtectedRoute>
                <Layout><Contact /></Layout>
              </ProtectedRoute>
            } />

            {/* Admin only route — with Layout */}
            <Route path="/admin" element={
              <AdminRoute>
                <Layout><Admin /></Layout>
              </AdminRoute>
            } />

            {/* Catch-all — redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}



export default App;