import { createClient } from '@supabase/supabase-js'

// ⬇️ Get these from your Supabase dashboard
const supabaseUrl = "https://frzhnvkojtiuvwvgqiui.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyemhudmtvanRpdXZ3dmdxaXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTU1NDYsImV4cCI6MjA3MzY5MTU0Nn0.UgZIXvqeRd5_6zVAAqvb9vecdoJKxOZ_R_dCbNNzMe8"

export const supabase = createClient(supabaseUrl, supabaseKey)
