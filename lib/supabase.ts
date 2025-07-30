import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for API routes
export const createServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Database types
export interface User {
  id: number
  zoho_id: string
  email: string
  name: string
  role: string
  department?: string
  country?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Idea {
  id: number
  idea_number: string
  subject: string
  description: string
  country: string
  department: string
  workflow_version: string
  expected_benefit?: string
  implementation_effort?: string
  priority: string
  status: string
  current_step: string
  vote_count: number
  submitter_id: number
  assigned_to?: number
  created_at: string
  updated_at: string
  submitter_name?: string
  assigned_name?: string
}

export interface WorkflowStep {
  id: number
  idea_id: number
  step_name: string
  assigned_role: string
  assigned_user_id?: number
  status: string
  action_taken?: string
  comments?: string
  score?: number
  completed_at?: string
  created_at: string
}
