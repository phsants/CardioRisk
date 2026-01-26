import React from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from '@root/Layout'
import Home from '@root/Pages/Home'
import NewAssessment from '@root/Pages/NewAssessment'
import History from '@root/Pages/History'
import Guidelines from '@root/Pages/Guidelines'
import Login from './pages/Login'
import UserNotRegisteredError from '@/components/UserNotRegisteredError'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const location = useLocation()
  const { user } = useAuth()
  
  // Extrai o nome da página da rota
  const getPageName = () => {
    const path = location.pathname
    if (path === '/' || path === '/home') return 'Home'
    if (path === '/new-assessment') return 'NewAssessment'
    if (path === '/history') return 'History'
    if (path === '/guidelines') return 'Guidelines'
    return 'Home'
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/home" replace />} 
      />
      <Route
        path="/*"
        element={
          <Layout currentPageName={getPageName()}>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/new-assessment" element={<ProtectedRoute><NewAssessment /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/guidelines" element={<ProtectedRoute><Guidelines /></ProtectedRoute>} />
              <Route path="*" element={<UserNotRegisteredError />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  )
}

export default App

