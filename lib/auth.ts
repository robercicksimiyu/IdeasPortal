import { sql } from "./db"
import type { User } from "./db"

export async function createOrUpdateUser(zohoUser: {
  id: string
  email: string
  name: string
  department?: string
  country?: string
}): Promise<User> {
  const existingUser = await sql`
    SELECT * FROM users WHERE zoho_id = ${zohoUser.id}
  `

  if (existingUser.length > 0) {
    // Update existing user
    const updated = await sql`
      UPDATE users 
      SET email = ${zohoUser.email}, 
          name = ${zohoUser.name},
          department = ${zohoUser.department || null},
          country = ${zohoUser.country || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE zoho_id = ${zohoUser.id}
      RETURNING *
    `
    return updated[0] as User
  } else {
    // Create new user with default role
    const created = await sql`
      INSERT INTO users (zoho_id, email, name, role, department, country)
      VALUES (${zohoUser.id}, ${zohoUser.email}, ${zohoUser.name}, 'Initiator', ${zohoUser.department || null}, ${zohoUser.country || null})
      RETURNING *
    `
    return created[0] as User
  }
}

export async function getUserByZohoId(zohoId: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE zoho_id = ${zohoId}
  `
  return result.length > 0 ? (result[0] as User) : null
}

export async function updateUserRole(userId: number, role: string): Promise<void> {
  await sql`
    UPDATE users 
    SET role = ${role}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
  `
}
