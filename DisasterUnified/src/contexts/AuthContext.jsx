import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (role, userData) => {
    try {
      // For demo purposes, we'll create a mock session
      // In production, this would integrate with Supabase Auth
      const mockSession = {
        user: {
          id: userData.email || 'demo-user',
          email: userData.email,
          name: userData.name,
        },
        role: role,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      }
      
      setSession(mockSession)
      return { data: { session: mockSession }, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return { data: { session: null }, error }
    }
  }

  const logout = async () => {
    try {
      setSession(null)
      return { error: null }
    } catch (error) {
      console.error('Logout error:', error)
      return { error }
    }
  }

  const signup = async (email, password, userData) => {
    try {
      // For demo purposes, we'll create a mock session
      // In production, this would integrate with Supabase Auth
      const mockSession = {
        user: {
          id: email,
          email: email,
          name: userData.name,
        },
        role: userData.role || 'public',
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      }
      
      setSession(mockSession)
      return { data: { session: mockSession }, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: { session: null }, error }
    }
  }

  const value = {
    session,
    loading,
    login,
    logout,
    signup,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
