import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import GovernmentDashboard from './components/GovernmentDashboard'
import NGODashboard from './components/NGODashboard'
import FirstResponderDashboard from './components/FirstResponderDashboard'
import PublicDashboard from './components/PublicDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { supabase } from './supabaseClient' // <-- Make sure this file exists and is configured

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-300">
          <p className="font-semibold">Something went wrong.</p>
          <pre className="mt-2 text-xs whitespace-pre-wrap">{String(this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from("users").select("*")
      if (error) {
        console.error("❌ Connection failed:", error)
      } else {
        console.log("✅ Connection successful. Users:", data)
      }
    }
    testConnection()
  }, [])

  return (
    <AuthProvider>
      <Router>
        <div className="antialiased bg-black text-gray-100">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard/gov" element={
                <ProtectedRoute requiredRole="gov">
                  <GovernmentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/ngo" element={
                <ProtectedRoute requiredRole="ngo">
                  <NGODashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/responder" element={
                <ProtectedRoute requiredRole="fr">
                  <FirstResponderDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/public" element={
                <ProtectedRoute requiredRole="public">
                  <PublicDashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App