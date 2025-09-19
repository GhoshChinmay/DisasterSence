import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Simple UUID generator for mock users
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true) // Start with loading = true

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedSession = localStorage.getItem('session')
        if (storedSession) {
          const parsed = JSON.parse(storedSession)
          // Validate UUID format
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          if (parsed.user?.id && uuidPattern.test(parsed.user.id)) {
            setSession(parsed)
          } else {
            // Clear invalid session
            localStorage.removeItem('session')
            setSession(null)
          }
        } else {
          setSession(null)
        }
      } catch {
        localStorage.removeItem('session')
        setSession(null)
      } finally {
        setLoading(false) // Always set loading to false after initialization
      }
    }
    
    initializeAuth()
  }, [])

  const login = async (role, userData) => {
    setLoading(true)
    try {
      // Check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email)
        .eq('role', role)
        .single()

      let user
      if (existingUser && !fetchError) {
        user = existingUser
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([
            {
              name: userData.name || userData.email,
              email: userData.email,
              role: role,
            },
          ])
          .select()
          .single()

        if (createError) {
          console.error('Error creating user:', createError)
          // Fallback to mock user if database fails
          user = {
            id: generateUUID(),
            name: userData.name || userData.email,
            email: userData.email,
            role: role,
          }
        } else {
          user = newUser
        }
      }

      const sessionData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        role: user.role,
        timestamp: Date.now(),
      }

      localStorage.setItem('session', JSON.stringify(sessionData))
      setSession(sessionData)
      return sessionData
    } catch (error) {
      console.error('Login error:', error)
      // Create fallback mock user if database completely fails
      const mockUser = {
        id: generateUUID(),
        name: userData.name || userData.email,
        email: userData.email,
        role: role,
      }
      
      const sessionData = {
        user: mockUser,
        role: mockUser.role,
        timestamp: Date.now(),
      }
      
      localStorage.setItem('session', JSON.stringify(sessionData))
      setSession(sessionData)
      return sessionData
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('session')
    setSession(null)
  }

  const value = {
    session,
    login,
    logout,
    loading,
    isAuthenticated: !!session,
    userId: session?.user?.id,
    userRole: session?.user?.role,
    userName: session?.user?.name,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
