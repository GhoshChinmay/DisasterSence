import { createClient } from '@supabase/supabase-js'

// Supabase configuration - these values should be loaded from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your_supabase_url_here'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your_supabase_key_here'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    } else {
      console.log('✅ Supabase connection successful')
      return true
    }
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}
