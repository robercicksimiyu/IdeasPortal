import { Tables } from "@/app/ideas-portal-data-types"
import { createServerClient } from "./supabase"


export async function createOrUpdateUser(zohoUser: {
  zoho_id: string
  email: string
  name: string
  country?: string
}): Promise<Tables<"users">> {
  const supabase = createServerClient()

  // Validate required fields
  console.log("Create Database function:", zohoUser);
  // Check if user exists
  const { data: existingUser } = await supabase.from("users").select("*").eq("zoho_id", zohoUser.zoho_id).single()

  console.log("Exisisting user:", zohoUser);

  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from("users")
      .update({
        email: zohoUser.email,
        name: zohoUser.name,
      })
      .eq("zoho_id", zohoUser.zoho_id)
      .select()
      .single()

    if (error) throw error
    return data as Tables<"users">
  } else {
    // Create new user with default role
    const { data, error } = await supabase
      .from("users")
      .insert({
        zoho_id: zohoUser.zoho_id,
        email: zohoUser.email,
        name: zohoUser.name,
        role: "Initiator",
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        country: zohoUser.country || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as Tables<"users">
  }
}

export async function getUserByZohoId(zohoId: string): Promise<Tables<"users"> | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("users").select("*").eq("zoho_id", zohoId).single()

  if (error && error.code !== "PGRST116") throw error
  return data as Tables<"users"> | null
}

export async function getUserById(userId: number): Promise<Tables<"users"> | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error && error.code !== "PGRST116") throw error
  return data as Tables<"users"> | null
}

export async function updateUserRole(userId: number, role: string): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("users")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) throw error
}
