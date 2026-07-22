import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import Territory from './pages/Territory';
import Records from './pages/Records';
import Users from './pages/Users';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout><Schedule /></Layout></ProtectedRoute>} />
          <Route path="/territory" element={<ProtectedRoute><Layout><Territory /></Layout></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute adminOnly><Layout><Records /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute adminOnly><Layout><Users /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
