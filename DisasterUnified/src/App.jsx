import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { supabase } from './utils/supabaseClient'

// Pages
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Live from './pages/Live'
import Predict from './pages/Predict'

// Error Boundary Component
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
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-4">An error occurred while loading the application.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-500 text-black rounded-lg hover:bg-teal-400 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  useEffect(() => {
    // Test Supabase connection on app start
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*').limit(1)
        if (error) {
          console.error('❌ Supabase connection failed:', error)
        } else {
          console.log('✅ Supabase connection successful')
        }
      } catch (error) {
        console.error('❌ Connection test error:', error)
      }
    }

    testConnection()
  }, [])

  return (
    <AuthProvider>
      <Router>
        <div className="antialiased bg-black text-gray-100 min-h-screen">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live" element={<Live />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
