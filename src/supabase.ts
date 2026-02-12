import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vdrpfrbarutwnomajrdv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcnBmcmJhcnV0d25vbWFqcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjczODAsImV4cCI6MjA4NjQwMzM4MH0.HL1BK0j0cIKeQMoMsb3I7EYgxPTDI2Tzhq4JnbQLpbI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
