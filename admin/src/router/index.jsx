import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdManagement from '../pages/AdManagement';
import TrafficManagement from '../pages/TrafficManagement';
import Stats from '../pages/Stats';
import VisitorStats from '../pages/VisitorStats';
import DomainManagement from '../pages/DomainManagement';
import Login from '../pages/Login';
import { useAuthStore } from '../stores/auth';

function ProtectedRoute({ children }) {
  const isAuthed = useAuthStore(state => Boolean(state.token))
  if (!isAuthed) return <Navigate to="/login" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TrafficManagement />} />
        <Route path="traffic" element={<TrafficManagement />} />
        <Route path="ads" element={<AdManagement />} />
        <Route path="domains" element={<DomainManagement />} />
        <Route path="stats" element={<Stats />} />
        <Route path="visitor-stats" element={<VisitorStats />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
